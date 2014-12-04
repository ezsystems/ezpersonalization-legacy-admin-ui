  var reference_code = gupDecoded('reference_code');
  var customerID = gupDecoded('customer_id');
  var saved = gupDecoded('saved');
   
  $(document).ready(function() {
	  setLoadingDiv($('body'));
	  
	  $.when(
		  initialize_configurator_header(),
		  include(["/js/dao/models.js"]).then(function() {
			  return modelDao.init(customerID);
		  }),
		  include(["/js/dao/scenario.js"]).then(function() {
			  return scenarioDao.init(customerID, reference_code);
	  	  })		  
      ).done(function() {
		  initialize();
		  
		  initSubmodelDialog();
		  
		  i18n();
		  unsetLoadingDiv($('body'));
	  });
	  
	  destroyPlacedModel();
  });
	  
	  
var initialize = function() {
	
	var row = 0;
	var column = 0;
	$(".storyboards_base .ui-stage").each(function() {
		column = 0;
		$(this).find("li").each(function() {
			$(this).attr("data-column", column);
			$(this).attr("data-row", row);
			
			column++;
		});
		row++;
	});

	$('.settings_tab').find('a').attr('href', 'settingspop.html?reference_code=' + reference_code + '&customer_id=' + customerID);
	$('.preview_tab').find('a').attr("href", "previewpop.html?reference_code=" + reference_code + "&customer_id=" + customerID);
			  
	json = modelDao.getModels(); // must be already loaded at this moment

	$('.models_base').children('h3').children('span').first().text(json.length);

	var modelRefArray = new Array();
	var wasOtherli = false;

	for(var i = 0; i < json.length; i ++) {
		var nest, ghostModel, model = json[i];
		  
		var dummy = $('.dummymodel');
		var dummyClone = $(dummy).clone();
		$(dummyClone).show();
		$(dummyClone).attr("id", "model_" + model.referenceCode);

		if(model.modelType == "CF_I2I" || model.modelType == "CF_I2I_MIX") {
			nest = $('#collaborative_list');
		} else if(model.modelType === "POPULARITY_SHORT" || model.modelType === "POPULARITY_LONG") {
			nest = $('#popularity_list');
		} else {
			wasOtherli = true;
			nest = $('#other_list');
		}
		  
		$(dummyClone).appendTo(nest).removeClass("dummymodel");
		  
		renderModel(model);
	}

	if(!wasOtherli){
		$('#other_list_li').hide();
	}
	  
	loadRightSection();

	$('body').on('mouseover', '.model', function() {
		setLiveDragDrop($(this));
	});

	localizer();

	if(saved == "true") {
		setMessagePopUp("positive", "message_data_saved_successfully");
	}

	$("#button_save").click(saveScenario);

	$('body').on("change", '.placed_model input, .placed_model select', function() {
		var model = $(this).parents('.placed_model').attr('id');
        console.log(model);
		updateJsonValueForModel(model);
    });
	
	initHelpBtn();
};
  
  
function renderModel(model) {
	  
	  var ghostModel = $('#model_' + model.referenceCode).removeAttr("style");
	  
	  var modelNameKey = modelDao.getModelNameKey(model.referenceCode);

	  ghostModel.children("div").children("h5").children("span.mtitle").attr('data-translate', modelNameKey + '_title');
	  ghostModel.children("div").children("p").children("span").attr('data-translate', modelNameKey + '_description');
	  //handing the current model to a self executing anonymous function which returns the actual callback function.
	  //this is necessary, because we are in a loop and have to stay in the right context
	  ghostModel.find('a.configure_model').on('click', function(model) {
		  return function(e) {
			  e.preventDefault;
			  var str = $(this).closest('li.model').find('h5').children("span").html();
			  if(startsWith('CB', model.modelType, true)) {
				  activateCBModelDialog(model, str);
			  } else if(startsWith('random', model.modelType, true)) {
				  activateRandomModelDialog(model, str);
			  } else if(startsWith('EDITOR_BASED', model.modelType, true)) {
				  app.gui.showEditorialListEditor(model, str);
			  } else {
				  activateSubmodelDialog(model.referenceCode);
			  }
		  };
	  }(model));
	  if(! model.submodelsSupported
			  && ! startsWith('CB', model.modelType, true)
			  && ! startsWith('random', model.modelType, true)
			  && ! startsWith('EDITOR_BASED', model.modelType, true)) {
		  ghostModel.find('a.configure_model').hide();
	  }
	  var addInfo = getModelAdditionalInfo(model);

	  if (addInfo){
		  ghostModel.find('.info').html(" (" + addInfo + ")");
	  }
}
  
  
function saveScenario() {
	
	  setLoadingDiv($('body'));
	  
	  var json = $('body').data('scenario');

	  //the stage categorypath can not be triggered and write in the json object on change
	  //it has to be set in the save method
	  var stages = json.scenario.stages;
	   
	  if(stages[0] != null) {
		  if($('#primary_category_path').val() == "null") {
			  stages[0].useCategoryPath = null;
		  }
		  else {
			  stages[0].useCategoryPath = $('#primary_category_path').val();
		  }
	  }
	 
	  for( var k = 1; k < 4; k ++){
		  if(stages[k] != null) {
			  var strn = '#fallback'+k+'_category_path';
			  if($(strn).val() == "null") {
				  stages[k].useCategoryPath = null;
			  }
			  else {
				  stages[k].useCategoryPath = $(strn).val();
			  }
		  }
	  }

	  //clear the xingModel arrays (remove undefined elements)
	  var j;
	  for( var i = 3 ; i > -1; i --){
		  if(! stages[i]) {
			  continue;
		  }
		  j = stages[i].xingModels.length;
		  while(j --) {
			  if(stages[i].xingModels[j]) {
				  continue;
			  }
			  stages[i].xingModels.splice(j, 1);
		  }
	  }

	  $.ajax({
		  type: "POST",
		  beforeSend: function(x) {
			  if(x && x.overrideMimeType) {
				  x.overrideMimeType("application/json;charset=UTF-8");
			  }
			  x.setRequestHeader('no-realm', 'realm1');
		  },
		  mimeType: "application/json",
		  contentType: "application/json;charset=UTF-8",
		  dataType: "json",
		  data: JSON.stringify(json.scenario),
		  url: "ebl/v3/" + encodeURIComponent(customerID) + "/structure/update_scenario/",
		  success: function(json) {
			  window.location = "configuratorpop.html?reference_code=" + encodeURIComponent(reference_code) + "&customer_id=" + encodeURIComponent(customerID) + "&saved=true";
		  },
		  error: function() {
			  unsetLoadingDiv($('body'));
			  stdAjaxErrorHandler();
		  }
	  });
	
}

  //ajax request for the right section

  function itemTypeTreeAsText(input, output) {
	  
	  var result = "";
	  
	  if (input) {
		  result += getItemTypeDescription(input); 
		  result += ' ► ';
	  }
	  
	  result += getItemTypeDescriptions(output);
	  
	  return result;
  }
  

  function loadRightSection() {
	  
	  var json = { scenario : scenarioDao.scenario };
	  $('body').data('scenario', json); // backward compatibility

	  var modelRefList = modelDao.getModels();

	  //set the colors of the models on the left side

	  for(var l = 0; l < modelRefList.length; l ++) {
		  var model = modelRefList[l];//TODO check for multiple declaration
		  var color = "";
		  if(model.itemTypeTrees.length < 1) {
			  color = "red";
		  }
		  else {
			  var hasSameItemType = true;
			  for(var m = 0; m < model.itemTypeTrees.length; m ++) {
				  var itemTypeTree = model.itemTypeTrees[m];
				  if(itemTypeTree.inputItemType != null && itemTypeTree.inputItemType != json.scenario.inputItemType) {
					  hasSameItemType = false;
				  }
				  else {
					  hasSameItemType = true;
					  if(itemTypeTree.outputItemTypes.length > 0) {
						  var counter = 0;
						  for(var n = 0; n < itemTypeTree.outputItemTypes.length; n ++) {
							  var modelOutputItemType = itemTypeTree.outputItemTypes[n];

							  for(var o = 0; o < json.scenario.outputItemTypes.length; o ++) {
								  var scenarioOutputItemType = json.scenario.outputItemTypes[o];
								  if(modelOutputItemType == scenarioOutputItemType) {
									  counter ++;
								  }
							  }
						  }

						  if(counter == json.scenario.outputItemTypes.length) {
							  color = "green";
							  break;
						  }
						  else if(counter == 0) {
							  if(color != "yellow") {
								  color = "red";
							  }
						  }
						  else {
							  color = "yellow";
						  }
					  }
				  }
			  }
			  if(hasSameItemType == false) {
				  if(color == "red")//TODO what is this statement for?
					  color = "red";
			  }
		  }
		  var $model = $('#model_' + model.referenceCode);
		  if(color == "red") {
			  $model.addClass('problem');
		  }
		  else if(color == "green") {
			  $model.addClass('ready_to_use');
		  }
		  else if(color == "yellow") {
			  $model.addClass('needs_building');
		  }
	  }

	  var referenceCodeServer = json.scenario.referenceCode, 
	  $scenarioSettings = $(".scenario_settings");

	  $("#scenario_title").attr('value', json.scenario.title ? json.scenario.title : referenceCodeServer);

	  $('#primary_category_path').val(json.scenario.useCategoryPath);


	  function setCategoryPath(path, value) {
		  $('#' + path).val(value === null ? 'null' : value);
		  if(value === 0) {
			  $('#' + path + '_str').attr('data-translate', 'configurator_category_disabled');
			  $('#' + path + '_level').html('');
		  }
		  else if(value === null) {
			  $('#' + path + '_str').attr('data-translate', 'configurator_category_same_category');
			  $('#' + path + '_level').html('');
		  }
		  else if(value < 0) {
			  $('#' + path + '_str').attr('data-translate', 'configurator_category_parent_category');
			  $('#' + path + '_level').html(value);
		  }
		  else if(value > 0) {
			  $('#' + path + '_str').attr('data-translate', 'configurator_category_main_category');
			  $('#' + path + '_level').html(value);
		  }
		  localizer();
	  }

	  $(document).on('click', '.edit_category_path', function() {
		  //init the configuration
		  var $this = $(this),
				  value = $this.siblings('input').val(),
				  inputId = $this.data('inputid'),
				  $inputs = $('input[name="category_filter"]');
		  value = value === 'null' ? null : value;

		  function change(event, ui) {
			  $(ui.handle).parent().siblings('.levelView').html(ui.value);
		  }

		  //prepare slider
		  $('#levelsDown').slider({
			  'min': 1,
			  'max': 5,
			  'slide': change,
			  'change': change}).slider('value', 1);
		  
		  $('#levelsUp').slider({
			  'min': 1,
			  'max': 5,
			  'slide': change,
			  'change': change}).slider('value', 1);

		  function click() {
			  var $this = $(this);
			  if($this.is(':checked') && $this.val() === 'sameCategory') {
				  console.log('sameCat');
				  $('#includeParent').removeAttr('disabled').prop('checked', true);
				  $('#levelsUp').slider('enable');
			  }
			  else {
				  console.log('not sameCat');
				  $('#includeParent').attr('disabled', 'disabled').prop('checked', false);
				  $('#levelsUp').slider('disable').slider('value', 1);
			  }
			  if($this.is(':checked') && $this.val() === 'sameMainCategory') {
				  console.log('same Main');
				  $('#levelsDown').slider('enable');
			  }
			  else {
				  console.log('Not same Main');
				  $('#levelsDown').slider('disable').slider('value', 1);
			  }
		  }

		  $inputs.off('click').on('click', click);
		  if(value === null) {
			  $inputs.filter('[value="sameCategory"]').prop('checked', true).trigger('click');
			  $('input[name="includeParent"]').prop('checked', false);
		  } else if(parseInt(value, 10) === 0) {
//					  window.test = $inputs;
			  $inputs.filter('[value="noFilter"]').prop('checked', true).trigger('click');
			  $('input[name="includeParent"]').prop('checked', false);
		  } else if(parseInt(value, 10) < 0) {
			  $inputs.filter('[value="sameCategory"]').prop('checked', true).trigger('click');
			  $('input[name="includeParent"]').prop('checked', true);
			  $('#levelsUp')
					  .slider('value', Math.abs(parseInt(value, 10)))
					  .slider('enable');
		  } else if(parseInt(value, 10) > 0) {
			  $inputs.filter('[value="sameMainCategory"]').prop('checked', true).trigger('click');
			  $('input[name="includeParent"]').prop('checked', false);
			  $('#levelsDown')
					  .slider('value', parseInt(value, 10))
					  .slider('enable');
		  }

		  $('#save_category_path_settings')
				  .off('click')
				  .on('click', function() {
					  var filter = $inputs.filter(':checked').val(),
							  value = 0;
// 								console.log(filter);
					  if(filter === 'noFilter') {
						  value = 0;
					  } else if(filter === 'sameCategory') {
						  value = $('#includeParent').is(':checked') ? -1 * $('#levelsUp').slider('value') : null;
					  } else if(filter === 'sameMainCategory') {
						  value = $('#levelsDown').slider('value');
					  }

					  $('#' + inputId).val(value === null ? 'null' : value);
					  setCategoryPath(inputId, value);
					  $('#category_path_settings').hide();
				  });
		  $('#category_path_settings')
				  .show()
				  .find('.destroy_dialog')
				  .off('click')
				  .on('click', function() {
					  $(this).closest('._overlay').hide();
				  });
	  });
	  
	  
	  var extendedSolution = ifExtended();
	  var stagesAmount;
	  
	  if (extendedSolution) {
		  $(".extended_stage").show();
		  stagesAmount = 4;
	  } else {
		  $(".extended_stage").hide();
		  stagesAmount = 2;
	  }
	  
	  if (json.scenario.stages.length > stagesAmount) { // backward compatibility
		  stagesAmount = json.scenario.stages.length;
	  }
		
	  var stages = json.scenario.stages;

	  for (var j = 0; j < stagesAmount; j ++) {
		  
		  var stage = json.scenario.stages[j];
		  
		  if (stage) {

			  if(j == 0) {
				  setCategoryPath('primary_category_path', stage.useCategoryPath);
			  } else  {
				  setCategoryPath('fallback'+j+'_category_path', stage.useCategoryPath);
			  }

			  for(var k = 0; k < stage.xingModels.length; k ++) {
				  var xing = stage.xingModels[k];
				  var childnumberdiv = j;
				  var childnumberli = k + 1;
				  var nest = $('.ui-stage:eq(' + childnumberdiv + ')').children("ul").children("li:nth-child(" + childnumberli + ")");
				  
				  var ghostModel = generatePlacedModel(xing.modelReferenceCode, j, k, xing);
				  
				  ghostModel.appendTo(nest);

				  $('.ui-stage:eq(' + childnumberdiv + ')').children("ul").children("li:nth-child(" + childnumberli + ")").children('.empty_model_place').remove();
			  }
		  }
	  }

  }
  
  
  var ifExtended = function() {
	  var solution = mandatorInfo.baseInformation.version;
	  var extendedSolution = (solution == 'EXTENDED');
	  
	  return extendedSolution;
  };
  
  /**
   * @param model
   * 	model reference code of model JSON
   * @param j
   * 	row
   * @param k
   * 	column
   * @returns
   * 	deattached HTML code of the generated model
   */
  function generatePlacedModel(model, j, k, xing) {
	  
	  if (typeof model == 'string') {
		  model = modelDao.getModel(model);
		  if (!model) {
			  throw { code: 'MODEL_NOT_FOUND', message: "Model ["+model+"] was not found." };
		  }
	  } 
	  
	  var modelRefCode = model.referenceCode;
	  var ghostModel = $(".placed_model.ghost");
	  
	  ghostModel = ghostModel.clone();
	  ghostModel.removeClass("ghost").fadeIn();
	  
	  ghostModel.attr("id", j + "_" + k + "_" + modelRefCode);
		  
	  var key = modelDao.getModelNameKey(modelRefCode);
	  
	  var info = getModelAdditionalInfo(model);
	  var modelTitle = key + '_title';

	  ghostModel.find("h4 span.name").attr('data-translate', modelTitle);
	  if (info) {
		  ghostModel.find("h4 span.info").html(info);
	  } else {
		  ghostModel.find("h4 span.info").hide();
	  }
	  
	  var extendedSolution = ifExtended();
	  
	  if(! model.submodelsSupported || ! extendedSolution) {
		  ghostModel.find(".usesubmodels").hide();
	  }
	  if(! model.websiteContextSupported || ! model.profileContextSupported) {
		  ghostModel.find(".context_options").hide();
	  }

	  var contexts = extendedSolution ? 
			  ['AUTO', 'ITEM', 'CLICKED', 'OWNS', 'CONSUMED', 'BASKET', 'RATED', 'NONE'] : 
			  ['AUTO', 'ITEM', 'CLICKED', 'OWNS', 'NONE'];
			  
	  ghostModel.find("select[name=placed_model_context_type] > option").remove();

	  for (var i in contexts) {
		  var opt = $('<option value="' + contexts[i] + '" data-translate="model_configurator_context_' + contexts[i] + '">').clone();
		  if (xing && contexts[i] == xing.contextFlag) {
			  opt.attr("selected", "selected");
		  }
		  opt.appendTo(ghostModel.find("select[name=placed_model_context_type]"));
	  }

	  if(xing && xing.useSubmodels) {
		  ghostModel.find('input[id="use_submodels_' + j + "_" + k + "_" + modelRefCode + '"]').attr("checked", "checked");
	  }
	  
	  i18n(ghostModel);
	  
	  return ghostModel;
  }
  
  
  /** Returns submodel by attribute. */
  function getSubmodel(attributeKey, attributeType) {
	  
	  if (arguments.length == 1) {
		  attributeKey = arguments[0];
		  attributeType = arguments[1];
	  }
	  
	  for (var i = 0; i < current_submodels.length; i++) {
		  if (current_submodels[i].attributeKey === attributeKey && current_submodels[i].submodelType === attributeType) {
			  return current_submodels[i];
		  }
	  }
	  var newSubmodel = new Object();;
	  newSubmodel.attributeKey = attributeKey;
	  newSubmodel.submodelType = attributeType;
	  if(attributeType == "NOMINAL"){
		  newSubmodel.attributeValues = new Array();
	  }
	  current_submodels[current_submodels.length] = newSubmodel;
	  return newSubmodel;
  }
  
  
  function renderAttributes() {
	  var list = current_attributes;
	  
	  if(list.length > 0) {
		  
		  var options = '<option value="" data-translate="configurator_submodel_select_attribute" disabled="disabled" selected="selected">- Select an attribute -</option>';
		  for(var i = 0; i < list.length; i ++) {
			  
			  var sbm = getSubmodel(list[i].key, list[i].type);

			  options = options +
					  '<option data-type="' + list[i].type + '"value="' + list[i].key + '">'
					  + (list[i].type === 'NUMERIC' ? '[123] ' : '')
					  + (list[i].type === 'NOMINAL' ? '[ABC] ' : '')
					  + list[i].key + ' ';
			  
			  if (sbm) {
				  if (list[i].type === 'NUMERIC') {
					  if('intervals' in sbm){
						  options = options + '(' + sbm.intervals.length + ' intervals)';
					  }
				  } else if (list[i].type === 'NOMINAL') {
					  var count = 0;
					  var keys = {};
					  var j = sbm.attributeValues.length;
					  
					  while(j --) {
						  var group = sbm.attributeValues[j].group;
						  if(keys[group]) {
							  continue;
						  } else {
							  keys[group] = true;
							  count ++;
						  }
					  }
					  options = options + '(' + count + ' groups)';
				  }
		  	  }
			  options = options + '</option>';
		  }
		  $('#submodels_attributes').html(options);
	  }
  }
  

  function stdAjaxErrorHandler(jqXHR, textStatus, errorThrown) {
	  if(jqXHR != null && jqXHR.status == 403) {
		  setMessagePopUp("problem", "error_server_error_403");
	  }
	  else if(jqXHR != null && jqXHR.status == 401) {
		  setMessagePopUp("problem", "error_server_error_401");
	  }
	  else if(jqXHR != null && jqXHR.status == 400) {
		  setMessagePopUp("problem", "error_server_error_400");
	  }
	  else if(jqXHR != null && jqXHR.status == 404) {
		  setMessagePopUp("problem", "error_server_error_404");
	  }
	  else if(jqXHR != null && jqXHR.status == 409) {
		  setMessagePopUp("problem", "error_server_error_409");
	  }
	  else {
		  setMessagePopUp("problem", "error_server_error");
	  }
  }

  function createJsonXingModel(json, stage, stageIndex, modelName, modelIndex) {
	  if (stage == null) {
		  json.scenario.stages[stageIndex] = new Object();
		  json.scenario.stages[stageIndex].xingModels = new Array();
	  }
	  
	  var xing = json.scenario.stages[stageIndex].xingModels[modelIndex] = new Object();
	  
	  xing.modelReferenceCode = modelName;
	  
	  var modelNameWithStage = stageIndex + "_" + modelIndex + "_" + modelName;

	  var domModel = $("#" + modelNameWithStage);

	  xing.useSubmodels = domModel.find('input[id="use_submodels_' + modelNameWithStage + '"]').is(':checked');

	  xing.contextFlag = domModel.find('select[name=placed_model_context_type]').val();
	  
	  updateJsonValueForModel(modelName);
  }

  
  function createJsonModel(modelDOM, modelName, row, column) {

	  var json = $('body').data('scenario');

	  var stage = stage = json.scenario.stages[row];
	  
	  createJsonXingModel(json, stage, row, modelName, column);
  }

  
  function updateJsonValueForModel(modelName) {
	  var json = $('body').data('scenario');
	  for(var i = 0; i < 4; i ++) {
		  if ( ! json.scenario.stages[i]) {
			  continue;
		  }
		  for(var j = 0; j < json.scenario.stages[i].xingModels.length; j ++) {
			  var model = json.scenario.stages[i].xingModels[j];
			  if( ! model) {
				  continue;
			  }
			  if((i + "_" + j + "_" + model.modelReferenceCode) == modelName) {
				  var domModel = $("#" + modelName);

				  model.useSubmodels  = domModel.find('input[id="use_submodels_' + modelName + '"]').is(':checked');
				  
				  model.contextFlag = domModel.find('select[name=placed_model_context_type]').val();
			  }
		  }
	  }
  }

  
  function deleteJsonModelWithName(modelName) {
	  var json = $('body').data('scenario');
	  for(var i = 0; i < 4; i ++) {
		  if( ! json.scenario.stages[i]) {
			  continue;
		  }
		  for(var j = 0; j < json.scenario.stages[i].xingModels.length; j ++) {
			  var model = json.scenario.stages[i].xingModels[j];
			  if(typeof model != 'undefined') {
				  if((i + "_" + j + "_" + model.modelReferenceCode) == modelName) {
					  json.scenario.stages[i].xingModels[j] = undefined;
				  }
			  }
		  }
	  }
	  updateJsonValueForModel();
  }

  
  function fillSubModels(modelID) {
	  
	  current_attributes = [];
	  current_submodels = [];
	  current_submodel = null;
	  
	  modelDao.loadSubmodelsAndAttributes(model_reference_code, function(submodel, attributes) {
		  
		  current_attributes = attributes; // setting global variables
		  current_submodels = submodel;
		  
		  renderAttributes();
		  
		  if (current_submodels.length) {
			  
			  var sm = current_submodels[0];
			  
			  $('#submodels_attributes option').removeAttr('selected').filter(function() {
				  return ($(this).data('type') === sm.submodelType && $(this).val() === sm.attributeKey);
			  }).attr('selected', 'selected');
			  
			  fillSubModelsChange(sm.attributeKey, sm.submodelType);
			  
		  } else {
			  fillSubModelsChange(null, null);
		  }
		  
		  enableSubmodelActions();

	  }, configuratorErrorHandler);
  }
  

  function updateSubModel() {
	  
	  var model = current_submodel;
	  
	  if(model.submodelType === 'NUMERIC') {
		  model.intervals = checkNumericSubModel();
	  } else if(model.submodelType === 'NOMINAL') {
		  model.attributeValues = createAttributeValueList();
	  }
  }

  
  function fillSubModelsChange(attributeKey, type) {
	  if(! attributeKey) {
		  fillSubmodelValues(null);
		  return;
	  }

	  if(current_submodel) {
		  updateSubModel(); // parsing changes and altering the JSON object ()
	  }

	  current_submodel = getSubmodel(attributeKey, type);

	  // we have already an instance
	  if(type === "NUMERIC") {
		  fillNumericSubmodelValues(current_submodel);
	  } else if(type === "NOMINAL") {
		  if(! current_submodel){
			  fillAttributeEmptyValues(attributeKey, type);
		  }else{
			  fillSubmodelValues(current_submodel);
		  }
	  }
  }
  
  function fillAttributeEmptyValues(attributeKey,type) {

	  $('.grouping_attributes').children('li').remove();
	  $('.groups_base').children('li').first().find("ul.user_created_group").children().remove();
	  $('.groups_base').children('li').slice(1, ($('.groups_base').children('li').length - 1)).remove();

	  $('#nominalSubmodelValues').show().siblings('div').hide();
	  $('.grouping_attributes').html("");
	  
	
	  getAttributeValues(attributeKey, type).then(function(json) {
		  //console.log(json);
		 
		  //write all the groups and the according attribute values
		  
		  //fill the available attribute values, which are not yet in groups
		  var $container = $('.grouping_attributes');
	
		  for(var i = 0; i < json.attribute.values.length; i ++) {
			   //console.log(json.attribute.values[i]);
				$container.append('<li data-value="' + json.attribute.values[i] + '">' + json.attribute.values[i] + '</li>');
		  }
	  });
  }

  
  function fillSubmodelValues(subModel) {

	  $('.grouping_attributes').children('li').remove();
	  $('.groups_base').children('li').first().find("ul.user_created_group").children().remove();
	  $('.groups_base').children('li').slice(1, ($('.groups_base').children('li').length - 1)).remove();

	  $('#nominalSubmodelValues').show().siblings('div').hide();
	  $('.grouping_attributes').html("");
	  
	  if (! subModel) {
		  return;
	  }
	  
	  getAttributeValues(subModel.attributeKey, subModel.submodelType).then(function(json) {
		  //console.log(json);
		  var original;
		  //write all the groups and the according attribute values
		  for(var i = 0; i < subModel.attributeValues.length; i ++) {
			  var attributeValue = subModel.attributeValues[i];
			  if(attributeValue.group === null) {// is handled below
				  $('.grouping_attributes').append(
						  '<li data-value="' + attributeValue.attributeValue + '">' + attributeValue.attributeValue + '</li>');
			  } else {
				  var listStr = '<li data-value="' + attributeValue.attributeValue + '" class="attribute_value">' + attributeValue.attributeValue + ' <a class="remove_attribute_value">x</a></li>';
				  if(attributeValue.group == 1) {
					  original = $('.groups_base').children('li').children('ul').first();
					  original.append(listStr);
				  } else {
					  var countGroups = $('.groups_base').children('li').length;
					  if(attributeValue.group <= countGroups - 1) {
						  var groupAvailable = $('.groups_base').children(
										  'li').slice(attributeValue.group - 1,
										  attributeValue.group);
						  groupAvailable.children('ul').append(listStr);
					  } else {
						  original = $('.groups_base').children('li').first();
						  
						  var inlineNumber = parseInt(original.find("h5 > span").text()) + (countGroups - 1);
						  
						  $(original).clone().insertBefore(
								  $('.groups_base').children('li').last());
						  $('.groups_base').children('li').last().prev()
								  .find("h5 > span").text(inlineNumber);
						  $('.groups_base').children('li').last().prev()
								  .find("ul.user_created_group > li")
								  .remove();
						  setSubmodelGroupsSortable();
						  
						  $('.groups_base').children('li').last().prev().children('ul').append(listStr);
					  }
				  }
			  }
		  }
		  //fill the available attribute values, which are not yet in groups
		  var $container = $('.grouping_attributes');
	
		  var flag;
		  for(i = 0; i < json.attribute.values.length; i ++) {
			  flag = true;
			  for(var l = 0; l < subModel.attributeValues.length; l ++) {
				  //console.log(json.attribute.values[i] + ' =? ' + subModel.attributeValues[l].attributeValue);
				  if(json.attribute.values[i] === subModel.attributeValues[l].attributeValue /*|| subModel.attributeValues[l].group === null*/) {
					  flag = false;
				  }
			  }
			  if(flag) {
				  //console.log(json.attribute.values[i]);
				  $container.append('<li data-value="' + json.attribute.values[i] + '">' + json.attribute.values[i] + '</li>');
			  }
		  }
	  });
  }

  function getAttributeValues(attributeKey, type) {
	  return $.ajax({
		  'dataType': "json",
		  'beforeSend': function(req) {
			  req.setRequestHeader('no-realm', 'realm1');
		  },
		  'url': "ebl/v3/" + encodeURIComponent(customerID) + "/structure/get_attribute_values/" + type + "/" + encodeURIComponent(attributeKey),
		  'error': stdAjaxErrorHandler
	  });
  }

  function disableSubmodelActions() {
	  $('#save_submodels').addClass('inactive');
	  $('#submodels_attributes').attr('disabled', 'disabled');
	  localizer();
  }

  function enableSubmodelActions() {
	  $('#save_submodels').removeClass('inactive');
	  $('.overlay .hintSpace').removeAttr('data-translate').html('');
	  $('#submodels_attributes').removeAttr('disabled');
  }


function createAttributeValueList() {
	var attributeValueList = [];
	var relevantPeriod = checkRelevantPeriod();

	if(! relevantPeriod) {
		setMessagePopUp("problem", "configurator_message_invalid_relevant_period");
		return false;
	}

	$('.grouping_attributes').children('li').each(function(index) {
		var attributeValueObject = new Object();
		attributeValueObject.group = null;
		attributeValueObject.attributeValue = $(this).data('value').toString();
		attributeValueList.push(attributeValueObject);
	});

	$('.user_created_group').each(function(index) {
		var group = parseInt(index + 1);
		$(this).children('li').each(function(index2) {
			var attributeValueObject = new Object();
			attributeValueObject.group = group;
			attributeValueObject.attributeValue = $(this).data('value').toString();
			attributeValueList.push(attributeValueObject);
		});
	});
	return attributeValueList;
}
  

function checkRelevantPeriod() {
	var val = $('#relevant_period').val();
	if(val.length) {
		val = parseInt(val, 10);
	} else {
		$('.overlay .hintSpace').attr('data-translate', 'configurator_message_invalid_relevant_period');
		return false;
	}
	if(isNaN(val) || val < 1) {
		$('.overlay .hintSpace').attr('data-translate', 'configurator_message_invalid_relevant_period');
		return false;
	}
	  
	var model = modelDao.getModel(model_reference_code);
	  
	var duration = parseDuration(); // creating empty duration
	
	var key = $('#relevant_period_unit').val();
	if (key == 'H') {
		duration.setHours(val);
	} else if (key == 'D') {
		duration.setDays(val);
	}
		
	model.maximumRatingAge = duration.getXSDuration();	  
	  
	return val;
}
  

/** This method must be called once during the initialisation. */
function initSubmodelDialog() {
	
  	var layer = $('#model_configuration_classic');
  	var overlay = $('#model_configuration_classic').parent(".model_config_overlay");

  	$('#model_configuration_classic .destroy_dialog').on('click', function (e) {
  		e.preventDefault();
  		overlay.hide();
  		model_reference_code = null;
  	});
  	
  	$('#model_configuration_classic .form_submit_button').on('click', function (e) { // Save button
  		e.preventDefault();
  		if (current_submodel) {
  			updateSubModel(); // parse changes and update JSON
  		}
  		saveModel(); // save all the submodels, not only the current one.
  	});

  	$(document).on('keydown', function (e) {
  		if (e.which === 27 && overlay.is(":visible")) {
  			overlay.hide();
  			model_reference_code = null;
  		}
  	});	
  	
	$('#relevant_period, #relevant_period_unit').on('change', function() {
		checkRelevantPeriod();
    });

    $('#submodels_attributes').on('change', function(event) {
    	var $this = $(this),
		type = $this.find('option:selected').data('type');
		fillSubModelsChange($this.val(), type);
    });
    
	$(".create_one_more_group").on("click", function (event) {

		var original = $(this).parent().prev();
		var inlineNumber = parseInt(original.find("h5 > span").text()) + 1;
		// alert(inlineNumber);

		$(original).clone().insertBefore($(this).parent());
		$(this).parent().prev().find("h5 > span").text(inlineNumber);
		$(this).parent().prev().find("ul.user_created_group > li").remove();
		setEquals();
		setSubmodelGroupsSortable();
	});
}


/** Currently selected model reference code. */
var model_reference_code;
var current_submodels = [];
var current_submodel = null;
var current_attributes = [];
  

function activateSubmodelDialog(modelID) {
	
	model_reference_code = modelID;

  	var layer = $('#model_configuration_classic');
  	var overlay = $('#model_configuration_classic').parent(".model_config_overlay");
  	
  	var extendedSolution = ifExtended();
  	
  	var modelNameKey = modelDao.getModelNameKey(modelID);
  	
  	var model = modelDao.getModel(modelID);
  	
    var maxRating = model.maximumRatingAge ? parseDuration(model.maximumRatingAge) : model.maximumRatingAge;
	var val = maxRating.D >= 2 ? maxRating.getDays() : maxRating.getHours();
	var unit = maxRating.D >= 2 ? 'D' : 'H';
    $('#relevant_period').val(val);
	$('#relevant_period_unit').val(unit);
  	var currentModelConf = 	$('#model_configuration_classic h2').find("span[data-param=0]");
  	currentModelConf.attr("data-translate", modelNameKey + '_title');
  	i18n(currentModelConf);
  	if ( ! extendedSolution) {
  		layer.css("height", "auto");
  		layer.css("width", "30em");
  	}

  	if (modelID.length) {
  		layer.find("h2 .model_name").text(modelID);
  	} 
  	
  	if (extendedSolution) {
  		setSubmodelGroupsSortable();
  		fillSubModels(modelID);
  	}

  	overlay.show();
}

  
/** Saves the currently selected model
  */
function saveModel() {
	
	var model = modelDao.getModel(model_reference_code);
	  
	setLoadingDiv($('body'));
	  
	modelDao.updateModelWithSubmodels(model, current_submodels,
		function (model) {
			unsetLoadingDiv($('body'));
			
			var overlay = $('#model_configuration_classic').parent(".model_config_overlay");
			overlay.hide();
			
			setMessagePopUp("positive", "message_data_saved_successfully");
			renderModel(model);
			model_reference_code = null;
	  	}, 
	  	configuratorErrorHandler);
}
  

function fillNumericSubmodelValues(sm) {
	var $content = $('#numericSubmodelValues');
	var $ghost = $content.find('.ghost');
	var	$groups = $('#modelGroups');
	
	if (! sm) {
		$content.hide();
		return;
	}
	
	function modelCheck() {
		var sub = checkNumericSubModel($content);
		var val = checkRelevantPeriod();
		
		if(! val || ! sub) {
			disableSubmodelActions();
		} else {
		    enableSubmodelActions();
		}
	}

	$content.off('change')
			.on('change', '.from, .to', modelCheck)
			.show()
			.siblings('div')
			.hide();
	
	$('#relevant_period')
			.off('change')
			.on('change', modelCheck);
    $groups.find('.interval').remove();
    
	if(sm && sm.intervals) {
		//reverse sort the groups
		sm.intervals
				  .sort(function(a, b) {
					  var aLeft = a.leftValue === null ? Number.NEGATIVE_INFINITY : parseFloat(a.leftValue),
							  aRight = a.rightValue === null ? Number.POSITIVE_INFINITY : parseFloat(a.rightValue),
							  bLeft = b.leftValue === null ? Number.NEGATIVE_INFINITY : parseFloat(b.leftValue),
							  bRight = b.rightValue === null ? Number.POSITIVE_INFINITY : parseFloat(b.rightValue);
					  if(aLeft < bLeft) {
						  return 1;
					  }
					  if(aLeft === bLeft) {
						  if(aRight < bRight) {
							  return 1;
						  }
					  }
					  return - 1;
				  });
		  //go through all the intervals and add them to the modelView
		  var length = sm.intervals.length;
		  while(length --) {
			  var interval = sm.intervals[length];
			  var $clone = $ghost.clone().removeClass('ghost').addClass(
					  'interval');
			  $clone.find('input.from').val(interval.leftValue);
			  $clone.find('input.to').val(interval.rightValue);
			  $groups.append($clone);
		  }
	  }
	  //init the delete group buttons
	  $content.off('click')
			  .on('click', '.delete_interval',function() {
				  $(this).closest('.interval').remove();
				  modelCheck();
			  }).on('click', '.add_group',function() {
				  $groups.append($ghost.clone());
			  }).find('.create_new').off('click')
			  .on('click', function() {
				  $groups.append($ghost.clone().removeClass('ghost')
						  .addClass('interval'));
			  });
  }
  

  function checkNumericSubModel($content) {
	  //  		console.log('checkNumericSubModel');
	  $content = $content ? $content : $('#numericSubmodelValues');
	  var $groups = $content.find('.interval'), values = [], error = false, val, l, regex = /^$|^[-+]?[0-9]*\.?[0-9]+$/;
	  //console.log($groups);
	  $groups
			  .each(function(index) {
				  if(error)
					  return;
				  var from, to, l, group;
				  from = $.trim($(this).find('.from').val());
				  to = $.trim($(this).find('.to').val());
				  //continue if the group is empty (ignore group)
				  if(! from.length && ! to.length) {
					  return;
				  }
				  console.log(from + ' ' + regex.test(from));
				  if(! regex.test(from) || ! regex.test(to)) {
					  error = 'values_not_numbers';
					  return;
				  }
				  from = from.length ? parseFloat(from)
						  : Number.NEGATIVE_INFINITY;
				  to = to.length ? parseFloat(to)
						  : Number.POSITIVE_INFINITY;
				  //check if the values are numbers
				  if(isNaN(from) || isNaN(to)) {
					  error = 'values_not_numbers';
					  return false;
				  }
				  if(from > to) {
					  error = 'left_bigger_right';
					  return;
				  }

				  l = values.length;
				  while(l --) {
					  group = values[l];
					  if((group.leftValue === from && from === Number.NEGATIVE_INFINITY)
							  || (group.rightValue === to && to === Number.POSITIVE_INFINITY)
							  || (! (from <= group.leftValue && to <= group.leftValue) && ! (from >= group.rightValue && to >= group.rightValue))
							  || (from === group.leftValue && to === group.rightValue)) {
						  error = 'overlapping_intervals';
						  return false;
					  }
				  }
				  values.push({
					  'leftValue': from,
					  'rightValue': to
				  });
			  });
	  if(error) {
		  $('.overlay .hintSpace').attr('data-translate',
				  'configurator_error_' + error);
		  localizer();
		  return false;
	  }
	  $('.overlay .hintSpace').removeAttr('data-translate').html('');

	  l = values.length;
	  while(l --) {
		  val = values[l];
		  val.leftValue = val.leftValue === Number.NEGATIVE_INFINITY ? null : val.leftValue;
		  val.rightValue = val.rightValue === Number.POSITIVE_INFINITY ? null : val.rightValue;
	  }
	  return values;
  }
  
  
  function durationToString(duration) {
	  
	  var hh = jQuery.i18n.prop("model_duration_hours");
	  var h = jQuery.i18n.prop("model_duration_hour");
	  
	  var dd = jQuery.i18n.prop("model_duration_days");
	  var d = jQuery.i18n.prop("model_duration_day");
	  
	  result = (duration.getHours() < 48) 
			? duration.getHours() + ' ' + (duration.getHours() > 1 ? hh : h)
			: duration.getDays()  + ' ' + (duration.getDays() > 1 ? dd : d);
		
	  return result;
  }

  
  function getModelAdditionalInfo(model) {
	  
	  var type = model.modelType;
	  var maxRating = model.maximumRatingAge ? parseDuration(model.maximumRatingAge) : model.maximumRatingAge;
	  var maxItemAge = model.maximumItemAge ? parseDuration(model.maximumItemAge) : model.maximumItemAge;
	  var str = '';
	  
	  //Algorithmic Models
	  if(startsWith('CF_I2I', type, true) || startsWith('POPULARITY', type, true) || startsWith('STEREOTYPES', type, true)) {
		  
		  if(maxRating) {
			  str += durationToString(maxRating);
		  }
		  
		  if(maxItemAge) {
			  str += ' / ';
			  str += durationToString(maxItemAge);
		  }

	  } else if(startsWith('CB', type, true)&& !startsWith('CBFT', type, true) ) { //CB Model
		  var l = model.attributes.length;
		  while(l --) {
			  str += model.attributes[l].key;
			  if(l) {
				  str += ', ';
			  }
		  }
	  } else if(startsWith('EDITOR_BASED', type, true)) { //Editorial List model
		  str += model.referenceCode;
		  
		  if (model.size && model.size!='undefined'){
			  str += '; ' + model.size;
		  }
	  } else if(startsWith('Profile', type, true)) { //Profile Model
		  str += model.listType.toLowerCase();
	  } else if(startsWith('Random', type, true)) { //Random Model
		  str += model.maximumItemAge;
	  } else if(startsWith('CBFT', type, true)) { //Random Model
			  str += model.maximumItemAge;
	  } else {
		  str = '';
	  }
	  
	  return str;
  }


  var setLiveDragDrop = function (element) {
  	element.draggable({
  		//connectToSortable: ".empty_model_place",
  		//helper: "clone",
  		helper: function (event) {
  			var result = $(this).clone();
  			result.width(150).height(150);
  			result.css('background-color', '#FFF');
  			result.css('z-index', 10);
  			return result;
  		},
  		cursorAt:  {
  			left: 100,
  			bottom: 0
		},
  		start: function (event, ui) {
  			$(this).addClass('dropable_model');
  		},
  		stop: function (event, ui) {
  			$('.empty_model_place').removeAttr('style');
  		},
  		revert: "invalid",
  		appendTo: 'body'
  	});

  	$(".empty_model_place").droppable({
  		'revert':  true,
  		//over:    function (event, ui) {
  		//	$(this).css({'padding': '0'});
  		//},
  		'accept': '.dropable_model',
  		'drop': function (event, ui) {
//  			createPlacedModel($(this));
  			createPlacedModel($(this), $(ui.draggable));
  		}
  	});
  };

  
var createPlacedModel = function (placed_model, model) {
	  
    var nest = placed_model.parent("li[data-row]");
	  
	var j = nest.attr("data-row");
	var k = nest.attr("data-column");
	
	var mid = model.attr("id");
	var refcode = mid.substring('model_'.length, mid.length);
	
	var htmlModel = generatePlacedModel(refcode, j, k);
	
	nest.html(htmlModel);
	
	createJsonModel(htmlModel, refcode, j, k);

};

  
  var destroyPlacedModel = function () {
  	$('body').on("click",".destroy_placed_model" ,  function (event) {
  		var placedModel = $(this).parent();
  		var nest = $(this).parent().parent();
  		var dummy = $(".empty_model_place.ghost");
  		deleteJsonModelWithName($(this).parent().attr("id"));
  		placedModel.remove();
  		dummy.clone().appendTo(nest).removeClass("ghost").fadeIn();
  	});
  };

  
  var setSubmodelGroupsSortable = function () {
		var sortable = $(".user_created_group, .grouping_attributes");

		if (sortable.length) {
			sortable.sortable({
				//appendTo: document.body,
				connectWith:     "ul",
				forceHelperSize: true,
				change:          function () {
					setEquals();
				},
				receive: function(event, ui){
					if($(this).hasClass('grouping_attributes')){
						ui.item.find('a').remove();
					}
					else if(!ui.item.find('a').length){
						ui.item.append(' <a class="remove_attribute_value">x</a>');
					}
				}
			});

		}
	};
  

  /**
   * the app variable holds the wrapper object for all functions to handle the editorial list
   *
   * @author maik.seyring
   */
  var app = {
	  'api': {},
	  'gui': {},
	  'data': {
		  'lists': []
	  },
	  'classes': {},
	  'tools': {},
	  'init': function() {
		  //load the mandator
		  var mandatorName = $.cookie('customerID'); //the cutomerID cookie is used in a wrong way all over the legacy code
		  //TODO: replace the cookie name 'customerID' in index.html and probably in other files too
		  this.data.mandatorName = mandatorName ? mandatorName : null;
	  }
  };

  app.editorialListsEditor = {
	  'init': function() {
		  var self = this;
		  this.$overlay = $('#editorial_model_configurator');
		  this.$editorialLists = $('#editorial_lists');
		  this.$typeSelect = this.$overlay.find('#itemTypes');
		  this.$dummyList = $('#dummyList');
		  //add click handler for the delete buttons of items
		  this.$overlay.on('click', '.deleteItem', function() {
			  $(this).closest('li').remove();
		  });
		  this.$overlay.find('.destroy_dialog').on('click', function() {
			  $(this).closest('._overlay').hide();
		  });
		  this.$overlay.find('#addItem').on('click', function() {
			  var $form = $(this).closest('form'),
					  id = $form.find('#itemId').val(),
					  type = $form.find('#itemTypes').val();
			  if(! id.length) {
				  self.showError('editorial_list_error_empty_id_field');
				  return;
			  }
			  //test if the id contains just digits
			  if(/\D/.test(id)) {
				  //we have non digits in the field
				  self.showError('editorial_list_error_invalid_id');
				  return;
			  }
			  id = parseInt(id, 10);
			  if(id > 2147483647 || id < 0) {
				  self.showError('editorial_list_error_id_out_of_bounds');
				  return
			  }

			  //check if Item already in list
			  var item = self.getItem(type, id);
			  if(item !== null) {
				  self.showError('editorial_list_error_duplicate_item');
				  return;
			  }
			  //load the item from server and add to list
			  app.api.getItem(type, id)
					  .then(function(item) {
						  $form.find('#itemId').val('');
						  self.addItem(item);
						  self.clearError();
					  }
			  );
		  });
		  this.$overlay.find('#save_editorial_model').on('click', function clickFunc(){
			  var $self = $(this).off('click').addClass('inactive');
			  //self.$overlay.find('.cover').show();
			  app.api.saveEditorialList(self.referenceCode, self.getItems()).then(
					function(list){
						$('#model_' + self.referenceCode)
								.find('.info')
								.html(list.length + ' items');
						setMessagePopUp("positive", "message_data_saved_successfully");
					},
					app.tools.stdAjaxErrorHandler
			  	)
				.always(function(){
				    $self.on('click', clickFunc).removeClass('inactive');
			    	//self.$overlay.find('.cover').hide();
	            });
		  });
		  //replace the function to make it callable just once
		  this.init = function() {
		  };
	  },
	  'reset': function() {
		  var id;
		  for(id in this.lists) {
			  this.lists[id].remove();
		  }
		  this.lists = {};
		  this.referenceCode = null;
		  this.$typeSelect.children().remove();
		  this.$overlay.find('h2 .model_name').html('');
		  this.clearError();
	  },
	  'prepare': function(types, model) {
		  var id, $option, $listClone;
//		  var mandatorType = $.cookie('mandatorType');
//		  var solution = $.cookie('mandatorVersionType');
		  //clean up all the EditorialListEditor
		  this.init();
		  this.reset();//remove all content from prior lists
		  this.referenceCode = model.referenceCode;
		  this.$overlay.find('h2 .model_name')
				  .attr('data-translate', 'editorial_list_title_' + model.referenceCode)
				  .html(model.modelType + ' ' + model.referenceCode);
		  //create the lists for the supported
		  for(id in types) {
//			  if((mandatorType == "SHOP" && id == 1) || 
//					  (mandatorType != "SHOP" && (id == 2|| solution == null || solution == 'undefined' || solution == 'EXTENDED'))){
				  
				  $option = $('<option></option>');
				  $option.attr('data-translate', 'editorial_list_item_type_' + id)
						  .html(types[id]).val(id);
				  this.$typeSelect.append($option);
				  $listClone = this.$dummyList.clone();
				  $listClone.attr('id', 'type_' + id);
				  $listClone.find('h3').attr('data-translate', 'editorial_list_item_type_'+ id).html(types[id]);
				  $listClone.show();
				  $listClone.find('ul')
						  .sortable({
							  'helper': 'clone',
							  'axis': 'y'
						  });
				  $listClone.appendTo(this.$editorialLists);
				  this.lists[id] = $listClone;
//			  }
		  }
		  this.$editorialLists.append('<div style="clear: both;"></div>');
		  localizer();
	  },
	  'show': function() {
		  this.$overlay.show();
	  },
	  'hide': function() {
		  this.$overlay.hide();
	  },
	  'addItem': function(item) {
		  var $item;
		  if(this.getItem(item.type, item.id) !== null) {
			  return;
		  }
		  //precede if we have a list for the item
		  if(this.lists[item.type]) {
			  //create a list element
			  $item = $('<li id="item_' + item.type + '_' + item.id + '">' +
					  '<span class="idCol">' + item.id + '</span>' +
					  '<span class="titleCol">' + (item.title === null ? '' : item.title) + '</span>' +
					  '<span class="deleteCol deleteItem">X</span>' +
					  '</li>')
					  .data('item', item);
			  //prepend the list element to the list, new elements are always set on top of the list
			  this.lists[item.type]
					  .find('ul')
					  .prepend($item)
					  .sortable('refresh');
			  //add the event handlers for mouse over tooltips
			  app.tools.toolTipFullContent($item.find('.titleCol'),
				  {
					  'filter': this.etc.titleFilter
			  	});
		  }
	  },
	  'addItems': function(items) {
		  var l = items.length;
		  while(l --) {
			  this.addItem(items[l]);
		  }
	  },
	  'getItem': function(type, id) {
		  return this.$editorialLists
				  .find('#item_' + type + '_' + id)
				  .data('item');
	  },
	  'getItems': function() {
		  var type,
				  $list,
				  items = [];
		  for(type in this.lists) {
			  $list = this.lists[type];
			  $list.find('li').each(function() {
				  var item = $(this).data('item');
				  items.push({
					  'type': item.type,
					  'id': item.id
				  });
			  });
		  }
		  return items;
	  },
	  'showError': function(code) {
		  this.$overlay.find('.hintSpace').attr('data-translate', code);
		  localizer();
	  },
	  'clearError': function() {
		  this.$overlay.find('.hintSpace').html('').removeAttr('data-translate');
	  },
	  'etc': {
		  'titleFilter': function($elem){
			  var tester, w1, w2;
			  $elem = $($elem);
			  tester = $elem.clone()
					  .css({'width': 'auto',
						  'position': 'absolute',
						  'top': 0,
						  'left': '-10000px'} );
			  $('body').append(tester);
			  w1 = tester.width();
			  w2 = $elem.width();
			  tester.remove();
			  return w1 > w2;
		  }
	  }

  };

  /**
   * loads the mandator
   * @param name optional
   * @returns {*}
   * @author maik.seyring
   */
  app.api.getMandator = function(name) {
	  if(app.data.mandator && (name === undefined || app.data.mandator.name === name)) {
		  return $.Deferred().resolve(app.data.mandator).promise();
	  } else {
		  name = name ? name : app.data.mandatorName;
		  return $.ajax({
			  'type': 'GET',
			  'url': 'ebl/v3/profile/get_mandator/' + encodeURIComponent(name),
			  'dataType': 'json'
		  }).then(
				  function(response) {
					  app.data.mandator = response.mandator;
					  return app.data.mandator;
				  },
				  app.tools.stdAjaxErrorHandler
		  );
	  }
  };

  /**
   * loads the editorial list for the given model
   * @param model
   * @returns $.XHR
   */
  app.api.getEditorialList = function(refCode) {
	  return app.api.getMandator() // load the mandator
			  .then(
			  function(mandator) {
				  return $.ajax({
					  'type': 'GET',
					  'url': '/api/v4/' + encodeURIComponent(mandator.name) + '/elist/get_list/' + encodeURIComponent(refCode),
					  'dataType': 'json'
				  });
			  },
			  app.tools.stdAjaxErrorHandler
	  );
  };

  /**
   * saves the list of items on the server
   * @param list
   * @returns {*}
   */
  app.api.saveEditorialList = function(refCode, list) {
	  return $.ajax({
		  'type': 'POST',
		  'contentType': 'application/json',
		  'url': 'ebl/v4/' + encodeURIComponent(app.data.mandatorName) + '/elist/update_list/' + encodeURIComponent(refCode),
		  'data': JSON.stringify(list)
	  });
  };
  /**
   * retrieves a item from server with given Id
   * @param id
   * @returns {*}
   */
  app.api.getItem = function(type, id) {
	  return $.ajax({
		  'type': 'GET',
		  'url': 'ebl/v4/' + encodeURIComponent(app.data.mandatorName) + '/elist/get_single_item/' + type + '/' + encodeURIComponent(id)
	  })
			  .then(null, app.tools.stdAjaxErrorHandler);
  };

  /**
   * loads the available item types for the mandator
   * @returns {*}
   */
  app.api.getItemTypes = function() {
	  var deferred = $.Deferred();
	  app.api.getMandator()
			  .then(
			  function(mandator) {
				  var itemTypes = {};
				  if(mandator.type === 'SHOP') {
					  itemTypes['1'] = 'Product';

					  if(mandator.version === 'EXTENDED') {
						  itemTypes['2'] = 'Article';
						  itemTypes['3'] = 'Image';
						  itemTypes['4'] = 'Media';
						  itemTypes['5'] = 'User generated';
					  }
				  }
				  if(mandator.type === 'PUBLISHER') {
					  itemTypes['1'] = 'Product';
					  itemTypes['2'] = 'Article';

					  if(mandator.version === 'EXTENDED') {
						  itemTypes['3'] = 'Image';
						  itemTypes['4'] = 'Media';
						  itemTypes['5'] = 'User generated';
					  }
				  }
				  deferred.resolve(itemTypes);
				  return itemTypes;
			  },
			  function() {
				  deferred.reject();
			  }
	  );
	  return deferred.promise();
  };

  app.gui.showEditorialListEditor = function(model) {
	  $.when(app.api.getEditorialList(model.referenceCode), app.api.getItemTypes())
			  .then(
			  function(items, types) {
				  app.editorialListsEditor.prepare(types, model);
				  app.editorialListsEditor.addItems(items[0]);
				  app.editorialListsEditor.show();

			  }
	  );
  };
  (function() {
	  var config = {

	  };
	  app.tools.formValidator = function(conf) {

	  };
  })();

  app.tools.toolTipFullContent = (function() {
	  var $hoverView = $('#hoverView'),
			  _config = {
				  styles: {
					  'padding': '3px',
					  'border': '1px dotted black',
					  'background': '#fbff73',
					  'border-radius': '5px'
				  },
				  timeout: 5000
			  },
			  timer = null,
			  hideHoverView = function(e) {
				  if(timer){
					  clearTimeout(timer);
					  timer = null;
				  }
				  $hoverView
						  .html('')
						  .hide();
			  };

	  return function(elements, config) {
		  var $elements = $(elements);
		  config = $.extend({}, _config, config);
		  $elements.hover(function(e) {
					  if(typeof config.filter === 'function' && ! config.filter(this)) {
						  return;
					  }
					  $hoverView.html($(this).html());
					  $hoverView
							  .css(config.styles)
							  .css({
								  left: e.pageX + 20,
								  top: e.pageY - 20
							  })
							  .show();
					  if(config.timeout){
						 timer = setTimeout(hideHoverView, config.timeout);
					  }
				  },
				  hideHoverView);

	  };
  })();

  app.tools.extend = function(a, b) {
	  var prop;
	  if(! a instanceof Object) {
		  return;
	  }
	  for(prop in b) {
		  if(a.hasOwnProperty(prop)) {
			  continue;
		  } else {
			  a[prop] = b[prop];
		  }
	  }
  };

  app.tools.stdAjaxErrorHandler = function(jqXHR, textStatus, errorThrown) {
	  if(jqXHR.status != null && jqXHR.status == 403) {
		  setMessagePopUp("problem", "error_server_error_403");
	  }
	  else if(jqXHR.status != null && jqXHR.status == 401) {
		  setMessagePopUp("problem", "error_server_error_401");
	  }
	  else if(jqXHR.status != null && jqXHR.status == 400) {
		  setMessagePopUp("problem", "error_server_error_400");
	  }
	  else if(jqXHR.status != null && jqXHR.status == 404) {
		  setMessagePopUp("problem", "error_server_error_404");
	  }
	  else if(jqXHR.status != null && jqXHR.status == 409) {
		  setMessagePopUp("problem", "error_server_error_409");
	  }
	  else {
		  setMessagePopUp("problem", "error_server_error");
	  }
  };

  app.init();

