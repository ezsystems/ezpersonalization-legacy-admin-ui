


var in_to_language = $.cookie('language') || navigator.language || navigator.userLanguage || "en";

var _i18n_ready = false;


$(document).ready(function () {
	
	var files = [];
	
	$('script[data-i18n-files]').each(function() {
		var v = $(this).attr('data-i18n-files');
		var vv = v.split(",");
		for (i in vv) {
			var trimmed = $.trim(vv[i]);
			if (trimmed.length > 0) {
				files.push(trimmed);
			}
		}
	});
	
	if (files.length > 0) {
		init_i18n(files);
	}
});


/** Initialize the i18n library.
 *  Translate the whole page and initializes the language switch. 
 * 
 *  @param filename
 * 		filename without extension
 */
function init_i18n(filenames) {
	
	$(document).ready(function () {
		
		$('.language_selection').children('li').click(function(){
			$('.language_selection').children('li').removeClass('current');
			
			in_to_language = $(this).attr('lang');
			$.cookie('language', in_to_language);
			
			$(this).addClass('current');
			
			apply_i18n(filenames);
			
			if(typeof setEquals === 'function'){
				setEquals();
			}
		});
		
		_i18n_ready = true;
	});
	
	apply_i18n(filenames);
}


function getLocalString(term){
	
	var i18n_params = Array.prototype.slice.call(arguments, 1);
	
	return jQuery.i18n.prop.apply(null, [term].concat(i18n_params));
}


function setMessagePopUpLink(type, link, i18n_id) {
	
	var i18n_params = Array.prototype.slice.call(arguments, 3);
	
	setMessagePopUp.apply(null, [type, i18n_id].concat(i18n_params));
	
	if (link) {
    	$('.message a.close').attr('href', link);
    }
}


function setMessagePopUp(type, i18n_id) {
	$('.message').removeClass("problem");
	$('.message').removeClass("positive");
    $('.message').addClass(type);
    
    var i18n_params = Array.prototype.slice.call(arguments, 2);
    
    for (var i in i18n_params) {
    	i18n_params[i] = "<span data-param='" + i + "'>" + i18n_params[i] + "</span>";
    }
    
    $('#message_text').attr("data-translate", i18n_id);
	$('#message_text').html(i18n_params.join(""));
	
	i18n($('#message_text'));
  
    if ( (type == 'positive') || (type == 'neutral') ){
    	$('.message').removeAttr('style').delay(2500).fadeOut('slow');
    } else {
    	$('.message').removeAttr('style');
    }

	$('.message a.close').removeAttr('href');
}


/** Translates all the elements on the page.
 * 
 *  @param element
 *  	element to translate. It must have an attribute 'data-translate'.
 */
function apply_i18n(filenames) {
	
	jQuery.i18n.properties({
	    name: filenames, 
	    path: 'translations/', 
	    mode: 'map',
	    encoding: 'ISO-8859-1',
	    cache: true,
	    language: in_to_language, 
	    callback: function() {
	        var containers = $("[data-translate]");
	        
	        containers.each(function() {
	        	i18n(this);
	        });
	    }
	});
}


/** Same as "i18n" without arguments.
 *  For backward compatibility. 
 */
function localizer() {
	i18n();
}



/** Translates the specified element.
 * 
 *  @param element
 *  	element to translate. It must have an attribute 'data-translate'.
 */
function i18n() {
	
	if (! _i18n_ready) {
		return "[]";
	}
	
	if (arguments.length == 0) {
		$("[data-translate]").each(function() {
			i18n($(this));	
		});
		return;
	} else if (arguments.length > 1) {
		for (var i = 0; i < arguments.length; i++) {
			i18n(arguments[i]);
		}
		return;
	}
	
	var element = arguments[0];
	
	if (element instanceof Array) {
		for (var i in element) {
			i18n(element[i]);
		}
	}
	
	var term = $(element).attr("data-translate");
	
	var params = i18n_params(element); 
	var asHtml = to_outer_html(params);
	
	var translation;
	
	if (typeof(jQuery.i18n.map[term]) != "undefined") {
		translation = jQuery.i18n.prop.apply(null, [term].concat(asHtml));
	} else {
		console.warn("Translation not found [" + term + "]");
		translation = '[' + term + ']';
	}
	$(element).html(translation);
	
	// append missed i18n parameters and hide them (may be we will need them for another language)
	
	var missed = [];
	
	for (var key in asHtml) {
		var found = $(element).children("[data-param=" + key + "]");
		
		if (found.length == 0) {
			missed[key] = asHtml[key];
		}
	};
	
	if (missed.length) {
		var translation = [translation].concat(missed).join("");
		$(element).html(translation);
		
		for (var key in missed) {
			$(element).children("[data-param=" + key + "]").each(function(){
			    $(this).hide();
			});
		}
	}
}


function to_outer_html(elements) {
	result = [];
	
	$(elements).each(function(){
	    var outerHtml = $(this).clone().wrap('<p>').parent().html();
	    result.push(outerHtml);	
	});

	return result;
}


/** Returns all the children of the specified "data" element
 *  with the numeric attibute "data-param".
 * 
 *  @returns
 * 		elements as array, or an empty array, if no elements found.
 */
function i18n_params(data) {
	
	var result = [];
	
	$(data).children("[data-param]").each(function() {
		var key = $(this).attr("data-param");
		var intKey = parseInt(key, 10);
		if ( ! isNaN(intKey)) {
			$(this).show();
			result[intKey] = $(this);
		}
	});
	
	return result;
}

