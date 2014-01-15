
/** It loads the specified scripts and call the specified callback functions.
 *  It works similar to jQuery.getScript function with some additional features:<br>
 *  
 *     1. It is able to load multiple scripts simultaneously.<br>
 *     2. It loads scripts in cross domain mode (see $.ajax description).<br>
 *     3. It allows browser to use the cache.<br>
 */
var include = function(scripts, callback) {
	var arguments = [];
	
	for (var i in scripts) {
		arguments.push(cachedScript(scripts[i]));
	}
    
	$.when.apply(null, arguments).done(function() {
		callback();
	});
};


var cachedScript = function(url) {
 	  options = {
 			crossDomain: true, // it adds script tag and allows to debug included file 
		    dataType: "script",
		    cache: true,
		    url: url
	  };
	  return jQuery.ajax( options );
};


var setChartsDimensions = function () {
//conversion_rate
	var chartCanvas = $('canvas');
	if (chartCanvas.length) {
		chartCanvas.each(function (index) {
			var targetWidth = $(this).parent().innerWidth()-1;
			$(this).attr('width', targetWidth);
		});
		if (typeof rightLine !== 'undefined') {
			rightLine.Draw();
		}
		if (typeof middlebar !== 'undefined') {
			middlebar.Draw();
		}
		if (typeof leftbar !== 'undefined') {
			leftbar.Draw();
		}
	}
};

var setEquals = function () {

	$(".groups_base").equalize({
		eqItems:           " > li",
		exclItems:         ":last-child",
		segmentSize:       4,
		applicantSelector: "> ul"
	});

	$(".list_of_models").equalize({
		eqItems:           "> .model",
		exclItems:         ".dummymodel",
		segmentSize:       2,
		applicantSelector: "> div"
	});

	$(".storyboards_base").equalize({
		eqItems:           "> div > ul > li",
		segmentSize:       3,
		applicantSelector: "> div"
	});

	$(".available_scenarios").equalize({
		eqItems:           "> li:visible",
		segmentSize:       5,
		applicantSelector: "> *"
	});

};

var setAccordions = function () {

	var accordion = $(".accordion");

	if (accordion.length) {
		accordion.accordion({
			autoHeight: false,
			change:     function () {
				setEquals();
			}
		});
	}

};

var setSortable = function () {

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

var setModelsGroupsHeight = function () {

	var modelsContainer = $(".models_groups");
	var storyContainer = $(".storyboards_base");
	if (modelsContainer.length) {
		var offset = modelsContainer.offset();
		var screenHeight = $(window).height();
		var mod = 20;
		modelsContainer.css({'height': ( screenHeight - offset.top - mod ) + 'px'});
		storyContainer.css({'height': ( screenHeight - offset.top + mod ) + 'px'});
	}

};


var setDragDrop = function () {
	$(".model").draggable({
		connectToSortable: ".empty_model_place",
		helper:            "clone",
		helper:            function (event) {
			return $('<div class="helper_on_the_move"/>').text($(this).find("h5").text());
		},
		cursorAt:          {
			left:   100,
			bottom: 0},
		start:             function (event, ui) {
			setEquals();
		},
		stop:              function (event, ui) {
			setEquals();
		},
		revert:            "invalid"
	});
	$(".empty_model_place").sortable({
		revert:  true,
		over:    function (event, ui) {
			$(this).css({'padding': '0'});
		},
		receive: function (event, ui) {
			createPlacedModel($(this));
		}
	});
};



/** Returns the first non-null argument */
var ifnull = function() {
	
	var i18n_params = Array.prototype.slice.call(arguments, 0);
	
	for (var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] === 'undefined' || arguments[i] == null) {
			continue;
		}
		return arguments[i];
	}
	
	return null;
};


var setLiveDragDrop = function (element) {
	element.draggable({
		//connectToSortable: ".empty_model_place",
		//helper: "clone",
		helper:            function (event) {
			$.cookie('draggedId', $(this).attr("id"));
			return $('<div class="helper_on_the_move"/>').text($(this).find("h5").text());
		},
		cursorAt:          {
			left:   100,
			bottom: 0},
		start:             function (event, ui) {
			$(this).addClass('dropable_model');
			setEquals();
		},
		stop:              function (event, ui) {
			$('.empty_model_place').removeAttr('style');
			setEquals();
		},
		revert:            "invalid"
	});

	$(".empty_model_place").droppable({
		'revert':  true,
		//over:    function (event, ui) {
		//	$(this).css({'padding': '0'});
		//},
		'accept': '.dropable_model',
		'drop': function (event, ui) {
//			createPlacedModel($(this));
			createPlacedModel($(this), $(ui.draggable));
		}
	});
};

var createPlacedModel = function (placed_model, model) {
	var nest = placed_model.parent();
	var ghostModel = $(".placed_model.ghost");
	var refCode = $.cookie('draggedId');
	var refCodeWithoutStage = refCode.substring(6, refCode.length);
	refCode = refCode.substring(6, refCode.length);
	var parentStage = nest.parent().parent();
	var stageId = parentStage.attr("id");
	var modelIndex = nest.attr("id").substring(5, 6);
	var stageNumber = stageId.charAt(stageId.length - 1);
	refCode = (parseInt(stageNumber, 10) - 1) + "_" + modelIndex + "_" + refCode;
//	var title = placed_model.find("li.model").children("div").children("h5").text();
	var title = model.find("div > h5 > span.mtitle").text();
	var infos = $("span.info");
	if(infos != null &&  infos != 'undefined'){
		var infos2 = model.find(infos);
		if(infos2 != null &&  infos2 != 'undefined'){
			title = title +infos2.html();
		}
	}
	
	placed_model.remove();
	ghostModel = ghostModel.clone().appendTo(nest).removeClass("ghost").fadeIn();
	//ghostModel = nest.children("div");
	ghostModel.attr("id", refCode);
	ghostModel.find("h4").html(title);
//	ghostModel.find("p.description").text(placed_model.find("li.model").children("div").children("p").children("span").text());
	var $span = model.find("div > p > span");
	ghostModel.find("h4").attr('title-translate',$span.attr('data-translate'));
	ghostModel.find("h4").attr('title',$span.text());
//	ghostModel.find("p.description").text($span.text()).attr('data-translate', $span.attr('data-translate'));

	ghostModel.children("form").find('label[for="placed_model_context_type_profile"]').attr("for", "placed_model_context_type_profile" + "_" + refCode);
	ghostModel.children("form").find('label[for="placed_model_context_type_website"]').attr("for", "placed_model_context_type_website" + "_" + refCode);
	ghostModel.children("form").find('input[id="placed_model_context_type_profile"]').attr("id", "placed_model_context_type_profile" + "_" + refCode).attr("name", "placed_model_context_type" + "_" + refCode);
	ghostModel.children("form").find('input[id="placed_model_context_type_website"]').attr("id", "placed_model_context_type_website" + "_" + refCode).attr("name", "placed_model_context_type" + "_" + refCode);
//		ghostModel.children("form").find('input[id="weight_model"]').attr("id", "weight_model" + "_" + refCode);
//		ghostModel.children("form").find('label[for="weight_model"]').attr("for", "weight_model" + "_" + refCode);
	ghostModel.children("form").find('input[id="use_submodels"]').attr("id", "use_submodels_" + refCode);
	var modelRefList = $('body').data('model_list');
	for (var l = 0; l < modelRefList.modelRefArray.length; l++) {
		if (modelRefList.modelRefArray[l].referenceCode === refCodeWithoutStage) {
			//hide the elements, that are not supported.
			submodelsSupported = modelRefList.modelRefArray[l].submodelsSupported;
			websiteContextSupported = modelRefList.modelRefArray[l].websiteContextSupported;
			profileContextSupported = modelRefList.modelRefArray[l].profileContextSupported;
		}
	}

	if (!submodelsSupported) {
		ghostModel.find(".usesubmodels").hide();
	}
	if (websiteContextSupported == false || profileContextSupported == false) {
		ghostModel.find(".context_options").hide();
	}


	createJsonModel(ghostModel, refCodeWithoutStage);

	setEquals();
};

var destroyPlacedModel = function () {
	$('body').on("click",".destroy_placed_model" ,  function (event) {
		var placedModel = $(this).parent();
		var nest = $(this).parent().parent();
		var dummy = $(".empty_model_place.ghost");
		deleteJsonModelWithName($(this).parent().attr("id"));
		placedModel.remove();
		dummy.clone().appendTo(nest).removeClass("ghost").fadeIn();
		setEquals();
	});
};

var setTimeRanges = function () {
	var dates = $("#view_option_from, #view_option_to").datepicker({
		maxDate:     '0',
		changeMonth: true,
		onSelect:    function (selectedDate) {
			var option = this.id == "view_option_from" ? "minDate" : "maxDate",
				instance = $(this).data("datepicker"),
				date = $.datepicker.parseDate(
					instance.settings.dateFormat ||
						$.datepicker._defaults.dateFormat,
					selectedDate, instance.settings);
			dates.not(this).datepicker("option", option, date);
		}
	});

};

var setOptionsBar = function () {
	var radioButtons = $('.options_menu > li > .option > input[type=radio]');
	if (radioButtons.length) {

		radioButtons.each(function (index) {
			$(this).change(function () {

				$(this).parents(".options_menu").find("> li.current").removeClass("current");
				$(this).parents(".options_menu").find("> li > .option > input[type=radio]").removeAttr("checked");
				$(this).attr('checked', 'checked');
				$(this).closest("li").addClass("current");
				if ($(this).closest("li").hasClass("view_option_custom")) {
					$(this).closest("label").animate({
						paddingRight: "350px"
					}, 300, function () {
						$(this).closest("li").find(".custom_range_settings").fadeIn();
					});
				} else {
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

var openLayer = function (overlay, layer, layerBody) {
	layer.remove();
	$(layer).appendTo(overlay);
	overlay.show();
	layerBody.css({'overflow': 'auto'});
	layer.fadeIn('slow', function () {
		var scrollTop = $(window).scrollTop();
		layer.css({'top': scrollTop + 'px'});
	});
};

var closeLayer = function (layerBody, layer, overlay) {
	layerBody.css({'overflow': 'auto'});
	layer.fadeOut('fast');
	overlay.hide();
};

var layerSizing = function (overlay) {
	var fullWidth = $('body').outerWidth(true);
	var fullHeight = $('body').outerHeight(true);
	overlay.css({'height': fullHeight + 'px', 'width': fullWidth + 'px'});
};

function setDialogs(modelID) {

	var overlay = $('.overlay');
	var layer = $('.dialog_body');
	var layerBody = overlay.parent('body');
	var closeButton = $('.dialog_body .destroy_dialog');

	if (modelID.length) {
		layer.find("h2 > strong").text(modelID);
	}

	openLayer(overlay, layer, layerBody);
	layerSizing(overlay);

	setEquals();
	setSortable();
	setFilterGroups();
	//destroyGroup();

	closeButton.on('click',function () {
		closeLayer(layerBody, layer, overlay);
	});

	$(document).on('keydown', function (e) {
		if (e.which === 27) {
			closeLayer(layerBody, layer, overlay);
		}
	});

}

var activateSubmodelDialog = function (modelID, title) {
	$('.overlay').find('.model_name').html(title);
	setDialogs(modelID);
	fillSubModels(modelID);
	loadDaysField(modelID);
};

/**
 * returns an object which represents the duration string
 * @author: maik.seyring
 */
var parseDuration = (function () {
	function getHours() {
		return (((((this.Y * 12) + this.M) * 30) + this.D) * 24) + this.H + (this.m > 30 ? 1 : 0);
	}

	function getDays() {
		return (((this.Y * 12) + this.M) * 30) + this.D + (this.H > 12 ? 1 : 0);
	}

	function getXSDuration() {

		return this.getHours() ?
			'P' +
			(this.Y ? this.Y + 'Y' : '') +
			(this.M ? this.M + 'M' : '') +
			(this.D ? this.D + 'D' : '') +
			(this.H || this.m || this.S ? 'T' : '') +
			(this.H ? this.H + 'H' : '') +
			(this.m ? this.m + 'M' : '') +
			(this.S ? this.S + 'S' : ''):
			null;
	}

	return function parseDuration(str) {

		var RegEx = /(-?)P((\d{1,8})Y)?((\d{1,8})M)?((\d{1,8})D)?(T((\d{1,8})H)?((\d{1,8})M)?((\d{1,8}(\.\d{1,8})?)S)?)?/,
			years = 3,
			months = 5,
			days = 7,
			hours = 10,
			minutes = 12,
			seconds = 14,
			match = [],
			res = {
				'getHours':      getHours,
				'getDays':       getDays,
				'getXSDuration': getXSDuration
			};
		if (typeof str === 'string') {
			match = str.match(RegEx);
		}
		res.Y = match[years] | 0;
		res.M = match[months] | 0;
		res.D = match[days] | 0;
		res.H = match[hours] | 0;
		res.m = match[minutes] | 0;
		res.S = match[seconds] | 0;
		return res;
	};
})();


/**
 * save a model on the server
 * @param model - Model Object to be saved
 * @param $content - Dom Object where the loading indicator is attached to
 * @return jqXHR
 *
 * @author maik.seyring
 */
var saveModel = function(model, $content){
	return $.ajax({
		type:        "POST",
		beforeSend:  function (x) {
			setLoadingDiv($content);
			if (x && x.overrideMimeType) {
				x.overrideMimeType("application/json;charset=UTF-8");
			}
			x.setRequestHeader('no-realm', 'realm1');
		},
		mimeType:    "application/json",
		contentType: "application/json;charset=UTF-8",
		dataType:    "json",
		data:        JSON.stringify(model),
		url:         "ebl/v3/" + customerID + "/structure/update_model",
		success:     function (json) {
			unsetLoadingDiv($content);
			setMessagePopUp("positive", "message_data_saved_successfully");
			updateModelInfo($('#model_' + json.model.referenceCode), json.model);
		},
		error:       function (jqXHR, textStatus, errorThrown) {
			if (jqXHR.status !== null && jqXHR.status === 403) {
				setMessagePopUp("problem", "error_server_error_403");
			}
			else if (jqXHR.status !== null && jqXHR.status === 401) {
				setMessagePopUp("problem", "error_server_error_401");
			}
			else if (jqXHR.status !== null && jqXHR.status === 400) {
				setMessagePopUp("problem", "error_server_error_400");
			}
			else if (jqXHR.status !== null && jqXHR.status === 404) {
				setMessagePopUp("problem", "error_server_error_404");
			}
			else if (jqXHR.status !== null && jqXHR.status === 409) {
				setMessagePopUp("problem", "error_server_error_409");
			}
			else {
				setMessagePopUp("problem", "error_server_error");
			}
		}
	});
};

/**
 * stores the current changes in the local model
 * and pushes the changes to the server
 *
 * @author maik.seyring
 *
 * @param model ModelObject
 * @param $overlay jQuery Object which represents the configuration overlay
 */
var saveCBModel = function saveCBModel(model, $overlay) {
	var $content = $overlay.find('div.content'),
		duration = parseDuration(),
		unit = $overlay.find('select[name="maxItemAgeUnit"]').val(),
		$input,
		key,
		type,
		weight,
		l = 3;
	duration[unit] = parseInt($overlay.find('input[name="maxItemAge"]').val(), 10);
	duration[unit] = duration[unit] === NaN ? 0 : duration[unit];
	model.maximumItemAge = duration.getXSDuration();
	if(!startsWith('CBFT', model.modelType, true)) {
		model.attributes = [];
		//load the attributes from the form into the model
		while (l--) {
			$select = $overlay.find('select[name="attr' + l + '"]');
			key = $select.val();
			if (key) {
				weight = $overlay.find('#slider_attr' + l).slider('value');
				type = $select.find('option:selected').data('type');
				model.attributes.push(
					{
						'key':   key,
						'weight': weight,
						'type':   type
					}
				);
			}
		}
	}
	saveModel(model, $content);
};

/**
 * show an overlay to configure a cb model
 * @author maik.seyring
 */
var activateCBModelDialog = function activateCBModelDialog(model, title) {
	//console.log(model);
	var $overlay = $('#CB_model_configuration'),
		$maxItemAge = $overlay.find('input[name="maxItemAge"]'),
		$hintSpace = $overlay.find('.hintSpace');
	$overlay.find('.model_name').html(title);
	if (model.maximumItemAge) {
		var maxItemAge = parseDuration(model.maximumItemAge);
		if (maxItemAge.H) {//there is a period set
			$maxItemAge.val(maxItemAge.getHours());
			$overlay.find('select[name="maxItemAgeUnit"]').val('H');
		} else {
			$maxItemAge.val(maxItemAge.getDays());
			$overlay.find('select[name="maxItemAgeUnit"]').val('D');
		}
	}
	$maxItemAge.off('change')
		.on('change', function(){
			var val = $(this).val();
			if (val.length) {
				val = parseInt(val, 10);
			} else {
				$('#save_cbmodel').addClass('inactive');
				$hintSpace
					.find('#maxItemsAgeMessage')
					.attr('data-translate', 'configurator_error_invalid_max_item_age');
				localizer();
				return false;
			}
			if (isNaN(val) || val < 1) {
				$('#save_cbmodel').addClass('inactive');
				$hintSpace
					.find('#maxItemsAgeMessage')
					.attr('data-translate', 'configurator_message_invalid_max_item_age');
				localizer();
				return false;
			}
			$('#save_cbmodel').removeClass('inactive');
			$hintSpace
				.find('#maxItemsAgeMessage')
				.attr('data-translate', 'configurator_message_changes_after_model_rebuild');
			localizer();
		});

	layerSizing($overlay);
	//init the click handler for the save button
	$overlay
		.find('#save_cbmodel')
			.off('click')
			.on('click', function () {
				if($(this).hasClass('inactive')){
					return;
				}
				saveCBModel(model, $overlay);
			});
	//init the click handler for the close button
	$overlay
		.find('.destroy_dialog')
		.off('click')
		.on('click', function () {
			$overlay.hide();
		});

	//fetch the available attributes from server
	if('attributes' in model ){
		$('#cb_attributes').show();
		$.ajax({
			'dataType':   "json",
			'beforeSend': function (req) {
				req.setRequestHeader('no-realm', 'realm1');
			},
			'url':        "ebl/v3/" + customerID + "/structure/get_attribute_pks",
			'success':    function (json) {
				var l = model.attributes.length,
					i;
				//console.log(model);
				outer:
					while(l--){
						i = json.attributePkList.length;
						while(i--){
							if(model.attributes[l].key === json.attributePkList[i].key && model.attributes[l].type === json.attributePkList[i].type){
								continue outer;
							}
						}
						json.attributePkList.push({
							'key': model.attributes[l].key,
							'type': model.attributes[l].type
						});
					}
				json.attributePkList.sort(function (a, b) {
					return a.key.toLowerCase() < b.key.toLowerCase() ? -1 : 1;
				});
				//clean up prior set of attributes
				var $attributes = $overlay.
						find('select[name^="attr"]')
						.find('option')
						.remove()
						.end(),
					attr,
					options = '<option value="" data-translate="configurator_select_attribute">select attribute</option>',
					length = json.attributePkList.length;
				for (i = 0; i < length; i++) {
					attr = json.attributePkList[i];
					options = options +
						'<option data-type="' + attr.type + '" value="' + attr.key + '">' +
						attr.key +
						(attr.type !== 'NOMINAL' ? ' (' + attr.type.toLowerCase() + ')' : '') +
						'</option>';
					//options = options + '<option value="'+json.stringList[i]+'">'+json.stringList[i]+'</option>';
				}
				$attributes.append(options);
			},
			error:      function (jqXHR, textStatus, errorThrown) {
				if (jqXHR.status !== null && jqXHR.status === 403) {
					setMessagePopUp("problem", "error_server_error_403");
				}
				else if (jqXHR.status !== null && jqXHR.status === 401) {
					setMessagePopUp("problem", "error_server_error_401");
				}
				else if (jqXHR.status !== null && jqXHR.status === 400) {
					setMessagePopUp("problem", "error_server_error_400");
				}
				else if (jqXHR.status !== null && jqXHR.status === 404) {
					setMessagePopUp("problem", "error_server_error_404");
				}
				else if (jqXHR.status !== null && jqXHR.status === 409) {
					setMessagePopUp("problem", "error_server_error_409");
				}
				else {
					setMessagePopUp("problem", "error_server_error");
				}
			}
		}).done(function (data) {
				//init the sliders
				var $sliders = $overlay.find('div.attr_slider')
						.slider({
							'min':      0,
							'max':      100,
							'step':     1,
							'value':    0,
							'disabled': true
						}),
				//representation of the attributes
					$selects = $overlay.find('select[name^="attr"]');
				$selects.off('change')
					.on('change', function () {
						//enable all options for the case one attribute was deselected
						$selects.find('option').removeAttr('disabled');
						var count = 0,
							hasNominal = false,
							values = [];
						//check if there is more than one selected attribute
						//and if at least one of the selected has the type NOMINAL
						$selects.each(function (index) {
							var $this = $(this),
								value = $this.val();
							if (value) {
								count++;
								values.push(value);
							}
							if ($this.find(':selected').data('type') === 'NOMINAL') {
								hasNominal = true;
							}
						});
						$selects.each(function (index) {
							var $this = $(this),
								name = $this.attr('name'),
								value = $this.val();
							if (count > 1 && value) {
								// we have more than one attribute hence we enable the slider for this attribute
								$overlay.find('div#slider_' + name).slider('enable');
							} else {
								//disable the slider
								$overlay.find('div#slider_' + name).slider('disable');
							}
							if (value) {//disable the options in the other selects
								$selects
									.not($this)
									.find('option[value="' + value + '"]')
									.attr('disabled', 'disabled');
							}
						});
						//we have no valid configuration
						if (!hasNominal) {
							$overlay
								.find('#hasNominalMessage')
								.attr('data-translate', 'configurator_message_select_nominal_attribute');
						}else{
							$overlay
								.find('#hasNominalMessage')
								.html('')
								.removeAttr('data-translate');
						}
						if (count > 2) {
							$overlay
								.find('#attrCountMessage')
								.attr('data-translate', 'configurator_message_not_more_than_two');
						}else{
							$overlay
								.find('#attrCountMessage')
								.html('')
								.removeAttr('data-translate');
						}
						localizer();
					});
				//sort the attributes according their weight, to display the heaviest on top
				model.attributes.sort(function (a, b) {
					return b.weight - a.weight;
				});
				//process all attributes
				for (var i = 0; i < model.attributes.length; i++) {
					$overlay.find('select[name="attr' + i + '"]').val(model.attributes[i].key);
					$sliders.filter('#slider_attr' + i).slider('enable').slider('value', model.attributes[i].weight);
				}
				//trigger a change event to show all attributes in a valid manner
				$overlay.find('select[name="attr0"]').trigger('change');
		    
				$maxItemAge.trigger('change');
				//show the finished overlay
				$overlay.show();
			});
	}else{
		$('#cb_attributes').hide();
		$maxItemAge.trigger('change');
		//show the finished overlay
		$overlay.show();
	}
};

/**
 * saves the configuration of a random model on the server
 * @param $overlay
 * @param model
 */
var saveRandomModel = function(model, $overlay){
	var $content = $overlay.find('div.content'),
		duration = parseDuration(),
		unit = $overlay.find('select[name="maxItemAgeUnit"]').val();
	duration[unit] = parseInt($overlay.find('input[name="maxItemAge"]'), 10);
	model.maximumItemAge = duration.getXSDuration;
	saveModel(model, $content);
};

/**
 * show Random Sub-Model View
 * @author maik.seyring
 */
var activateRandomModelDialog = function (model, title) {
	var $overlay = $('#random_model_configuration'),
		$maxItemAge = $overlay.find('input[name="maxItemAge"]');
	$overlay.find('.model_name').html(title);
	if (model.maximumItemAge) {
		var maxItemAge = parseDuration(model.maximumItemAge);
		if (maxItemAge.H) {//there is a period set
			$maxItemAge.val(maxItemAge.getHours());
			$overlay.find('select[name="maxItemAgeUnit"]').val('H');
		} else {
			$maxItemAge.val(maxItemAge.getDays());
			$overlay.find('select[name="maxItemAgeUnit"]').val('D');
		}
	}
	layerSizing($overlay);
	//init the click handler for the save button
	$overlay.find('#save_random_model')
		.off('click')
		.on('click', function () {
			saveRandomModel(model, $overlay);
		});
	//init the click handler for the close button
	$overlay
		.find('.destroy_dialog')
		.off('click')
		.on('click', function () {
			$overlay.hide();
		});
	//show the finished overlay
	$overlay.show();
};


var activateDialog = function () {
	var openButton = $(".configure_model, .change_password");
	openButton.on("click", function (event) {
		var modelID = $(this).closest("li.model").find("h5").text();
		setDialogs(modelID);
		if (modelID !== "") {
			fillSubModels(modelID);
		}
	});
};

var destroyGroup = function () {
	$('body')
	.on("click", ".destroy_group", function (event) {
		var group = $(this).parent().parent();
		var targetList = $("ul.grouping_attributes");
		removableItems = group.find("ul.user_created_group > li").removeAttr("class").removeAttr("style");
		removableItems.clone().appendTo(targetList);
		group.remove();
		setEquals();
	});
	destroyGroup = function(){};
};

var initRemoveAttributeValue = function () {
	$('body')
		.on("click", ".remove_attribute_value", function (e) {
			var $this = $(this);
			e.preventDefault();
			e.stopPropagation();
			$this.parent()
				.appendTo($("ul.grouping_attributes"));
			$this.remove();
			setEquals();
		});
	initRemoveAttributeValue = function(){};
};

var setFilterGroups = function () {

	var newButton = $(".create_one_more_group");
	newButton.on("click", function (event) {

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

var setMessages = function () {

	var destroyMessageTrigger = $('.message .destroy_message, .message .close');
	destroyMessageTrigger.on("click", function (event) {
		if ( ! $(this).attr("href")) {
			$(this).closest('.message').fadeOut('fast');	
		}
	});
};

var autodestructionMessage = function () {
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


//helper function which tests whether a string starts with a substring
function startsWith(needle, haystack, lower){
	var n = needle,
		h = haystack;
	if(lower){
		n = n.toLowerCase();
		h = h.toLowerCase();
	}
	return (h.substr(0, n.length) === n);
}

$(document).ready(function () {
	setModelsGroupsHeight();
	setChartsDimensions();
	setTimeRanges();
	//setToolTips();
	setEquals();
	setAccordions();
	setSortable();
	//setDragDrop();
	setMessages();
	setOptionsBar();
	activateDialog();
	setFilterGroups();
	destroyGroup();
	initRemoveAttributeValue();
	destroyPlacedModel();

});

$(window).load(function () {
	setChartsDimensions();
	setEquals();
});

$(window).resize(function () {
	setModelsGroupsHeight();
	setChartsDimensions();
	setEquals();
	if ($('.overlay').is(":visible")) {
		layerSizing($('.overlay'));
	}

});
 