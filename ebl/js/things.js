


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
			error: configuratorErrorHandler
			
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
	setChartsDimensions();
	setTimeRanges();
	setEquals();
	setAccordions();
	setSortable();
	setMessages();
	setOptionsBar();
	setFilterGroups();
	destroyGroup();
	initRemoveAttributeValue();
});

$(window).load(function () {
	setChartsDimensions();
	setEquals();
});

$(window).resize(function () {
//	setModelsGroupsHeight();
	setChartsDimensions();
	setEquals();
	if ($('.overlay').is(":visible")) {
		layerSizing($('.overlay'));
	}

});
 