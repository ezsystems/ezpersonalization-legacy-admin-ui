var customerID = gup('customer_id');
var mandatorInfo;

$(document).ready(function() {
	 
	  setLoadingDiv($('body'));
	  	  
	  $.when(
		  initialize_first(null, "preview_send")
		  
     ).done(function() {
    	 
  	  unsetLoadingDiv($('body'));
		  initialize();
	  });
});

function initialize_first(callback, i18n_save_button) {
	$('#import_schedule').change(function(){
		var cval = $( this ).val();
		if(cval  == '2'){
			$('#dayOfweek').show();
			$('#hourOfday').show();
		}else if( cval == '1'){
			$('#dayOfweek').hide();
			$('#hourOfday').show();
		}else if( cval == '0'){
			$('#dayOfweek').hide();
			$('#hourOfday').hide();
		}
		
	});
 

	var result = $.when(
		loadMandatorInfo(function(json) {
			mandatorInfo = json;
		})
	).done(function(json) {
		if (callback) {
			callback();
		}
	});
	return result;
}

function loadMandatorInfo(callback) {
	
	var result = $.ajax({
		dataType: "json",
		url: "/api/v4/base/get_mandator/" + encodeURIComponent(customerID) + "?advancedOptions&itemTypeConfiguration&no-realm",
		success: callback,
		error : function(jqXHR, textStatus, errorThrown) {
			configuratorErrorHandler(jqXHR, textStatus, errorThrown);
        }
	});
	return result;
}


function configuratorErrorHandler(jqXHR, textStatus, errorThrown) {
	
	unsetLoadingDiv($('body'));
	
	if(jqXHR.status != null && jqXHR.status == 403) {
		setMessagePopUp("problem", "error_server_error_403");
		
	} else if(jqXHR.status != null && jqXHR.status == 401) {

		window.parent.location = "/login.html";
		
	} else if(jqXHR.status != null && jqXHR.status == 400) {
		setMessagePopUp("problem", "error_server_error_400");
		
	} else if(jqXHR.status != null && jqXHR.status == 404) {
		setMessagePopUp("problem", "error_server_error_404");
		
	} else if(jqXHR.status != null && jqXHR.status == 409) {
		setMessagePopUp("problem", "error_server_error_409");
		
	} else {
		setMessagePopUp("problem", "error_server_error");
	}
}

var initialize = function() {
	$("#button_save").click(saveImport);
	
};

function saveImport() {
	 setLoadingDiv($('body'));
	 var retObj = new Object();
	 retObj.url = $("#url").val();
	 retObj.importFr = $("#import_schedule").val();
	 retObj.importWeek = $("#dayOfweek").val();
	 retObj.importHour = $("#hourOfday").val();
	 retObj.itemId = $("#itemId").val();
	 retObj.delimiter = $("#delimiter").val();
	 $.ajax({
		  type: "POST",
		  mimeType: "application/json",
		  contentType: "application/json;charset=UTF-8",
		  dataType: "json",
		  data: JSON.stringify(retObj),
		  url: "/api/v3/" + encodeURIComponent(customerID) + "/structure/update_import/",
		  success: function(json) {
			  window.location = "configuratorpop.html?reference_code=" + encodeURIComponent(reference_code) + "&customer_id=" + encodeURIComponent(customerID) + "&saved=true";
		  },
		  error: function() {
			  unsetLoadingDiv($('body'));
			  stdAjaxErrorHandler();
		  }
	  });
}