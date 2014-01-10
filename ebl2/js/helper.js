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

    var resultDates = new Array();

    for (var i = 30; i > 0; i = i - 1) {
        if (i % 5 == 0) {
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

    var resultDates = new Array();

    for (var i = 7; i > 0; i = i - 1) {
        var date = getCurrentDateMinusDays(i);
        resultDates.push(date.day + "." + date.month + ".");
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
		legend[i]= !(i % 4) ? (tempDate.getHours() < 10 ? '0': '') + tempDate.getHours() + ':00' : '';
	}
	return legend;
}

function getGraphDescriptionOf24hours(hours) {
	var legend = [hours + ':00'],
		i = 1,
		hour;
	
	for (; i < 25; i++) {
		hour = (hours+i-1)%24;
		legend[i]= !(i % 4) ? (hour < 10 ? '0': '') + hour + ':00' : '';
	}
	return legend;
}

//Helper method that generates the X-Chart description for a day call
function getGraphDescriptionOfLastDay() {

    var resultDates = new Array();

    for (var i = 0; i < 25; i++) {
        if (i % 4 != 0) {
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

function setLoadingDiv(element) {
    var width = $(element).width();
    var height = $(element).height();
	
	if($(element).is(":visible"))
	{
		$(element).after('<div class="loading" style="position: relative; width: ' + width + 'px; height: ' + height + 'px;"><div class="loader_wrapper w_30"><img src="/img/wait30trans.gif"></div></div>');
		$(element).hide();
	}
}
function setLoadingDivEbl2(element) {
 
	
	if($(element).is(":visible"))
	{
		$(element).after('<div class="loading" ><div class="loader_wrapper w_30"><img src="/img/wait30trans.gif"></div></div>');
		$(element).hide();
	}
}

function unsetLoadingDiv(element) {
	
	if(!$(element).is(":visible"))
	{
		$(element).parent().find('.loading').remove();
		$(element).show();
	}
}

function setMessagePopUp(type, message) {
	$('.message').removeClass("problem");
	$('.message').removeClass("positive");
  $('.message').addClass(type);
	$('#message_text').attr("data-translate", message);
	localizer();
  
  if ( (type == 'positive') || (type == 'neutral') ){
    $('.message').removeAttr('style').delay(2500).fadeOut('slow');
  }else{
    $('.message').removeAttr('style');
  }
  
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

}
function make_base_auth(user, password) {
    var tok = user + ':' + password;
    var hash = Base64.encode(tok);
    return "Basic " + hash;
}