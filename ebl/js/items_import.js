var customerID = gup('customer_id');
var importJobId = gup('importJobId');

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
	$('#import_secondary_settings').submit(function () {
		saveImport2();
		return false;
    });

	var result = $.when(
		loadMandatorInfo(function(json) {
			mandatorInfo = json;
		}),
		getImport()
	).done(function(json) {
		loadTypes();
		if (callback) {
			callback();
		}
	});
	return result;
}

function loadTypes(){
	var defaultItemType = mandatorInfo.itemTypeConfiguration.defaultType;
	if(itemTypeFromJob){
		defaultItemType = itemTypeFromJob;
	}
	$("#input_type_block select").html(""); // removing all options
	for (var i in mandatorInfo.itemTypeConfiguration.types) {
		var t = mandatorInfo.itemTypeConfiguration.types[i];
		var d = t.description + ' (' + t.id + ')';
		var selectedTxt = '';
		if(t.id == defaultItemType ){
			selectedTxt = ' id="defaultInItemType" selected = "selected" ';
			console.log("defaultItemType="+defaultItemType+".");
		}
		$('<option value="' + t.id + '"'+selectedTxt+'></option>').appendTo($("#input_type_block select")).text(d);	
	}
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
	$("#button_save2").click(submitImport2);
	
};

function submitImport() {
	$('<input type="submit">').hide().appendTo($('#import_primary_settings')).click().remove();
}

function submitImport2() {
	$('<input type="submit">').hide().appendTo($('#import_secondary_settings')).click().remove();
}//#import_secondary_settings

var retObj;
var csvFields;

function getCSVFields(){
	setLoadingDiv($('body'));
	if(retObj){
		var urlsufix = '/import/get_csv_fields';
		 $.ajax({
			  type: "POST",
			  mimeType: "application/json",
			  contentType: "application/json;charset=UTF-8",
			  dataType: "json",
			  data: JSON.stringify(retObj),
			  url: "/api/v4/" + encodeURIComponent(customerID) + urlsufix,
			  success: function(json) {
				  var htmlToSet ='';
				  var fields = json.fields;
				  csvFields = fields;
				  for(var i=0;i<fields.length;i++){
					  var field = fields[i];
					 
					  htmlToSet += '<li class="types_base select_field clearfix">\n'+
						'<div class="basis" >\n'+
							'<label for="field'+i+'" id="name_field'+i+'" class="input_label" style="text-align: left;">'+field+'</label>\n'+
			            '</div>\n'+
						'<div class="value">\n'+
							'<select id="field'+i+'" name="field'+i+'" onchange="changeType(\''+i+'\');">\n'+
								'<option value="notfu"  selected="selected" >CUSTOM</option>\n'+
							    '<option value="id"  >ID</option>\n'+
							    '<option value="title"   >Title</option>\n'+
							    '<option value="imgurl"   >Image URL</option>\n'+
							    '<option value="description"   >Description</option>\n'+
							    '<option value="price"   >Price</option>\n'+
							    '<option value="currency"   >Currency</option>\n'+
							    '<option value="validfrom"  >Valid from</option>\n'+
							    '<option value="validto"  >Valid to</option>\n'+
							    '<option value="categorypath"  >Categorypath</option>\n'+
							    '<option value="author"  >Author</option>\n'+
							    '<option value="agency"  >Agency</option>\n'+
							    '<option value="vendor"  >Vendor</option>\n'+
							    '<option value="geolocation"  >Geolocation</option>\n'+
							    '<option value="abstract"  >Abstract</option>\n'+
							    '<option value="tags"  >Tags</option>\n'+
							    '<option value="vendor"  >Vendor</option>\n'+
							'</select>\n'+
							'<select id="type_field'+i+'" name="type_field'+i+'"  onchange="addPrefix('+i+');">\n'+
								'<option value="NUMERIC"   >NUMERIC</option>\n'+
								'<option value="TEXT"  selected="selected" >TEXT</option>\n'+
								'<option value="DATE_ISO"   >DATE ISO</option>\n'+
								'<option value="DATETIME_ISO"  >DATETIME ISO</option>\n'+
								'<option value="URI" >URI</option>\n'+
								'<option value="CURRENCY">CURRENCY</option>\n'+
							'</select>\n'+
							'<input type="url" id="prefixURL'+i+'" name="prefixURL'+i+'" placeholder="Prefix URL" value="" style="display: none;" />'+
						'</div>\n'+
			          '</li>\n';
				  }
				  $("#import_secondary_settings_ul").html(htmlToSet);
				  $("#import_primary_settings").hide();
				  $("#import_secondary_settings").show();
				  $("#button_save").hide();
				  $("#button_save2").show();
				  if(retObj.mappings){
					  for(var i = 0; i <  retObj.mappings.length ;i++){
						  var val = retObj.mappings[i].value;
						  for(var j = 0;j<fields.length;j++){
							  var field = fields[j];
							  if(val && val == field){
								  console.log("key: "+retObj.mappings[i].key+" for value: "+val);
								  $("#field"+j).val(retObj.mappings[i].key);
								  $("#type_field"+j).val(retObj.mappings[i].valueFormat);
								  if(retObj.mappings[i].valueFormat == 'URI'){
									  if(retObj.mappings[i].valuePrefix){
										  $("#prefixURL"+j).val(retObj.mappings[i].valuePrefix);
									  }
									  $("#prefixURL"+j).show();
								  }
							  }
						  }
					  }
				  }

			  },
			  error: function() {
				  stdAjaxErrorHandler();
			  }
		  });
		
	}
	unsetLoadingDiv($('body'));
}

function addPrefix(typeId){
	var valType = $("#type_field"+typeId).val();
	if(valType == 'URI'){
		$("#prefixURL"+typeId).show();
	}else{
		$("#prefixURL"+typeId).hide();
	}
}

function changeType(typeId){
	var valType = $("#field"+typeId).val();
	if(valType == 'id' || valType == 'price'){
		$("#type_field"+typeId).val("NUMERIC");
		$("#prefixURL"+typeId).hide();
	}else{
		if(valType == 'imgurl' ){
			$("#type_field"+typeId).val("URI");
			$("#prefixURL"+typeId).show();
		}else{
			if(valType == 'validfrom' || valType == 'validto'){
				$("#type_field"+typeId).val("DATETIME_ISO");
				$("#prefixURL"+typeId).hide();
			}
		}
	}
		
}

function saveImport2() {
	if(retObj && csvFields) {
		setLoadingDiv($('body'));
		 retObj.mappings = new Array();
		 var foundID = 0;
		 var j = 0;
		 for(var i=0;i<csvFields.length;i++){
			 var fid="field"+i;
			 var fidn="name_field"+i;
			 var fidv="type_field"+i;
			 if( $("#"+fid).val() != 'notfu'){
				 retObj.mappings[j] = new Object();
				 retObj.mappings[j].key = $("#"+fid).val(); 
				 retObj.mappings[j].value = $("#"+fidn).html();
				 if(retObj.mappings[j].key == 'id'){
					 retObj.mappings[j].valuePk = true;
					 foundID++;
				 }else{
					 retObj.mappings[j].valuePk = false;
				 }
				 retObj.mappings[j].valueFormat = $("#"+fidv).val();
				 if(retObj.mappings[j].valueFormat == 'URI' && $("#prefixURL"+i).val() != null && $("#prefixURL"+i).val() != '' ){
					 retObj.mappings[j].valuePrefix = $("#prefixURL"+i).val();
				 }
				 j++;
			 }
		 }
		 if(foundID != 1){
			 unsetLoadingDiv($('body'));
			 if(foundID == 0){
				 setMessagePopUp("problem", "item_import_error_must_set_id");
			 }else{
				 setMessagePopUp("problem", "item_import_error_only_one_id");
			 }
			 return;
		 }
		
		 var urlsufix = '/import/save_importjob';
		 $.ajax({
			  type: "POST",
			  mimeType: "application/json",
			  contentType: "application/json;charset=UTF-8",
			  dataType: "json",
			  data: JSON.stringify(retObj),
			  url: "/api/v4/" + encodeURIComponent(customerID) + urlsufix,
			  success: function(json) {
				  unsetLoadingDiv($('body'));
				  retObj = json;
				  setMessagePopUp("positive", "message_data_saved_successfully");
			  },
			  error: function() {
				  unsetLoadingDiv($('body'));
				  stdAjaxErrorHandler();
			  }
		  });
	}
}

function saveImport() {
	 setLoadingDiv($('body'));
	 retObj = new Object();
	 if(retObjOld){
		 retObj = retObjOld;
	 }
	 retObj.itemType = $("#input_type").val();
	 retObj.uri = $("#url").val();
	 var username = $("#username").val();
	 if(username && username.trim().length > 0){
		 retObj.username = username;
	 }
	 var password = $("#password").val();
	 if(password && password.trim().length > 0){
		 retObj.password = password;
	 }
	
	 retObj.delimiter = $("#delimiter").val();
	 retObj.interval = $("#import_schedule").val();
	 retObj.enabled = true;
	 var d = Date.today ();
	 if(retObj.interval == 'WEEKLY'){
		 var fromDay =  $("#dayOfweek").val();
		 d.moveToDayOfWeek(fromDay);
	 }
	 if(retObj.interval == 'WEEKLY' || retObj.interval == 'DAILY'){
		 d.set({ millisecond: 0, second: 0,  minute: 0,hour: $("#hourOfday").val()});
		 retObj.name = retObj.interval;
	 }else{
		 retObj.name = "ONE TIME ";
	 }
	 retObj.name = retObj.name+ " "+ $("#input_type").find(":selected").text()+" IMPORT ";
	 retObj.startDate = d.toString("yyyy-MM-ddTHH:mm:ss") ;
	 if($("#input_language").val() != 'notUsed'){
		 retObj.language = $("#input_language").val();
		 retObj.name = retObj.name+ " IN "+ $("#input_language").find(":selected").text();
	 }
	 
	 getCSVFields();
}

var retObjOld;
var itemIdPk;
var itemTypeFromJob;

function getImport() {
	if(importJobId){
		setLoadingDiv($('body'));
		$.ajax({
			  type: "GET",
			  mimeType: "application/json",
			  contentType: "application/json;charset=UTF-8",
			  dataType: "json",
			  url: "/api/v4/" + encodeURIComponent(customerID) + "/import/get_importjob/"+importJobId,
			  success: function(json) {
				 var obj = json;
				 if(obj){
					 retObjOld = obj;
					 var url = obj.uri;
					 if(url){
						 $("#url").val(url);
					 }
					 var username = obj.username;
					 if(username && username.trim().length > 0){
						 $("#username").val(username);
					 }
					 var password = obj.password;
					 if(password && password.trim().length > 0){
						 $("#password").val(password);
					 }
					 itemTypeFromJob = obj.itemType;
					 var importFr = obj.interval;
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
					 var startDate = new Date(obj.startDate);
					 
					 var importWeek = startDate.getDay();
					 if(importWeek){
						 $("#dayOfweek").val(importWeek);
					 }
					 var importHour = startDate.getHours();
					 if(importHour){
						 $("#hourOfday").val(importHour);
					 }
					 var maps = obj.mappings;
					 var itemId = false;
					 for(var i = 0;i<maps.length; i++){
						 var map = maps[i];
						 if(map.valuePk){
							 itemId = map.value;
							 itemIdPk = map.id;
						 }
						
					 }
					 if(itemId){
						 $("#itemId").val(itemId);
					 }
					 var delimiter = obj.delimiter;
					 if(delimiter){
						 $("#delimiter").val(delimiter);
					 }
					 if(obj.language){
						 $("#input_language").val(obj.language); 
					 }
				 }
				 unsetLoadingDiv($('body'));
				 
			  },
			  error: function() {
				  unsetLoadingDiv($('body'));
			  }
		  });
	}
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