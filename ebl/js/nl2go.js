var customerID = gup('customer_id');
var currentbg = "#cccccc";
var menuCurrentbg = "#003300";
var ctaCurrentbg = "#123456";
var topicCurrentbg = "#cccccc";
var footerCurrentbg = "#111111";

$(document).ready(function () {
	inlineSpectrumBodyBackground();
	
	$('#import_primary_settings').submit(function () {
		savePreferences2();
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
	 $.ajax({
		  type: "GET",
		  mimeType: "application/json",
		  contentType: "application/json;charset=UTF-8",
		  dataType: "json",
		  url: "/api/v4/" + encodeURIComponent(customerID) + "/nl2go/pref/getMailPreferences",
		  success: function(retObj) {
			  unsetLoadingDiv($('body'));
			  $("#logo").val(retObj.logo);
			  $("#menu_elment_hotline_name").val(retObj.holineName);
			  $("#menu_elment_hotline_number").val(retObj.holineNumber);
			  if(retObj.background != null){
				  currentbg = retObj.background;
			  }
			  if(retObj.menuBackground != null){
				  menuCurrentbg = retObj.menuBackground;
			  }
			  if(retObj.menuLinks != null){
				  var kk = 1;
				  for(var menuLink in retObj.menuLinks){
					  $("#menu_elment_name"+kk).val(menuLink.caption);
					  $("#menu_elment_url"+kk).val(menuLink.url);
					  kk++;
				  }
			  }
			  $("#facebook").val(retObj.facebook);
			  $("#googleplus").val(retObj.googleplus);
			  $("#twitter").val(retObj.twitter);
			  spectrumBackground('mailBackground',currentbg);
			  spectrumBackground('menuBackground',menuCurrentbg);
		  },
		  error: function() {
			  unsetLoadingDiv($('body'));
			  spectrumBackground('mailBackground',currentbg);
			  spectrumBackground('menuBackground',menuCurrentbg);
			  stdAjaxErrorHandler();
		  }
	  });	
	
	
	
}

function spectrumBackground(elementId, colorVariable){
	$("#"+elementId).spectrum({
	    showInput: true,
	    showAlpha: true,
	    color: colorVariable,
	    move: function(color) {
	    },
	    change: function(color) {
	    	var bgcolorPrev = color.toHexString(); 
	    	if('mailBackground' === elementId ){
	    		currentbg = bgcolorPrev;
	    	}else if('menuBackground'  === elementId){
	    		menuCurrentbg = bgcolorPrev;
	    	}
	    		
	    },
	    hide: function(color) {
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
		  dataType: "json",
		  data: JSON.stringify(retObj),
		  url: "/api/v4/" + encodeURIComponent(customerID) + "/nl2go/pref/savePreferences",
		  success: function(json) {
			  unsetLoadingDiv($('body'));
			  var isrc="/api/v4/" + encodeURIComponent(customerID) + "/nl2go/get_preview";
			  $('#previewFrame').attr('src',isrc);   
			  setMessagePopUp("positive", "message_data_saved_successfully");
		  },
		  error: function() {
			  unsetLoadingDiv($('body'));
			  stdAjaxErrorHandler();
		  }
	  });	
	alert('hehe');
}


