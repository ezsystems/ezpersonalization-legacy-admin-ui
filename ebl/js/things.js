


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
			var $select = $overlay.find('select[name="attr' + l + '"]');
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
		var removableItems = group.find("ul.user_created_group > li").removeAttr("class").removeAttr("style");
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

//var setFilterGroups = function () {
//
//
//};

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
//	setAccordions();
//	setSortable();
	setMessages();
//	setFilterGroups();
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
 