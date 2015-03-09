var customerID = gup('customer_id');
var currentbg = "#cccccc";
var menuCurrentbg = "#003300";
var ctaCurrentbg = "#123456";
var topicCurrentbg = "#cccccc";
var footerCurrentbg = "#111111";

$(document).ready(function () {
	inlineSpectrumBodyBackground();
	
	$('#import_primary_settings').submit(function () {
		savePreferences();
		return false;
    });
	var isrc="/api/v4/" + encodeURIComponent(customerID) + "/nl2go/get_preview";
	$('#previewFrame').attr('src',isrc);   
	
	$("#button_save").click(submitImport);
	$(function() {
	    $( "#accordion" ).accordion();
	});
});

function submitImport() {
	$('<input type="submit">').hide().appendTo($('#import_primary_settings')).click().remove();
}

function inlineSpectrumBodyBackground(){
	spectrumBackground('mailBackground',currentbg);
	spectrumBackground('menuBackground',menuCurrentbg);
	
	
}

function spectrumBackground(elementId, colorVariable){
	$("#"+elementId).spectrum({
	    showInput: true,
	    showAlpha: true,
	    color: colorVariable,
	    move: function(color) {
	        var bgcolorPrev = color.toHexString(); 
	        $('.recUnit').css("background-color",bgcolorPrev);
	    },
	    change: function(color) {
	    	var bgcolorPrev = color.toHexString(); 
	    	colorVariable = bgcolorPrev;
	    },
	    hide: function(color) {
	    	$('.recUnit').css("background-color",colorVariable);
	    }
		
	});
}

function addMenuElement(menuLinksArray){
	for (var i=1; i < 5; i++) {
		var name = $("#menu_elment_name"+i).val();
		var url  = $("#menu_elment_url"+i).val();
		if(name != null && name != ''){
			var menuLink = new Object();
			menuLink.caption = name;
			menuLink.url = url;
			menuLinksArray.push(menuLink);
		}
	}
}

function savePreferences() {
	setLoadingDiv($('body'));
	 retObj = new Object();
	 retObj.mandatorName = customerID;
	 retObj.logo = $("#logo").val();
	 retObj.holineName = $("#menu_elment_hotline_name").val();
	 retObj.holineNumber = $("#menu_elment_hotline_number").val();
	 
	 retObj.background = currentbg;
	 retObj.menuBackground = menuCurrentbg;
	 retObj.menuLinks = new Array();
	 addMenuElement(retObj.menuLinks);
	 
	 retObj.facebook = $("#facebook").val();
	 retObj.googleplus = $("#googleplus").val();
	 retObj.twitter = $("#twitter").val();
	 $.ajax({
		  type: "POST",
		  mimeType: "application/json",
		  contentType: "application/json;charset=UTF-8",
		  dataType: "html",
		  data: JSON.stringify(retObj),
		  url: "/api/v4/" + encodeURIComponent(customerID) + "/nl2go/get_preview_with_params",
		  success: function(json) {
			  unsetLoadingDiv($('body'));
			  $('#previewFrame').contents().find('html').html(json);
		  },
		  error: function() {
			  unsetLoadingDiv($('body'));
			  stdAjaxErrorHandler();
		  }
	  });	
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




function savePreferences2() {
	alert('hehe');
	setLoadingDiv($('body'));
	 retObj = new Object();
	 retObj.mandatorName = customerID;
	 retObj.logo = $("#logo").val();
	 retObj.background = currentbg;
	 retObj.facebook = $("#facebook").val();
	 retObj.googleplus = $("#googleplus").val();
	 retObj.twitter = $("#twitter").val();
	 $.ajax({
		  type: "POST",
		  mimeType: "application/json",
		  contentType: "application/json;charset=UTF-8",
		  dataType: "json",
		  data: JSON.stringify(retObj),
		  url: "/api/v4/" + encodeURIComponent(customerID) + "/nl2go/pref/savePreferences",
		  success: function(json) {
			  unsetLoadingDiv($('body'));
			  setMessagePopUp("positive", "message_data_saved_successfully");
		  },
		  error: function() {
			  unsetLoadingDiv($('body'));
			  stdAjaxErrorHandler();
		  }
	  });	
	alert('hehe');
}


