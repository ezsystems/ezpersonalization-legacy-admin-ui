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
		if(cval  == 'WEEKLY'){
			$('#dayOfweek').show();
			$('#hourOfday').show();
		}else if( cval == 'DAILY'){
			$('#dayOfweek').hide();
			$('#hourOfday').show();
		}else if( cval == 'ONCE'){
			$('#dayOfweek').hide();
			$('#hourOfday').hide();
		}
		
	});
	$('#import_primary_settings').submit(function () {
		saveImport();
		return false;
    });

	var result = $.when(
		loadMandatorInfo(function(json) {
			mandatorInfo = json;
		}),
		getImport()
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
	$("#button_save").click(submitImport);
	
};

function submitImport() {
	$('<input type="submit">').hide().appendTo($('#import_primary_settings')).click().remove();
}

function saveImport() {
	 setLoadingDiv($('body'));
	 var retObj = new Object();
	 retObj.uri = $("#url").val();
	 retObj.name = encodeURIComponent(customerID)+'_1';
	 retObj.delimiter = $("#delimiter").val();
	 retObj.interval = $("#import_schedule").val();
	 var d = new Date();
	 if(retObj.interval = 'WEEKLY'){
		 var currentDay = d.getDay();
		 var fromDay =  $("#dayOfweek").val();
		 var diff = fromDay-currentDay;
		 if(fromDay < currentDay){
			 diff = 7+diff; 
		 }
		 d.setDate(d.getDate()+diff);
	 }
	 if(retObj.interval == 'WEEKLY' || retObj.interval == 'DAILY'){
		 d.setHours($("#hourOfday").val(), 0, 0, 0);
	 }
	 retObj.startDate = d;
	 retObj.mappings = new Array();
	 retObj.mappings[0] = new Object();
	 retObj.mappings[0].key = "itemid";
	 retObj.mappings[0].value = $("#itemId").val();
	 retObj.mappings[0].valuePk = true;
	 retObj.mappings[0].format = "DECIMAL";
	
	 $.ajax({
		  type: "POST",
		  mimeType: "application/json",
		  contentType: "application/json;charset=UTF-8",
		  dataType: "json",
		  data: JSON.stringify(retObj),
		  url: "/api/v4/" + encodeURIComponent(customerID) + "/save_importjob",
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

function getImport() {
	 setLoadingDiv($('body'));
	$.ajax({
		  type: "GET",
		  mimeType: "application/json",
		  contentType: "application/json;charset=UTF-8",
		  dataType: "json",
		  url: "/api/v4/" + encodeURIComponent(customerID) + "/get_importjobs/",
		  success: function(json) {
			 var obj = json.importData;
			 if(obj){
				 var url = obj.url;
				 if(url){
					 $("#url").val(url);
				 }
				 var importFr = obj.importFr;
				 if(importFr){
					 $("#import_schedule").val(importFr);
				 }
				 if(importFr  == 'WEEKLY'){
						$('#dayOfweek').show();
						$('#hourOfday').show();
				 }else if( importFr == 'DAILY'){
						$('#dayOfweek').hide();
						$('#hourOfday').show();
				 }
				 var importWeek = obj.importWeek;
				 if(importWeek){
					 $("#dayOfweek").val(importWeek);
				 }
				 var importHour = obj.importHour;
				 if(importHour){
					 $("#hourOfday").val(importHour);
				 }
				 var itemId = obj.itemId;
				 if(itemId){
					 $("#itemId").val(itemId);
				 }
				 var delimiter = obj.delimiter;
				 if(delimiter){
					 $("#delimiter").val(delimiter);
				 }
			 }
			 unsetLoadingDiv($('body'));
			 
		  },
		  error: function() {
			  unsetLoadingDiv($('body'));
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