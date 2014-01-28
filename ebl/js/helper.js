



/** Parses the query string and returns name/value pairs as map.
 */
function getUrlVars() {
    var vars = [];
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++) {
        var hash = hashes[i].split('=');
        vars.push(decodeURIComponent(hash[0]));
        vars[decodeURIComponent(hash[0])] = decodeURIComponent(hash[1]);
    }
    return vars;
}
		
		

//function gup copied from http://www.netlobo.com/url_query_string_javascript.html
function gup(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null) return "";
    else return results[1];
}

function jq(myid) {
   return myid.replace(/(:|\.)/g,'\\$1');
}

//this method generate the date time data for the statistic service
function getDateTimeValue(year, month, day, hour, minute, second, encode) {
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    if (hour < 10) {
        hour = "0" + hour;
    }
    if (minute < 10) {
        minute = "0" + minute;
    }
    if (second < 10) {
        second = "0" + second;
    }

    var dateTime = year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second;
    if (encode) {
        return escape(dateTime);
    } else {
        return dateTime;
    }
}

function getDateTimeValueFromValue(dateTimeOld,encode) {
	var datePart = dateTimeOld.split('T')[0];

    var dateTime =datePart + "T00:00:00";
    if (encode) {
        return escape(dateTime);
    } else {
        return dateTime;
    }
}

function getManipulatedDate(oldDate, numberOfDays, operation) {
    // operation should be a boolean.
    // true is add days
    // false is remove days
    if (operation) {
        oldDate.setDate(oldDate.getDate() + numberOfDays);
    } else {
        oldDate.setDate(oldDate.getDate() - numberOfDays);
    }
    return oldDate;

}

//Helper method to get an object with a date from a specific number of days
function getCurrentDateMinusDays(days) {

    var result = new Object();
    var currentTime = getManipulatedDate(new Date(), days, false);
    var month = currentTime.getMonth() + 1;
    var day = currentTime.getDate();
    var year = currentTime.getFullYear();
    var hour = currentTime.getHours();
    
    result.month = month;
    result.day = day;
    result.year = year;
    result.hour = hour;
    return result;
}

function getCurrentDateTimeMinusDays(days,hour) {
	var result = new Object();
    var currentTime = getManipulatedDate(new Date(), days, false);
    currentTime.setHours(currentTime.getHours()+hour);
    var month = currentTime.getMonth() + 1;
    var day = currentTime.getDate();
    var year = currentTime.getFullYear();
    var hour = currentTime.getHours();
    
    result.month = month;
    result.day = day;
    result.year = year;
    result.hour = hour;
    return result;
}

//Helper method that generates the X-Chart description for a month call
function getGraphDescriptionOfLastMonth() {
    var resultDates = [],
		i;

    for (i = 30; i > 0; i = i - 1) {
        if (i % 5 === 0) {
            var date = getCurrentDateMinusDays(i);
            resultDates.push(date.day + "." + date.month + ".");
        } else {
            resultDates.push("");
        }
    }
    return resultDates;

}

//Helper method that generates the X-Chart description for a week call
function getGraphDescriptionOfLastWeek() {

    var resultDates = [];

    for (var i = 7; i > 0; i = i - 1) {
        var date = getCurrentDateMinusDays(i);
        resultDates.push(date.day + "." + date.month + ".");
    }
    return resultDates;

}

//Helper method that generates the X-Chart description for a day call
function getGraphDescriptionOfLastDay() {

    var resultDates = [];

    for (var i = 0; i < 25; i++) {
        if (i % 4 !== 0) {
           resultDates.push("");
        } else {
			 if (i < 9) {
                resultDates.push("0" + i + ":00");
            } else {
                resultDates.push(i + ":00");
            }
        }
    }
    return resultDates;

}

//Helper method that generates the X-Chart description for a day call
function getGraphDescriptionOf24h(startDate) {
	var tempDate = startDate instanceof  Date ? new Date(startDate.getTime()): new Date(Date.now() - 24 * 3600 * 1000),
		legend = [tempDate.getHours() + ':00'],
		i = 1;
	for (; i < 25; i++) {
		tempDate.setHours(tempDate.getHours()+1);
		legend[i]= !(i%4) ? (tempDate.getHours() < 10 ? '0': '') + tempDate.getHours() + ':00' : '';
	}
	return legend;
}

function setLoadingDiv(element) {
    var width  = $(element).outerWidth();
    var height = $(element).outerHeight();
	
	if($(element).is(":visible")) {
		
		$(element).each(function() {
			
		 	var loaddiv = $(this).prev();
		 	
		 	var style = 'position: absolute; z-index: 10; width: ' + width + 'px; height: ' + height + "px;";
		 	
		 	if (! loaddiv || ! loaddiv.hasClass("loading")) {
		
		 		$(this).before('<div class="loading" style="' + style + '"><div class="loader_wrapper w_30"><img src="/img/wait30trans.gif"></div></div>');
		 		loaddiv = $(this).prev();
		 	}
		 	
		 	loaddiv.attr('style', style);
		 	
	 		copyCss(this, loaddiv, [ 
      	             	"margin", "margin-top", "margin-left", "margin-bottom", "margin-right",
      	             	"border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius",
      					"border-bottom-left-radius"]);
		 });
	}
}


function setLockedDiv(element) {
    var width  = $(element).outerWidth();
    var height = $(element).outerHeight();
	
	if($(element).is(":visible")) {
		$(element).each(function() {
		 	var disableddiv = $(this).prev();
		 	var style = 'position: absolute; z-index: 10; width: ' + width + 'px; height: ' + height + "px;";
		 	
		 	if (! disableddiv || ! disableddiv.hasClass("locked")) {
		
		 		$(this).before('<div class="locked" style="' + style + '"></div>');
		 		disableddiv = $(this).prev();
		 	}
		 	
		 	disableddiv.attr('style', style);
		 	
	 		copyCss(this, disableddiv, [ 
      	             	"margin", "margin-top", "margin-left", "margin-bottom", "margin-right",
      	             	"border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius",
      					"border-bottom-left-radius"]);
		 });
	}
}


function copyCss(from, to, props) {
	for (var i in props) {
		var prop = props[i];
		var value = $(from).css(prop);
		if (value) {
			$(to).css(prop, value);
		}
	}
}


function unsetLockedDiv(element) {
	$(element).parent().find('> .locked').hide();
}


function unsetLoadingDiv(element) {
	$(element).parent().find('> .loading').hide();
}

function validateEmail(email) {
 
   var reg = /^([A-Za-z0-9_\-\+\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
   var address = email;
   if(reg.test(address) == false) {
      return false;
   }
   else
   {
		return true;
   }
}

/**
 *
 *  Base64 encode / decode
 *  http://www.webtoolkit.info/
 *
 **/
var Base64 = {

	// private property
	_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding
	encode: function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = Base64._utf8_encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

		}

		return output;
	},

	// public method for decoding
	decode: function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

		}

		output = Base64._utf8_decode(output);

		return output;

	},

	// private method for UTF-8 encoding
	_utf8_encode: function (string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode: function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while (i < utftext.length) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if ((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	}

};

function make_base_auth(user, password) {
    var tok = user + ':' + password;
    var hash = Base64.encode(tok);
    return "Basic " + hash;
}


/**
 * helper function to show a overlay with help content
 */
function initHelpBtn(){
	var $helpView = $('#helpView');
	$helpView
		.find('.close')
		.on('click', function(){
			$helpView.hide();
		});
	$('.helpBtn')
		.off('click')
		.on('click', function(e){
			e.stopPropagation();//prevent the immediate execution of hideOnce
			var $view = $('#helpView');
			$view.find('.content').attr('data-translate', $(this).data('helptxt'));
			
			i18n($view.find('.content'));
			
			$view
				.css({
					'left':  e.pageX + 20,
					'top':   e.pageY - 20
				})
				.show();
			function hideOnce(){
				$view.hide();
				$('body').off('click', hideOnce);
			}
			$('body').on('click', hideOnce);
		});
}

/**
 * helper function to show a small tooltip
  */
var initQuickHelp = (function() {
	var $hoverView = $('#hoverView');
	return function(dataStore, filter) {
		var $elements = $(filter);
		$elements.hover(function(e){
			console.log(e.pageX + ' ' + e.pageY);
			var dataStore = typeof(dataStore) === 'string' ? dataStore : 'tooltip';
			$hoverView.html($(this).data(dataStore));
//				.fadeIn(250);
			$hoverView
				.css({
//					'z-index': 2000,
					left:  e.pageX + 20,
					top:   e.pageY - 20
				})
				.show();
//			$(document).bind('mousemove', function(e){
//				$hoverView.css({
//					left:  e.pageX,
//				    top:   e.pageY
//				 });
//			});
		},
		function(e){
			$hoverView
				.html('')
				.hide();
//		$(document).unbind('mousemove');
	});

	};
})();

window.gui = {};

$(document).ready(function(){
	var $infoBox = $('<div id="infoBox" class="modalDialog" style="display:none;">' +
		'<div class="dialog">' +
			'<h2 class="heading"></h2>' +
			'<p class="msg"></p>' +
			'<div class="controls">' +
				'<a class="button inline confirm">OK</a>' +
			'</div>' +
			'<div style="clear: both;"></div>' +
		'</div>' +
	'</div>').appendTo($('body'));
	window.gui.showInfoBox = function showInfoBox(args){
		console.log(args);
		var dfrd = $.Deferred().always(function(){$infoBox.hide();}),
			classes = args.classes ? args.classes : {},
			name,
			$accept;
		$accept = $infoBox.find('.confirm')
			.attr('data-translate', args.acceptStr ? args.acceptStr : 'OK')
			.off('click')
			.on('click', function(){dfrd.resolve();})
			.addClass(typeof classes.accept === 'string' ? classes.accept : '');
		$infoBox.find('.msg').attr('data-translate', args.message ? args.message : 'provide_message');
		$infoBox.find('.heading').attr('data-translate', args.heading ? args.heading : 'provide_heading');
		
		i18n($infoBox.find('.msg'));
		i18n($infoBox.find('.heading'));
		
		//after we got the localized strings, we replace the place holders
		if(args.placeHolders){
			for(name in args.placeHolders){
				if(typeof args.placeHolders[name] === "string"){
					$infoBox.find('#'+name).html(args.placeHolders[name]);
				}
			}
		}
		$infoBox.show();
		//remove the customized classes for the buttons on click
		dfrd.always(function(){
			$accept.removeClass(typeof classes.accept === 'string' ? classes.accept : '');
			$infoBox.hide();

		});
		return dfrd.promise();
	};
});
