/* css({'border-top':'5px solid red'}) */

  var setChartsDimensions = function() {
  
    var chartCanvas = $('canvas');
    if (chartCanvas.length){
      chartCanvas.each(function(index) {
        var targetWidth = $(this).parent().innerWidth();
        $(this).attr('width', targetWidth);
      });
	  if (typeof rightLine != 'undefined')
	  {
		rightLine.Draw();
	  }
	   if (typeof middlebar != 'undefined')
	  {
		middlebar.Draw();
	  }
	   if (typeof leftbar != 'undefined')
	  {
		leftbar.Draw();
	  }
	  
    }
  
  };

  var setEquals = function() {
    
    $(".groups_base").equalize({
      eqItems: " > li",
      exclItems: ":last-child",
      segmentSize: 4,
      applicantSelector: "> ul"
    });
    
    $(".list_of_models").equalize({
      eqItems: "> .model",
      segmentSize: 2,
      applicantSelector: "> div"
    });
    
    $(".storyboards_base").equalize({
      eqItems: "> div > ul > li",
      segmentSize: 3,
      applicantSelector: "> div"
    });
    
    $(".available_scenarios").equalize({
      eqItems: "> li:visible",
      segmentSize: 5,
      applicantSelector: "> *"
    });
    
  };
  
  var setAccordions = function() {
    
    var accordion = $(".accordion");
    
    if (accordion.length){
      accordion.accordion({
        autoHeight: false,
        change: function() {
          setEquals();
        }
      });
    }
    
  };
  
  var setSortable = function() {
    
    var sortable = $(".user_created_group, .grouping_attributes");
    
    if (sortable.length){
    
      sortable.sortable({
        connectWith: "ul",
        forceHelperSize: true,
        change: function() {
          setEquals();
        }
      });
    
    }
  };
  
  var setModelsGroupsHeight = function() {
    
    var modelsContainer = $(".models_groups");
    if (modelsContainer.length){
      var offset = modelsContainer.offset();
      var screenHeight = $(window).height();
      var mod = 20;
      modelsContainer.css({'height':( screenHeight-offset.top - mod ) + 'px'});
    }
    
  };
  

  var setDragDrop = function() {
    $(".model").draggable({
      connectToSortable: ".empty_model_place",
      helper: "clone",
			helper: function(event) {
					return $('<div class="helper_on_the_move"/>').text($(this).find("h5").text());
			  },
			cursorAt: {
				left: 100,
				bottom: 0},
			start: function(event, ui) {
				setEquals();
			},
			stop: function(event, ui) {
				setEquals();
			},
      revert: "invalid"
    });
    $(".empty_model_place").sortable({
      revert: true,
			over: function(event, ui) {
				$(this).css({'padding':'0'});
			},
			receive: function(event, ui) {
				createPlacedModel( $(this) );
			}
    });
  };

  var setLiveDragDrop = function(element) {
			element.draggable({
      connectToSortable: ".empty_model_place",
      helper: "clone",
			helper: function(event) {
					$.cookie('draggedId', $(this).attr("id"));
					return $('<div class="helper_on_the_move"/>').text($(this).find("h5").text());
			  },
			cursorAt: {
				left: 100,
				bottom: 0},
			start: function(event, ui) {
				setEquals();
			},
			stop: function(event, ui) {
				setEquals();
			},
      revert: "invalid"
    });
    $(".empty_model_place").sortable({
      revert: true,
			over: function(event, ui) {
				$(this).css({'padding':'0'});
			},
			receive: function(event, ui) {
				createPlacedModel( $(this) );
			}
    });
					};
  
	var createPlacedModel = function(placed_model) {
		var nest = placed_model.parent();
		var ghostModel = $(".placed_model.ghost");
		var refCode = $.cookie('draggedId');
		var refCodeWithoutStage = refCode.substring(6, refCode.length);
		refCode = refCode.substring(6, refCode.length);
		var parentStage = nest.parent().parent();
		var stageId = parentStage.attr("id");
		var modelIndex = nest.attr("id").substring(5,6);
		var stageNumber = stageId.charAt(stageId.length-1);
		refCode = (parseInt(stageNumber) - 1) + "_" +modelIndex+ "_" + refCode;
		var title = placed_model.find("li.model").children("div").children("h5").text();
		placed_model.remove();
		ghostModel.clone().appendTo(nest).removeClass("ghost").fadeIn();
		ghostModel = nest.children("div");
		ghostModel.attr("id", refCode);
		ghostModel.find("h4").text(title);
		ghostModel.find("p.description").text(placed_model.find("li.model").children("div").children("p").children("span").text());
		
		ghostModel.children("form").find('label[for="placed_model_context_type_profile"]').attr("for", "placed_model_context_type_profile" + "_" + refCode);
		ghostModel.children("form").find('label[for="placed_model_context_type_website"]').attr("for", "placed_model_context_type_website" + "_" + refCode);
		ghostModel.children("form").find('input[id="placed_model_context_type_profile"]').attr("id", "placed_model_context_type_profile" + "_" + refCode).attr("name", "placed_model_context_type" + "_" + refCode);
		ghostModel.children("form").find('input[id="placed_model_context_type_website"]').attr("id", "placed_model_context_type_website" + "_" + refCode).attr("name", "placed_model_context_type" + "_" + refCode);;
//		ghostModel.children("form").find('input[id="weight_model"]').attr("id", "weight_model" + "_" + refCode);
//		ghostModel.children("form").find('label[for="weight_model"]').attr("for", "weight_model" + "_" + refCode);
		
		var modelRefList = $('body').data('model_list');
		for(var l = 0; l < modelRefList.modelRefArray.length; l++)
		{
			if(modelRefList.modelRefArray[l].referenceCode == refCodeWithoutStage)
			{
				//hide the elements, that are not supported.
				submodelsSupported = modelRefList.modelRefArray[l].submodelsSupported;
				websiteContextSupported = modelRefList.modelRefArray[l].websiteContextSupported;
				profileContextSupported = modelRefList.modelRefArray[l].profileContextSupported;
			}
		}
		
		if(!submodelsSupported)
		{
			ghostModel.find(".usesubmodels").hide();
		}
		if(websiteContextSupported == false ||  profileContextSupported == false)
		{
			ghostModel.find(".context_options").hide();
		}
										
		
		createJsonModel(ghostModel, refCodeWithoutStage);
		
		setEquals();
	};
  
	var destroyPlacedModel = function() {
		var destroyTrigger = $(".destroy_placed_model");
		if( typeof(destroyTrigger.live) != "undefined"){
			destroyTrigger.live("click", function(event){
				var placedModel = $(this).parent();
				var nest = $(this).parent().parent();
				var dummy = $(".empty_model_place.ghost");
				deleteJsonModelWithName($(this).parent().attr("id"));
				placedModel.remove();
				dummy.clone().appendTo(nest).removeClass("ghost").fadeIn();
				setEquals();
			});
		}else{
			destroyTrigger.on("click", function(event){
				var placedModel = $(this).parent();
				var nest = $(this).parent().parent();
				var dummy = $(".empty_model_place.ghost");
				deleteJsonModelWithName($(this).parent().attr("id"));
				placedModel.remove();
				dummy.clone().appendTo(nest).removeClass("ghost").fadeIn();
				setEquals();
			});
		}
	};

  var setTimeRanges = function() {
    var dates = $("#view_option_from, #view_option_to").datepicker({
      maxDate: '0',
      changeMonth: true,
      onSelect: function( selectedDate ) {
        var option = this.id == "view_option_from" ? "minDate" : "maxDate",
        instance = $( this ).data( "datepicker" ),
        date = $.datepicker.parseDate(
          instance.settings.dateFormat ||
          $.datepicker._defaults.dateFormat,
          selectedDate, instance.settings );
        dates.not( this ).datepicker( "option", option, date );
      }
    });
    
  };
  
  var setOptionsBar = function() {
    var radioButtons = $('.options_menu > li > .option > input[type=radio]');
    if (radioButtons.length){
      
      radioButtons.each(function(index) {
        $(this).change(function() {
          
          $(this).parents(".options_menu").find(" > li.current").removeClass("current");
          $(this).parents(".options_menu").find(" > li > .option > input[type=radio]").removeAttr("checked");
          $(this).attr('checked', 'checked');
          $(this).closest("li").addClass("current");
          if ( $(this).closest("li").hasClass("view_option_custom") ){
            $(this).closest("label").animate({
              paddingRight: "350px"
              }, 300, function() {
                $(this).closest("li").find(".custom_range_settings").fadeIn();
            });
          }else{
            $(this).closest(".options_menu").find(".view_option_custom .custom_range_settings").hide();
            $(this).closest(".options_menu").find(".view_option_custom label").animate({
              paddingRight: "9px"
              }, 300
            );
            // $(this).closest("form").submit();
          }
        });
      });
      
    }
  };
  
  var openLayer = function(overlay, layer, layerBody) {
    layer.remove();
    $(layer).appendTo(overlay);
    overlay.show();
    layerBody.css({'overflow':'auto'});
    layer.fadeIn('slow', function(){
      var scrollTop = $(window).scrollTop();
      layer.css({'top':scrollTop + 'px'});
    });
  };
  
  var closeLayer = function(layerBody, layer, overlay){
    layerBody.css({'overflow':'auto'});
    layer.fadeOut('fast');
    overlay.hide();
  };
  
  var layerSizing = function(overlay){
    var fullWidth = $('body').outerWidth(true);
    var fullHeight = $('body').outerHeight(true);
    overlay.css({'height':fullHeight + 'px', 'width':fullWidth + 'px'});
  };
  
function setDialogs(modelID) {
    
    var overlay = $('.overlay');
    var layer = $('.dialog_body');
    var layerBody = $('.overlay').parent('body');
    var closeButton = $('.dialog_body .destroy_dialog');
    
    if ( modelID.length ){
      layer.find("h2 > strong").text(modelID);
    }
    
    openLayer(overlay, layer, layerBody);
    layerSizing(overlay);
    
    setEquals();
    setSortable();
    setFilterGroups();
    destroyGroup();
	
    closeButton.click(function() {
       closeLayer(layerBody, layer, overlay);
    });
    
    $(document).bind('keydown', function(e) { 
      if (e.which == 27) {
        closeLayer(layerBody, layer, overlay);
      }
    });
	
  }
  
  var activateSubmodelDialog = function(modelID) {
	setDialogs(modelID);
	fillSubModels(modelID);
	loadDaysField(modelID);
  };
  
  /**
   * stores the current changes in the local model
   * and pushes the changes to the server
   * 
   * @author maik.seyring
   * 
   * @param model ModelObject
   * @param $overlay jQuery
   */
  var saveModel = function saveModel(model, $overlay){
	  var $content = $overlay.find('div.content');
	  //load the data from the form into the model
	  
		$.ajax({
			type:"POST",
			beforeSend: function(x) {
				setLoadingDiv($content);
				if (x && x.overrideMimeType) {
				  x.overrideMimeType("application/json;charset=UTF-8");
				}
				x.setRequestHeader('no-realm', 'realm1');
			  },
			mimeType: "application/json",
			contentType: "application/x-www-form-urlencoded",
			dataType: "json",
			data: {model: JSON.stringify(model)},
			url: "ebl/v3/"+customerID+"/structure/update_model",
			success: function(json){
				unsetLoadingDiv($content);
				setMessagePopUp("positive", "message_data_saved_successfully");
			},
			error : function(jqXHR, textStatus, errorThrown)
			{
				if(jqXHR.status != null && jqXHR.status == 403)
				{
					setMessagePopUp("problem", "error_server_error_403");
				}
				else if(jqXHR.status != null && jqXHR.status == 401)
				{
					setMessagePopUp("problem", "error_server_error_401");
				}
				else if(jqXHR.status != null && jqXHR.status == 400)
				{
					setMessagePopUp("problem", "error_server_error_400");
				}
				else if(jqXHR.status != null && jqXHR.status == 404)
				{
					setMessagePopUp("problem", "error_server_error_404");
				}
				else if(jqXHR.status != null && jqXHR.status == 409)
				{
					setMessagePopUp("problem", "error_server_error_409");
				}
				else
				{
					setMessagePopUp("problem", "error_server_error");
				}
            }
		}); 
  }
  var cbModelConfig = {
	'initOverlay': function initOverlay(){},
	'checkSliders': function(){},
	'checkNumerics': function(){},
	'checkAttributes': function(){}
  }
  /**
   * @author maik.seyring
   */
  var activateCBModelDialog = function activateCBModelDialog(model){
	  var $overlay = $('#CB_model_configuration'),
	  $limitItems = $overlay.find('input[name="limitItems"]'),
	  $maxItemAge = $overlay.find('input[name="maxItemAge"]');
	  //show or hide the maxItemAge input fields
	  $limitItems
	  	.off('change')
	  	.on('change', function(){
	  		var $label = $overlay.find('#maxItemAge'),
	  		$elements = $label.find('input, select');
	  		if($(this).is(':checked')){
	  			$elements.removeAttr('disabled');
	  			$label.removeClass('disabled');
	  		}else{
	  			$label.addClass('disabled');
	  			$elements.attr('disabled', 'disabled');
	  		}
	  	});
	  if(model.maximumItemAge){
		  //we have a defined maximumItemAge --> the limitation has to be shown
		  $limitItems.attr('checked', true);
		  var maxItemAge = parseDurration(model.maximumItemAge);
		  if(maxItemAge.H){//there is a
			  $maxItemAge.val(maxItemAge.getHours());
			  $overlay.find('select[name="maxItemAgeUnit"]').val('H')
		  }else{
			  $maxItemAge.val(maxItemAge.getDays());
			  $overlay.find('select[name="maxItemAgeUnit"]').val('D')
		  }
		  
	  }else{
		  $limitItems.removeAttr('checked');		  
	  }
	  //trigger a change event to ensure the inputs are shown in the desired way
	  $limitItems.trigger('change');
	  layerSizing($overlay);
	  //init the click handler for the save button
	  $overlay.find('#save_cbmodel')
	  	.off('click')
	  	.on('click', function(){
	  		saveModel(model, $overlay);
	  	});
	  //init the click handler for the close button
	  $overlay
	  		.find('.destroy_dialog')
	  			.off('click')
	  			.on('click', function(){
	  				$overlay.hide(); 
	  			});
	  
	  //fetch the available attributes from server
	  $.ajax({
			dataType: "json",
			beforeSend: function (req) {
				req.setRequestHeader('no-realm', 'realm1');
			},
			url: "ebl/v3/"+customerID+"/structure/get_attribute_keys",
			success: function(json){
				//clean up prior set attributes
				var $attributes = $overlay.
									find('select[name^="attr"]')
										.find('option')
										.remove()
									.end(),
				options = '<option value="">unused</option>';
				for(var i = 0; i < json.stringList.length; i++){
					var options = options + '<option value="'+json.stringList[i]+'">'+json.stringList[i]+'</option>';
				}
				//TODO: remove just for testing purpose
//				options += '<option value="1">1</option>' + '<option value="2">2</option>' + '<option value="3">3</option>';
				
				$attributes.append(options);
			},
			error : function(jqXHR, textStatus, errorThrown)
			{
				if(jqXHR.status != null && jqXHR.status == 403)
				{
					setMessagePopUp("problem", "error_server_error_403");
				}
				else if(jqXHR.status != null && jqXHR.status == 401)
				{
					setMessagePopUp("problem", "error_server_error_401");
				}
				else if(jqXHR.status != null && jqXHR.status == 400)
				{
					setMessagePopUp("problem", "error_server_error_400");
				}
				else if(jqXHR.status != null && jqXHR.status == 404)
				{
					setMessagePopUp("problem", "error_server_error_404");
				}
				else if(jqXHR.status != null && jqXHR.status == 409)
				{
					setMessagePopUp("problem", "error_server_error_409");
				}
				else
				{
					setMessagePopUp("problem", "error_server_error");
				}
          }
	  }).done(function(data){
		  
		  //init the sliders
		  var $sliders = $overlay.find('div.attr_slider')
		  		.slider({
		  			'min': 1,
		  			'max': 100,
		  			'step': 1,
		  			'value': 1
		  		})
		  		.slider('disable');
		  $overlay.find('select[name^="attr"]')
		  	.off('change')
		  	.on('change', function(){
//			  console.log('fire');
			  var $this = $(this),
			  name = $this.attr('name');
			  if($this.val()){
				  //find the corresponding weight slider and enable it
				  $overlay.find('div#slider_'+name).slider('enable');
				  //enable the numeric marker
				  $overlay.find('input[name="'+ name +'_numeric"]')
				  	.removeAttr('disabled');
				  //disable the options
			  }else{
				  //disable the slide
				  $overlay.find('div#slider_'+name).slider('disable');
				  //uncheck the checkbox
				  $overlay.find('input[name="'+ name +'_numeric"]')
				  	.removeAttr('checked')
				  	.attr('disabled','disabled');
			  }
		  });
//TODO: Remove from code --> other solution prefered
//		  // remove attributes which do not exist in the attributes list stored in "data" (ajax response)
//		  
//		  var attrNames = []; // remove also attributes which occur multiple times / array to keep track of attributes
//		  outer: for(var l = 0; l < model.attributes.length; l++){
////			  console.log(model.attributes);
//			  for (var names = 0; names < attrNames.length; ++names){
//				  if(attrNames[names] == model.attributes[l].name){
//					  //remove attribute if already exists
//					  model.attributes.splice(l,1);
//					  l--;
//					  continue outer;
//				  }
//				  attrNames.push(model.attributes[l].name);
//			  }
//			  for(var i = 0; i < data.stringList.length; i++){
//				  if(model.attributes[l].name == data.stringList[i]){
//					  //continue if attribute is in list
//					  continue outer;
//				  }
//			  }
//			  //remove the attribute if not in list
//			  model.attributes.splice(l,1);
//			  l--;
//		  }
		  //sort the attributes according their weight, to diaplay the heaviest on top
		  model.attributes.sort(function(a,b){return b.weight - a.weight});
		  //indicator for existence of nominal attribute
		  var hasNominal = false;
		  //process all attributes
		  for(var i = 0; i < model.attributes.length; i++){
			  $overlay.find('select[name="attr' + i + '"]').val(model.attributes[i].name);
			  $overlay.find('input[name="attr' + i + '_numeric"]').removeAttr('disabled');
			  $sliders.filter('#slider_attr' + i).slider('enable').slider('value', model.attributes[i].weight);
			  var $numeric = $overlay.find('input[name="attr' + i + '"]').removeAttr('disabled');
			  if(model.attributes[i].type == 'NUMERIC'){
				  $numeric.attr('checked', true);
			  }else{
				  hasNominal = true;
				  $numeric.removeAttr('checked');
			  }
			  //check whether the configuration has at least one nominal attribute
			  if(i==2 || i == model.attributes.length - 1){
				  if(!hasNominal){
					$numeric.removeAttr('checked');  
				  }
				  
				  break;
			  }
		  }
		  //create a valid configuration if no attributes are defined for the model
		  if(!model.attributes.length){
			  ;
		  }
		  //show the finished overlay
		  $overlay.show();
	  });
	  
  };
  
  var activateDialog = function() {
    var openButton = $(".configure_model, .switch > a, .change_password");
    openButton.on("click", function(event){
      var modelID = $(this).closest("li.model").find("h5").text();
      setDialogs(modelID);
	  if(modelID != "")
	  {
		fillSubModels(modelID);
	  }
    });
  };

  var destroyGroup = function() {
    var destroyButton = $(".destroy_group");
    if( typeof(destroyButton.live) != "undefined"){
	    destroyButton.live("click", function(event){
	    	var group = $(this).parent().parent();
	    	var targetList = $("ul.grouping_attributes");
	    	removableItems = group.find("ul.user_created_group > li").removeAttr("class").removeAttr("style");
	    	removableItems.clone().appendTo(targetList);
	    	group.remove();
	    	setEquals();
	    });
    }else{
    	 destroyButton.on("click", function(event){
 	    	var group = $(this).parent().parent();
 	    	var targetList = $("ul.grouping_attributes");
 	    	removableItems = group.find("ul.user_created_group > li").removeAttr("class").removeAttr("style");
 	    	removableItems.clone().appendTo(targetList);
 	    	group.remove();
 	    	setEquals();
 	    });
    }
  };

  var setFilterGroups = function() {
    
    var newButton = $(".create_one_more_group");
    newButton.on("click", function(event){
      
      var original = $(this).parent().prev();
      var inlineNumber = parseInt(original.find("h5 > span").text()) + 1;
      // alert(inlineNumber);
      
      $(original).clone().insertBefore($(this).parent());
      $(this).parent().prev().find("h5 > span").text(inlineNumber);
      $(this).parent().prev().find("ul.user_created_group > li").remove();
      setEquals();
      setSortable();
      
    });
  };
  
  var setMessages = function() {
    
    var destroyMessageTrigger = $('.message .destroy_message, .message .close');
    destroyMessageTrigger.on("click", function(event){
      $(this).closest('.message').fadeOut('fast');
    });
    
  };
  
  var autodestructionMessage = function() {
    alert('change');
  };
  
 /* var setToolTips = function()
  {
    
    var tipTrigger = $('.tooltip_trigger'); 
    tipTrigger.each(function()
    {
      var content = $(this).find('span.tooltip');
      $(this).qtip(
      {
        show: { event: 'click' },
        hide: { event: 'unfocus' },
        content: content,
        position:
        {
          my: 'top right',  // Position my top left...
          at: 'bottom center',
          viewport: $(window)
        }
      });
    });

  }; */
  
  $(document).ready(function () {
    setModelsGroupsHeight();
    setChartsDimensions();
    setTimeRanges();
    //setToolTips();
    setEquals();
    setAccordions();
    setSortable();
    setDragDrop();
    setMessages();
    setOptionsBar();
    activateDialog();
    setFilterGroups();
    destroyGroup();
    destroyPlacedModel();
  });
  
  $(window).load(function() {
    setChartsDimensions();
		setEquals();
  });
  
  $(window).resize(function() {
    setModelsGroupsHeight();
    setChartsDimensions();
    setEquals();
    if ( $('.overlay').is(":visible") ){
      layerSizing($('.overlay'));
    }
    
  });
 