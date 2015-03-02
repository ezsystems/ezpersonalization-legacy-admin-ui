var customerID = gup('customer_id');
var currentbg = "#cccccc";
$(document).ready(function () {
	inlineSpectrumBodyBackground();
	$('#import_primary_settings').submit(function () {
		savePreferences();
		return false;
    });
});

function inlineSpectrumBodyBackground(){
	$("#Inline").spectrum({
	    showInput: true,
	    showAlpha: true,
	    color: currentbg,
	    move: function(color) {
	        var bgcolorPrev = color.toRgbString(); 
	        $('.recUnit').css("background-color",bgcolorPrev);
	    },
	    change: function(color) {
	    	var bgcolorPrev = color.toRgbString(); 
	    	currentbg = bgcolorPrev;
	    },
	    hide: function(color) {
	    	$('.recUnit').css("background-color",currentbg);
	    }
		
	});
}

function savePreferences() {
	 setLoadingDiv($('body'));
	 retObj = new Object();
	 if(retObjOld){
		 retObj = retObjOld;
	 }
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
}


