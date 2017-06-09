var customerID = gup('customer_id');
var nlid = gup('nlid');
var currentbg = "#cccccc";
var menuCurrentbg = "#003300";
var ctaCurrentbg = "#123456";
var footerCurrentbg = "#111111";

$(document).ready(function () {
	if(!nlid){
		nlid = 0;
	}
	htmlDays = '';
	for (dm = 1; dm < 31; dm++) {
		htmlDays += '<option value="'+dm+'">'+dm+'</option>';
	}
	 $("#dayOfmonth").append(htmlDays);
	$('#mail_schedule').change(function(){
		var cval = $( this ).val();
		if(cval  == 'MONTHLY'){
			$('#dayOfmonthli').show();
			$('#dayOfweekli').hide();
			$('#hourOfdayli').show();

		}else if(cval  == 'WEEKLY'){
			$('#dayOfmonthli').hide();
			$('#dayOfweekli').show();
			$('#hourOfdayli').show();
		}else if( cval == 'DAILY'){
			$('#dayOfmonthli').hide();
			$('#dayOfweekli').hide();
			$('#hourOfdayli').show();
		}else if( cval == 'ONCE'){
			$('#dayOfmonthli').hide();
			$('#dayOfweekli').hide();
			$('#hourOfdayli').hide();
		}

	});

	inlineSpectrumBodyBackground();

	$('#import_primary_settings').submit(function () {
		savePreferences2();
		return false;
    });
	var isrc="/api/v4/" + encodeURIComponent(customerID) + "/nl2go/get_preview?nlid="+nlid;
	$('#previewFrame').attr('src',isrc);

	$("#button_save").click(submitImport);
	$(function() {
	    $( "#accordion" ).accordion();
	});
	loadMandatorInfo(function(json) {
		initializeSolutionAndItemTypes(json);
	});

});


/** It must be called as the <code>mandatorInfo</code> is loaded.
 */
function initializeSolutionAndItemTypes(mandatorInfo) {
	var solution = mandatorInfo.baseInformation.version;

	var defaultItemType = mandatorInfo.itemTypeConfiguration.defaultType;

	if (solution == 'EXTENDED') {

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


	} else {

		var defaultItemTypeDescription = "Default";

		for (var i in mandatorInfo.itemTypeConfiguration.types) {
			if (mandatorInfo.itemTypeConfiguration.types[i].id == defaultItemType) {
				defaultItemTypeDescription = mandatorInfo.itemTypeConfiguration.types[i].description;
			}
		}

		var d = defaultItemTypeDescription + ' (' + defaultItemType + ')';
		var l = $('<label></label>').text(d);

		$('#input_type_block').hide();


		$('#input_type_block').css("opacity",'0.50');


	}

	$('#input_type_block .value').css('visibility', 'visible');
}

function submitImport() {
	$('<input type="submit">').hide().appendTo($('#import_primary_settings')).click().remove();
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

function inlineSpectrumBodyBackground(){
	 $.ajax({
		  type: "GET",
		  mimeType: "application/json",
		  contentType: "application/json;charset=UTF-8",
		  dataType: "json",
		  url: "/api/v4/" + encodeURIComponent(customerID) + "/nl2go/pref/getMailPreferences?nlid="+nlid,
		  success: function(retObj) {
			  unsetLoadingDiv($('body'));
			  if(retObj.scenario){
				  $("#mail_scenario").val(retObj.scenario);
			  }
			  if(retObj.inputType){
				  $("#input_type").val(retObj.inputType);
			  }
			  if(retObj.title){
				  $("#mail_title").val(retObj.title);
			  }
			  $("#logo").val(retObj.logo);
			  $("#menu_elment_hotline_name").val(retObj.holineName);
			  $("#menu_elment_hotline_number").val(retObj.holineNumber);
			  $("#cta").val(retObj.cta);
			  var startDate = new Date(retObj.startDate);
			  var importWeek = startDate.getDay();
			  if(importWeek){
				  $("#dayOfweek").val(importWeek);
			  }
			  var importHour = startDate.getHours();
			  if(importHour){
				  $("#hourOfday").val(importHour);
			  }
			  var importMonth = startDate.getDate();
			  if(importMonth){
				  $("#dayOfmonth").val(importMonth);
			  }
			  if(retObj.timeframe){
				  $("#timeframe").val(retObj.timeframe);
			  }


			  if(retObj.background !== null){
				  currentbg = retObj.background;
			  }
			  if(retObj.menuBackground !== null){
				  menuCurrentbg = retObj.menuBackground;
			  }
			  if(retObj.ctaBackground !== null){
				  ctaCurrentbg = retObj.ctaBackground;
			  }
			  if(retObj.footerBackground !== null){
				  footerCurrentbg = retObj.footerBackground;
			  }

			  if(retObj.menuLinks !== null){
				  var kk = 1;
				  var menuLinks = retObj.menuLinks;
				  for(var menuLink in menuLinks){
					  $("#menu_elment_name"+kk).val(menuLinks[menuLink].caption);
					  $("#menu_elment_url"+kk).val(menuLinks[menuLink].url);
					  kk++;
				  }
			  }
			  $("#facebook").val(retObj.facebook);
			  $("#googleplus").val(retObj.googleplus);
			  $("#twitter").val(retObj.twitter);

			  if(retObj.imprint !== null){
				  $("#imprintName").val(retObj.imprint.caption);
				  $("#imprintURL").val(retObj.imprint.url);
			  }

			  if(retObj.unsubscribe !== null){
				  $("#unsubscribeName").val(retObj.unsubscribe.caption);
				  $("#unsubscribeURL").val(retObj.unsubscribe.url);
			  }
			  $("#basket_subject").val(retObj.hello1);
			  $("#basket_note").val(retObj.note1);
			  $("#basket_footer").val( retObj.footer1);



			  spectrumBackground('mailBackground',currentbg);
			  spectrumBackground('menuBackground',menuCurrentbg);
			  spectrumBackground('ctaBackground',ctaCurrentbg);
			  spectrumBackground('footerBackground',footerCurrentbg);
		  },
		  error: function() {
			  unsetLoadingDiv($('body'));
			  spectrumBackground('mailBackground',currentbg);
			  spectrumBackground('menuBackground',menuCurrentbg);
			  spectrumBackground('ctaBackground',ctaCurrentbg);
			  spectrumBackground('footerBackground',footerCurrentbg);
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
	    	}else if('ctaBackground'  === elementId){
	    		ctaCurrentbg = bgcolorPrev;
	    	}else if('footerBackground'  === elementId){
	    		footerCurrentbg = bgcolorPrev;
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
		if(name !== null && name !== ''){
			var menuLink = new Object();
			menuLink.caption = name;
			menuLink.url = url;
			menuLinksArray.push(menuLink);
		}
	}
}



function stdAjaxErrorHandler(jqXHR, textStatus, errorThrown) {
	  if(jqXHR !== null && jqXHR.status == 403) {
		  setMessagePopUp("problem", "error_server_error_403");
	  }
	  else if(jqXHR !== null && jqXHR.status == 401) {
		  setMessagePopUp("problem", "error_server_error_401");
	  }
	  else if(jqXHR !== null && jqXHR.status == 400) {
		  setMessagePopUp("problem", "error_server_error_400");
	  }
	  else if(jqXHR !== null && jqXHR.status == 404) {
		  setMessagePopUp("problem", "error_server_error_404");
	  }
	  else if(jqXHR !== null && jqXHR.status == 409) {
		  setMessagePopUp("problem", "error_server_error_409");
	  }
	  else {
		  setMessagePopUp("problem", "error_server_error");
	  }
}




function savePreferences2() {
	setLoadingDiv($('body'));
	 retObj = new Object();
	 retObj.newsletterId = nlid;
	 retObj.mandatorName = customerID;
	 retObj.scenario = $("#mail_scenario").val();
	 retObj.inputType = $("#input_type").val();
	 retObj.title = $("#mail_title").val();
	 retObj.interval =  $("#mail_schedule").val();
	 var d = new Date();
	 if(retObj.interval == 'WEEKLY'){
		 var currentDay = d.getDay();
		 var fromDay =  $("#dayOfweek").val();
		 var diff = fromDay-currentDay;
		 if(fromDay < currentDay){
			 diff = 7+diff;
		 }
		 d.setDate(d.getDate()+diff);
	 }
	 if(retObj.interval != 'ONCE'){
		 d.setHours($("#hourOfday").val(), 0, 0);
	 }

	 retObj.startDate = d;
	 retObj.timeframe =  $("#timeframe").val();


	 retObj.logo = $("#logo").val();
	 retObj.holineName = $("#menu_elment_hotline_name").val();
	 retObj.holineNumber = $("#menu_elment_hotline_number").val();
	 retObj.cta = $("#cta").val();

	 retObj.ctaBackground = ctaCurrentbg;
	 retObj.background = currentbg;
	 retObj.menuBackground = menuCurrentbg;
	 retObj.menuLinks = new Array();
	 addMenuElement(retObj.menuLinks);

	 retObj.footerBackground = footerCurrentbg;
	 retObj.facebook = $("#facebook").val();
	 retObj.googleplus = $("#googleplus").val();
	 retObj.twitter = $("#twitter").val();


	 retObj.hello1 = $("#basket_subject").val();
	 retObj.note1 = $("#basket_note").val();
	 retObj.footer1 = $("#basket_footer").val();



	 var imprintName = $("#imprintName").val();
	 var imprintURL  = $("#imprintURL").val();
	 if(imprintName !== null && imprintName !== ''){
		 var menuLink = new Object();
		 menuLink.caption = imprintName;
		 menuLink.url = imprintURL;
		 retObj.imprint = menuLink;
	 }

	 var unsubscribeName = $("#unsubscribeName").val();
	 var unsubscribeURL  = $("#unsubscribeURL").val();
	 if(imprintName !== null && imprintName !== ''){
		 var menuLink = new Object();
		 menuLink.caption = unsubscribeName;
		 menuLink.url = unsubscribeURL;
		 retObj.unsubscribe = menuLink;
	 }

	 $.ajax({
		  type: "POST",
		  mimeType: "application/json",
		  contentType: "application/json;charset=UTF-8",
		  dataType: "json",
		  data: JSON.stringify(retObj),
		  url: "/api/v4/" + encodeURIComponent(customerID) + "/nl2go/pref/savePreferences",
		  success: function(json) {
			  unsetLoadingDiv($('body'));
			  nlid = json.newsletterId;
			  var isrc="/api/v4/" + encodeURIComponent(customerID) + "/nl2go/get_preview?nlid="+nlid;
			  $('#previewFrame').attr('src',isrc);
			  setMessagePopUp("positive", "message_data_saved_successfully");
		  },
		  error: function() {
			  unsetLoadingDiv($('body'));
			  stdAjaxErrorHandler();
		  }
	  });
}


