// css({'border-top':'5px solid red'})
// Equalizer by Jurij Burkanov

(function ($) {

	var appDims;
	function dimensions(applicant) {

		appDims = new Object();
		appDims.padTop = [ applicant.css("padding-top").replace("px", "") ];
		appDims.padBot = [ applicant.css("padding-bottom").replace("px", "") ];
		appDims.borTop = [ applicant.css("border-top-width").replace("px", "") ];
		appDims.borBot = [ applicant.css("border-bottom-width").replace("px", "") ];
		appDims.clearHeight = [ applicant.innerHeight() ];
		return appDims;

	}


	function equalizationProcess(obj, options) {

		var eqItems = options.eqItems,
			exclItems = options.exclItems,
			segmentSize = options.segmentSize,
			applicantSelector = options.applicantSelector,

			fullGroup = obj.find(eqItems).not(exclItems),
			numberOfGroups = (fullGroup.length) / segmentSize,
			i,
			subGroup,
			groupHeights,
			maxHeight;
		function calcDims() {
			var applicant = $(this).find(applicantSelector);
			applicant.css({'height': 'auto', 'minHeight': '0'});
			dimensions(applicant);
			groupHeights.push(parseInt(appDims.clearHeight, 10) + parseInt(appDims.borBot, 10) + parseInt(appDims.borTop, 10));
		}
		function setDims() {
			var applicant = $(this).find(applicantSelector);
//			dimensions(applicant);
			var height = (maxHeight - parseInt(appDims.borBot, 10) - parseInt(appDims.borTop, 10) - parseInt(appDims.padTop, 10) - parseInt(appDims.padBot, 10)) + 'px';
			applicant.css('min-height', height);
		}
		for (i = 0; i < numberOfGroups; ++i) {
			subGroup = fullGroup.slice((segmentSize * i), (segmentSize * (i + 1))); // selecting equalized items
			groupHeights = []; // massive of heights to compare inside of segment
			subGroup.each(calcDims);
			maxHeight = Math.max.apply(null, groupHeights);
			subGroup.each(setDims);
		}

	}


	$.fn.extend({
		equalize: function (options) {

			var defaults = {
				eqItems:           " > li",
				exclItems:         "",
				segmentSize:       2,
				applicantSelector: "> div"
			};

			options = $.extend(defaults, options);

			return this.each(function () {

				equalizationProcess($(this), options);

			});

		}
	});
})(jQuery);