
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
	
	var result = $.when.apply(null, arguments);
    
	if (callback) {
		result.done(callback);
	}
	
	return result;
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
		

/** @deprecated use gupEncoded instead.
 *  
 * @param name
 * @returns
 */
//function gup copied from http://www.netlobo.com/url_query_string_javascript.html
function gup(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null) return "";
    else return results[1];
}


function gupDecoded(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null) {
    	return "";
    } else {
    	var value = results[1].replace(/\+/g, ' ');
    	return decodeURIComponent(value);
    }
}



function jq(myid) {
   return myid.replace(/(:|\.)/g,'\\$1');
}



/**
 * returns an object which represents the duration string
 * @author: maik.seyring
 */
var parseDuration = function(str) {
	var getHours = function() {
		return (((((this.Y * 12) + this.M) * 30) + this.D) * 24) + this.H + (this.m > 30 ? 1 : 0);
	};
	
	var setHours = function(value) {
		
		var a = value % 24;

		this.D = Math.round((value - a) / 24);
		this.H = Math.floor(a);
		this.M = Math.round((a - this.H) * 60);
		
		this.Y = 0;
		this.m = 0;
		this.S = 0;
	};
	
	
	var setDays = function(value) {
		this.setHours(value * 24);
	};

	var getDays = function() {
		return (((this.Y * 12) + this.M) * 30) + this.D + (this.H > 12 ? 1 : 0);
	};

	var getXSDuration = function() {

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
	};

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
			'getXSDuration': getXSDuration,
			'setHours':      setHours,
			'setDays':       setDays
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


function setLoadingDiv(element) {
    var width  = $(element).outerWidth();
    var height = $(element).outerHeight();
	
	if($(element).is(":visible")) {
		
		$(element).each(function() {
			
		 	var loaddiv = $(this).prev();
		 	
		 	var style = 'position: absolute; z-index: 100; width: ' + width + 'px; height: ' + height + "px;";
		 	
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
   var reg = /^([A-Za-z0-9_\-\+\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/;
   var address = email;
   if(reg.test(address) == false) {
      return false;
   } else {
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



/** Makes a $.ajax() call setting JSON content type ba default.
 *  If non 2xx returned, calls method <code>fault_[json.faultCode]</code> or <code>fault_[statusCode]</code>
 *  or <code>fault</code> instead of <code>error</code>. Calls the method <code>error</code> only, 
 *  if the <code>fault*</code> mehtod was not found.
 * 
 *  @param blurSelector
 *  	selector of the DOM emement to blur during the call. It can be <code>null</code>.
 *  @param options
 *  	see <code>$.ajax()</code> for more infromation.
 */
function yooAjax(blurSelector, options) {
	
	if (blurSelector) {
		setLoadingDiv($(blurSelector));
	}
	
    var old_success = options.success;
    var old_error = options.error;
    
    if (options.data) {
    	if (! options.type) {
    		options.type = "POST";
    	}
    	if (! options.contentType) {
    		options.contentType = "application/json";
    	}
    	if (options.contentType == "application/json" && typeof options.data === 'object') {
    		options.data = JSON.stringify(options.data);
        }
    };
    
    if (! options.fault_authenticationFailure) {
	    options.fault_authenticationFailure = function(json) {
	    	
	    	var auth_code = json.faultDetail ? json.faultDetail.faultCode : null;
	    	var i18n_id = "fault_authenticationFailure";
	    	
	    	if (auth_code == "LOGIN_DISABLED" || auth_code == "LOGIN_NOT_FOUND") {
	    		i18n_id = "fault_authenticationFailure_LOGIN_DISABLED";
	    	} else if (auth_code == "TOKEN_EXPIRED") {
	    		i18n_id = "fault_authenticationFailure_TOKEN_EXPIRED";
	    	} else if (auth_code == "NOT_AUTHENTICATED") {
	    		i18n_id = "fault_authenticationFailure_NOT_AUTHENTICATED";
	    	}
	    	
			var magic = magicMessage("negative", i18n_id, auth_code);
			var returnUrl = window.location;
			 
			magic.addLink("/login.html?returnUrl=" + encodeURIComponent(returnUrl), "fault_link_login_page");
		};
    }
    
    if (! options.fault_securityFault) {
	    options.fault_securityFault = function(json) {
	    	if (json.faultDetail.object) {
	    		magicMessage("negative", "fault_securityFault_object", json.faultDetail.code, json.faultDetail.object);
	    	} else {
	    		magicMessage("negative", "fault_securityFault", json.faultDetail.code);	
	    	}
		};
    }
    
    if (! options.fault) { 
    	options.fault = function(json) {
    		magicMessage("negative", "fault_unexpected", json.faultCode, JSON.stringify(json.faultDetail));
    	};
    }
    
    options.error = function(jqXHR, textStatus, errorThrown) {
    	var json = jqXHR.responseJSON;
    	if (json) {
    		var call = this["fault_" + json.faultCode] || this["fault_" + jqXHR.status] || this["fault"];
    		if (call) {
    			return call(json);
    		}
    	}
    	if (old_error) {
    		return old_error(jqXHR, textStatus, errorThrown);
    	} else {
    		magicMessage("negative", "error_server_error", jqXHR.status);
    	}
    };
    
    if (options.async === false) { // sync mode was explicitely set (default is "async")
    	var result = $.ajax(options);
    	if (blurSelector) {
    		unsetLoadingDiv($(blurSelector));
    	}
	    return result;
    } else {
    	if (blurSelector) {
	    	return $.ajax(options).always(function () {
	    		unsetLoadingDiv($(blurSelector));
			});
	    } else {
	    	return $.ajax(options);
	    }
    }
}


/** Shows a magic message.
 *  
 *  It makes the DIV#magic_message visible. If no magic DIV exists,
 *  creates one as a popup.
 * 
 *  @param type
 *  	'info', 'warining' or 'error'
 *  @param i18n_id
 *  @returns
 *  	returns an object for additional features. Can be ignored.
 */
function magicMessage(type, i18n_id) {
	
	if (! $('#magic_message').length) {
		$('body').append('<div id="magic_message" class="message"><p><a class="destroy_message">X</a></p></div>')
		$('#magic_message p').append("<span id='magic_message_text'></span>");
		
		$('#magic_message .destroy_message').click(function() {
			$('#magic_message').css("visibility", "hidden");
		});
		
		var closeMagicMessage = function(e) { 
		    if (e.which == 1 || e.which == 27) {
		    	if ($('#magic_message').is(":visible")) {
		    		$('#magic_message').css("visibility", "hidden");
		    	} 
		    }
		};
	    
	    $(document).bind('keydown', closeMagicMessage);
	}

	
	$('#magic_message').removeClass("problem");
	$('#magic_message').removeClass("positive");
    $('#magic_message').addClass(type);
    $('#magic_message').css("visibility", "visible");
    
    $('#magic_message > a').remove();
    $('#magic_message > br').remove();
    
    var i18n_params = Array.prototype.slice.call(arguments, 2);
    
    for (var i in i18n_params) {
    	i18n_params[i] = "<span data-param='" + i + "'>" + i18n_params[i] + "</span>";
    }
    
    $('#magic_message_text').attr("data-translate", i18n_id);
	$('#magic_message_text').html(i18n_params.join(""));
	
	i18n($('#magic_message_text'));
	
	return {
		addLink: function(href, i18n_id) {
			var i18n_params = Array.prototype.slice.call(arguments, 2);		

		    for (var i in i18n_params) {
		    	i18n_params[i] = "<span data-param='" + i + "'>" + i18n_params[i] + "</span>";
		    }
			
			$('#magic_message_text').parent().
				append("<br><a href='"+href+"' data-translate='" + encodeURIComponent(i18n_id) + "'>" + i18n_params.join("") + "</a>");
			
			i18n($('#magic_message_text').parent());
		}
	}
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
