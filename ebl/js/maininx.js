
var open_reference_code = gupDecoded('reference_code');

var customerID; // <-- user "mandatorDao.mandator.baseInformation.id" instead

var scenarioInfoList; // loaded by ajaxScenarioList()

var statistic;

var period = sessionStorage.getItem("period") || '24H';

var mandatorList;

var customer; // NOT A MANDATOR, but Customer JSON object

var loginInfo;



//DOCUMENT READY

$(document).ready(function() {

	// STATIC INITIALIZER
	
	//Revert to a previously saved state
	window.addEventListener('popstate', function(event) {
		var state = event.state;
		switchState(state, false);
	});
	
	window.addEventListener('popstate_manual', function(event) {
		var state = event.detail;
		switchState(state, false);
	});
	
	
	var closePopup = function(e) {
	    if (e.which == 1 || e.which == 27) { // left click or Esc
	    	if ($("#pactasPopup").is(':visible')) {
	    		switchState("", true);
	    	}
	    	if ($("#licenceKeyId").is(':visible')) {
	    		switchState("", true);
	    	}
	    	if ($("#editDataOverlay").is(':visible')) {
	    		switchState("", true);
	    	}
	    }
	};
	
	$(document).bind('keydown', closePopup);

	$('#pactasPopup a.closeOverlay, #licenceKeyId a.closeOverlay').click(function () {
	    switchState("", true);
	});	
	
	$('#copyrightsLink').off('click').click(function() {
		$('#messageCorporate').hide();
		$('#messageCopyrights').show();
	});
	
	//Change the value in selectbox 1 in collected events
	$('select[id^="events_select_for_chart_bar"]').change(function () {
	    renderCollectedEvents();
	});
	
	$('select[id^="select_for_delivered_recommendations_chart_bar"]').change(function () {
	    renderRecommendationChart();
	});
	
	
	
	// SCENARIOS, REVENUE, ABTESTS, IMPORT
	
	$('section.scenarios li.tabScenarios').click(function() {
		switchTab("SCENARIOS");
	});
	
	
	$('section.scenarios li.tabRevenue').click(function() {
		switchTab("REVENUE");
	});
	
	$('section.scenarios li.tabAbTests').click(function() {
		switchTab("ABTESTS");
	});
	
	$('section.scenarios li.tabImports').click(function() {
		switchTab("IMPORT");
	});
	
	$('section.scenarios li.tabMail').click(function() {
		switchTab("MAIL");
	});
	
	
	
	$('#createNewTest').click(function(){
		gui.editTest(new Test(emptyTest));
	});

	
	// is called if right converison unit is changed from relative -> absolute and vice versa
	$('#conversion_units').change(function () {
		renderConversionRate();
	});
	
	$('#settingsP .closeOverlay').click(function () {
		window.parent.history.replaceState(null, null, "/");
	});
	$('#itemimportP .closeOverlay').click(function () {
		 readImportJobs();
	});
	$('#mailP .closeOverlay').click(function () {
		 readMailJobs();
	});
	
	
	$('section  div.index_mandator').hover(function() {
		$(this).find('.index_hover').css('display', 'table-row');
	}, function() {
		$(this).find('.index_hover').css('display', 'none');
	});
	
	
	$('#index_conversion_rate_average').attr('data-translate', 'index_conversion_rate_average_day');
	$('#index_delivered_recommendations').attr('data-translate', 'index_delivered_recommendations_day');
	$('#index_collected_events').attr('data-translate', 'index_collected_events_day');

	

    //set drop down field to default values: click, purchase, consume
    $('#events_select_for_chart_bar_1').val('click');
    $('#events_select_for_chart_bar_2').val('purchase');
    $('#events_select_for_chart_bar_3').val('recommended');

	showEmptyCharts();
	showEmptyEventChart();

	
	include(["/js/switch_mandator.js", "/js/user.js", "/js/dao/mandator.js", "/js/added_revenue.js", "/plugin/plugin.js"], function() {
		
		setLoadingDiv('section.mandant > header');
		
		yooAjax(null, {
			url: "/api/v4/profile/get_accessible_mandators?versionFilter=LITE,EXTENDED", // <-- no 2GO mandators
			success: function (json) {
				
				mandatorList = json; // "mandatorList" is a global variable
				
				if (json.length > 0) {
					var cooMandator = gupDecoded('customer_id') || $.cookie('customerID');
					
					for (var i = 0; i < json.length; i++) {
						if (cooMandator == json[i].baseInformation.id) {
							customerID = cooMandator; // "customerID" is a global variable
						}
					}
					if ( ! customerID) {
						customerID = json[0].baseInformation.id; // "customerID" is a global variable
						$.cookie('customerID', customerID, { expires: 365 });
					}
				} else {
					piwikCallerInternal();
					showNoAvailableMandatorPopup();
					return;
				}
				
				mandatorDao.init(customerID).always(function() {
					ajaxScenarioList(period).always(function() {
						initialize().always(function() {
							unsetLoadingDiv('section.mandant > header');
						});
			    	});
				});
			}
		}).always(function() {
			unsetLoadingDiv('section.mandant > header');		
    	});
	});
});


/** There are following tabs: SCENARIOS, REVENUE, ABTESTS, IMPORT
 */
function switchTab(newTab) {
	
	if (newTab) {
		sessionStorage.setItem("active_tab", newTab);
	} else {
		newTab = sessionStorage.getItem("active_tab");
	}
	
	$("section.scenarios ul.options_menu li").removeClass("current");
	$("section.scenarios .tabContent").hide();
	$("section.scenarios div.controls").hide();
	
	if (newTab == "SCENARIOS") {
		$("#available_scenarios").show();
		$("#scenarioControls").show();
		$("section.scenarios li.tabScenarios").addClass("current");	
		
		
	} else if (newTab == "REVENUE") {
		$("#addedRevenue").show();
		$("#addedRevenueControls").show();
		$("section.scenarios li.tabRevenue").addClass("current");
		
		
	} else if (newTab == "ABTESTS") {
		$("#ABTests").show();
		$("#abControls").show();
		$("section.scenarios li.tabAbTests").addClass("current");
		
		if(!$('#testList').data('tests').length){
			$('#abControls').find('.helpLink').trigger('click');
		}
		
	} else if (newTab == "PLUGINS") {
		$("#pluginTab").show();
		$("#pluginTabControls").show();
		$("section.scenarios li.tabPlugins").addClass("current");
		
	} else if (newTab == "IMPORT") {
		$("#importJobs").show();
		$("#itemImortControls").show();
		$("section.scenarios li.tabImports").addClass("current");
	
	} else if (newTab == "MAIL") {
		$("#mailJobs").show();
		$("#mailControls").show();
		$("section.scenarios li.tabMail").addClass("current");
	
	} else {
		switchTab("SCENARIOS");
	}
}


/**
 * @return {Date}
 */
function currentPeriodFromTime() { // <-- "period" is a global variable

	var result = Date.today().clone();

	if (period == 'WEEK') {
		result = result.clearTime().add({days: -7});
	} else if (period == 'MONTH') {
		result = result.clearTime().add({days: -30});
	} else if (period == '3MONTHS') {
		result = result.clearTime().add({days: -91}); // requirement:  91 % 7 = 0
	} else if (period == 'YEAR') {
		result = result.clearTime().add({days: -371}); // requirement:  91 % 7 = 0
	} else if (period == 'DAY') {
		result = result.clearTime().add({days: -1});
	} else { // 24H
		result = result.add({hours: -24});
	}

	return result;
}


/**
 * @return {Date}
 */
function currentPeriodToTime() { // <-- "period" is a global variable
	var currentDate = Date.today().clone();

	if (period != '24H' ) {
		currentDate = currentDate.clearTime();
	}
	return currentDate;
}


/** Called, if the time period (MONTH, WEEK, DAY etc.) was changed
 */
var ajaxScenarioList = function(new_period, callback) {
	
	if (!customerID) {
		return;
	}
	
	$('#itemimportF').attr('src', 'itempop.html?customer_id=' +  encodeURIComponent(customerID)); 
	
	setLoadingDiv($('#statistic_charts'));
	setLoadingDiv($('.available_scenarios'));
	
	period = new_period; // <-- "period" is a global variable
	sessionStorage.setItem("period", period);
	
	
	// redecorating menu
	
	$("fieldset.time_settings li.current").removeClass("current");
	$("fieldset.time_settings .custom_range_settings").hide();

	var date_from = currentPeriodFromTime();
	var date_to = currentPeriodToTime();

	var date_to_excluded = date_to.clone().add({"milliseconds": -1});
	
	var xsd_from = date_from.toString("yyyy-MM-ddTHH:mm:ss");
	var xsd_to   = date_to.toString("yyyy-MM-ddTHH:mm:ss");
	var granularity;

	var $current;
	
	if (period == 'WEEK') {
	    granularity = "PT12H";
	    $current = $("fieldset.time_settings li.view_option_week");
	    
	    $("fieldset.time_settings li.view_option_week span.info").text(dateFormat(date_from) + " - " + dateFormat(date_to_excluded));
	    
	} else if (period == 'MONTH') {
        granularity = "P1D";
        $current = $("fieldset.time_settings li.view_option_month");
        
        $("fieldset.time_settings li.view_option_month span.info").text(dateFormat(date_from) + " - " + dateFormat(date_to_excluded));

	} else if (period == '3MONTHS') {
		granularity = "P1W";
		$current = $("fieldset.time_settings li.view_option_3months");

		$("fieldset.time_settings li.view_option_3months span.info").text(dateFormat(date_from) + " - " + dateFormat(date_to_excluded));

	} else if (period == 'YEAR') {
		granularity = "P1W";
		$current = $("fieldset.time_settings li.view_option_year");

		$("fieldset.time_settings li.view_option_year span.info").text(dateFormat(date_from) + " - " + dateFormat(date_to_excluded));

	} else if (period == 'DAY') {
	    granularity = "PT1H";
	    $current = $("fieldset.time_settings li.view_option_day");
	    
	} else { // 24H
	    granularity = "PT1H";
	    $current = $("fieldset.time_settings li.view_option_day");
	}
	
	$current.addClass("current");
	$current.find(".custom_range_settings").show();
	
	var result1 = $.ajax({
        dataType: "json",
        url: "/api/v4/" + encodeURIComponent(customerID) + "/statistic/summary/REVENUE,RECOS,EVENTS?from_date_time=" + xsd_from + "&to_date_time=" + xsd_to + "&granularity=" + granularity + "&no-realm",
		success: function (data) {
			statistic = data;
        },
        error: mainErrorHandler
    });
	
	var result2 = $.ajax({
	    dataType: "json",
	    url: "/api/v3/" + encodeURIComponent(customerID) + "/structure/get_scenario_list?from_date_time=" + xsd_from + "&to_date_time=" + xsd_to + "&granularity=" + granularity + "&no-realm",
	    success: function (json) {
	    	scenarioInfoList = json.scenarioInfoList;
	    },
	    error: mainErrorHandler
	});
	
	
	loadAddedRevenue(); // <-- this function is in "added_revenue.js"
	
	
	return $.when(result1, result2).done(function() {
		
		$('.export').attr('href', "/api/v3/" + encodeURIComponent(customerID) + "/revenue/statistic.xlsx?from_date_time=" + xsd_from + "&to_date_time=" + xsd_to + "&granularity=" + granularity + "&no-realm");
		
		if (period == 'WEEK') {
			$('#index_conversion_rate_average').attr('data-translate', 'index_conversion_rate_average_week');
			$('#index_delivered_recommendations').attr('data-translate', 'index_delivered_recommendations_week');
			$('#index_collected_events').attr('data-translate', 'index_collected_events_week');
		    
		} else if (period == 'MONTH') {
			$('#index_conversion_rate_average').attr('data-translate', 'index_conversion_rate_average_month');
			$('#index_delivered_recommendations').attr('data-translate', 'index_delivered_recommendations_month');
			$('#index_collected_events').attr('data-translate', 'index_collected_events_month');

		} else if (period == '3MONTH') {
			$('#index_conversion_rate_average').attr('data-translate', 'index_conversion_rate_average_3month');
			$('#index_delivered_recommendations').attr('data-translate', 'index_delivered_recommendations_3month');
			$('#index_collected_events').attr('data-translate', 'index_collected_events_3month');

		} else if (period == 'YEAR') {
			$('#index_conversion_rate_average').attr('data-translate', 'index_conversion_rate_average_year');
			$('#index_delivered_recommendations').attr('data-translate', 'index_delivered_recommendations_year');
			$('#index_collected_events').attr('data-translate', 'index_collected_events_year');
	        
		} else if (period == 'DAY' || period == '24H') {
			$('#index_conversion_rate_average').attr('data-translate', 'index_conversion_rate_average_day');
			$('#index_delivered_recommendations').attr('data-translate', 'index_delivered_recommendations_day');
			$('#index_collected_events').attr('data-translate', 'index_collected_events_day');
		}
		
		localizer();
		
		renderScenarioList();
		renderRecommendationChart();
		renderCollectedEvents();
		renderConversionRate();
		
    	if (callback) {
    		callback(json);
    	}
	}).always(function() {
		unsetLoadingDiv($('#statistic_charts'));
		unsetLoadingDiv($('.available_scenarios'));
	});
};


var _paq = _paq || [];
function piwikCaller(name){
	 _paq.push(['setCustomVariable',1,'mandator name', name, "visit"]);
	 piwikCallerInternal();
}

function piwikCallerInternal(){
	 _paq.push(["trackPageView"]);
	 _paq.push(["enableLinkTracking"]);

	(function() {
	   var u=(("https:" == document.location.protocol) ? "https" : "http") + "://statistic.yoochoose.net/";
	   _paq.push(["setTrackerUrl", u+"piwik.php"]);
	   _paq.push(["setSiteId", "4"]);
	   var d=document, g=d.createElement("script"), s=d.getElementsByTagName("script")[0]; g.type="text/javascript";
	   g.defer=true; g.async=true; g.src=u+"piwik.js"; s.parentNode.insertBefore(g,s);
	})();
}


/** Called only once, when the page is loaded.
 *  User related GUI elements must be configured here. 
 *  
 *  Use the global variable "customerID" to have the current mandator ID. 
 *  
 *  @see #initialLoadData()
 */
function initialize() {
	
	
	//Last day click event
	$('#view_option_day').click(function () {
	    ajaxScenarioList("24H");
	});
	
	$('#view_option_week').click(function () {
		ajaxScenarioList("WEEK");
	});
	
	$('#view_option_month').click(function () {
	    ajaxScenarioList('MONTH');
	});

	$('#view_option_3months').click(function () {
		ajaxScenarioList('3MONTHS');
	});

	$('#view_option_year').click(function () {
		ajaxScenarioList('YEAR');
	});
	
	
	// SCENARIOS, REVENUE, ABTESTS, IMPORT
	$('section.scenarios li.tabScenarios').click(function() {
		switchTab("SCENARIOS");
	});
	
	
	$('section.scenarios li.tabRevenue').click(function() {
		switchTab("REVENUE");
	});
	
	$('section.scenarios li.tabAbTests').click(function() {
		switchTab("ABTESTS");
	});
	
	$('section.scenarios li.tabImports').click(function() {
		switchTab("IMPORT");
	});
	
	$('section.scenarios li.tabPlugins').click(function() {
		switchTab("PLUGINS");
	});
	
	$('section.scenarios li.tabMail').click(function() {
		switchTab("MAIL");
	});
	
				
	//init the tab behaviour
	$('.tab').on('click', function(){
		var $this = $(this);
		if($this.hasClass('active')){
			return;
		}
		
		var targetSelector = $this.data('target'); // for example '#importJobs'
		
		$this.addClass('active current').siblings('.tab').removeClass('active current');
		$(targetSelector).show().siblings('.tabContent').hide();
		$($this.data('controls')).show().siblings('.controls').hide();
		
		var event = new CustomEvent('dashboard_tab_switched', { 'detail': targetSelector });
		
		if (mandatorDao.mandator) {
			window.dispatchEvent(event);
		} else {
			window.addEventListener('mandator_loaded', function(event) {
				window.dispatchEvent(event);
			});
		}
	}).removeClass('active').first().trigger('click');
	
	
	$('#createNewTest').click(function(){
		gui.editTest(new Test(emptyTest));
	});


	var userLoadingPromise = getCurrentUser(function(loginInfo) {
		
		var name = "";
		if (loginInfo.firstName) name += loginInfo.firstName;
		if (loginInfo.lastName && name) name += " ";
		if (loginInfo.lastName) name += loginInfo.lastName;
		
		if ( ! name) {
			name += loginInfo.id;
		}
		
		$('.account_data').children('li').first().find('strong').text(name);
		piwikCaller(name);
	    
	    // updating interface language
	    if (loginInfo.lang && in_to_language != loginInfo.lang) { // "in_to_language" is a global variable defined in "i18n.js"
	    	changeLang(loginInfo.lang, false);
	    }
	});
	
	return $.when(
		userLoadingPromise,
		initialLoadData(),                   // getting profile pack
		setMandantData(mandatorDao.mandator) // getting mandator statistic	
    ).always(function() {
    	
    	if (mandatorList.length > 1) {
    		$('.switch').show();
    	} else {
    		$('.switch').hide();
    	}
    	
    	for (var i = 0; i < mandatorList.length; i++) {
    		var mandatorInfo = mandatorList[i];
    		var id = mandatorInfo.baseInformation.id;
    		var web = mandatorInfo.baseInformation.website;
    		
    		$('#choose_mandant').append('<option value="' + id + '">' + id + ': ' + web + '</option>');
    	}
    	
    	if (customerID && open_reference_code) {
    		openScenarioDialog(customerID, open_reference_code);
    	} else {
    		var anchor = anchorDecoded();
    		
    		var event = new CustomEvent('popstate_manual', { 'detail': anchor });
			window.dispatchEvent(event);
    	}
    });	
	
};





function switchState(state, pushState) {
//	if (state == "contract") {
//		openContractDetails(pushState);
//	} else
//

	$('#editDataOverlay').hide();
	$('#pactasPopup').hide();
	$('#licenceKeyId').hide();

	if (state == "personal") {
		openPersonalDetails(pushState);
	} else if (state == "license") {
		openLicenseKey(pushState);
		
	}
}


/** Opens the popup "Edit personal data".
 */
function openLicenseKey(pushState) {
	
	mandatorDao.loadRegistrationData("header.top_head", function(json) {
		$('#thekeyid').html(json.licenseKey);
	    $('#licenceKeyId').show();	
	    
	    switchHistoryState("license", pushState);
	});
    
}


/** Opens the popup "Edit personal data".
 */
function openPersonalDetails(pushState) {

	var mandator = mandatorDao.mandator;
	if (! mandator) {
		console.log("No mandator loaded. Unable to open personal data popup.");
		return;
	}
	
    var customerPromise = yooAjax(null, {
        url: "/api/v3/profile/get_profile_pack/" + decodeURIComponent(mandatorDao.getId()),
        success: function (json) {
            customer = json.profilePack.customer; // <-- "customer" is a global variable
            
            if (customer.id) {
	        	$('#eemail').val(ifnull(customer.email, ""));
	        	$('#ecompany').val(ifnull(customer.company, ""));
	        	$('#efname').val(ifnull(customer.firstName, ""));
	        	$('#elname').val(ifnull(customer.lastName, ""));
	        	$('#ephone').val(ifnull(customer.phone, ""));
	        	$('#estreet_and_house').val(ifnull(customer.address.street, ""));
	        	$('#ezip').val(ifnull(customer.address.zip, ""));
	        	$('#ecity').val(ifnull(customer.address.city, ""));
	        	$('#ecountry').val(ifnull(customer.address.country, ""));
	        	
	        	$('#contract_details').show();
            } else {
            	$('#contract_details').hide();
            }
        }
    });
    
    var personalPromise = yooAjax(null, {
        url: "/api/v4/profile/get_me",
        success: function (json) {
        	loginInfo = json; // <-- "loginInfo" is a global variable
        	
            var localProfile = loginInfo.localProfile; // <-- "loginInfo" is a global variable
            
            if (json.provider) {
            	$("#personal_details img.sso-icon").attr("src", "");
            } else {
            	$("#personal_details img.sso-icon").hide("/img/auth-providers/250-" + json.provider + "-nom.png");
            	$("#personal_details input[name='p_email']").val(ifnull(json.id, ""));
            	$("#personal_details input[name='p_email']").attr("disabled", "disabled");
            }
            
            if (localProfile) {
            	if (json.provider) {            	
            		$("#personal_details input[name='p_email']").val(ifnull(localProfile.email, ""));
            		$("#personal_details input[name='p_email']").removeAttr("disabled");
            	}
	        	$("#personal_details input[name='p_firstname']").val(ifnull(localProfile.firstName, ""));
	        	$("#personal_details input[name='p_lastname']").val(ifnull(localProfile.lastName, ""));
            }
        }
    });
    
    setLoadingDiv("header.top_head");
    
	$.when(
		customerPromise,
		personalPromise
    ).always(function() {
    	switchHistoryState("personal", pushState);
    	$('#editDataOverlay').show();
    	unsetLoadingDiv("header.top_head");
    });	

}


///** Opens the popup "Edit contact data".
// */
//function openContractDetails(pushState, a) {
//
//	var mandator = mandatorDao.mandator;
//	if (! mandator) {
//		console.log("No mandator loaded. Unable to open Pactas/Customer popup.");
//		return;
//	}
//	
//	var custId = mandatorDao.getId();
//
//	yooAjax("header.top_head", {
//		type: "POST", // but no data
//        url: "/api/v4/base/create_self_service_token/" + encodeURIComponent(custId),
//        success: function (json) {
////        	$('#pactasPopup iframe').attr("src", json.url);
////        	$('#pactasPopup').show();
//        	
//        	$(a).attr("href", json.url);
//        	
////        	closePopupIfOpen("pactas_contract_details");
////        	var win = window.open(json.url, "pactas_contract_details", "width=800, height=550, scrollbars=yes", true);
////        	win.focus();
////        	setTimeout(function(){win.focus();},1000);
////        	switchHistoryState("contract", pushState);
//        },
//    });	
//}

function closePopupIfOpen(popupName){
	if(typeof(window[popupName]) != 'undefined' && !window[popupName].closed){
		window[popupName].close();
	}
}

var ifExtended = function() {
	  var solution = mandatorDao.mandator.baseInformation.version;
	  var extendedSolution = (solution == 'EXTENDED');
	  
	  return extendedSolution;
};



function validateField(name) {
		
	if($("input[name='" + name + "']").val() == "") {
		$("label[for='" + name + "']").parent().addClass("problem");
		return false;
	} else {
		$("label[for='" + name + "']").parent().removeClass("problem");
		return true;
	}
}


function saveForme() {
	
	var validated =
			validateField("ecompany") &
			validateField("efname") &
			validateField("elname") &
			validateField("estreet_and_house") &
			validateField("ezip") &
			validateField("ecity") &
			validateField("ecountry") &
			validateField("ephone");
	
	var showError = ! validated;
	
	if(customer.id && showError == true) {
		setMessagePopUp("problem", "error_fill_required_fields");
	} else {
		
		var localProfile = loginInfo.localProfile; // <-- "loginInfo" is a global variable
		
		localProfile.email     = $("#personal_details input[name='p_email']").val();
		localProfile.firstName = $("#personal_details input[name='p_firstname']").val();
		localProfile.lastName  = $("#personal_details input[name='p_lastname']").val();
		
		var updateContract;
		
		if (customer.id) {
			
		    customer.company         = $("#contract_details input[name='ecompany']").val();
		    customer.firstName       = $("#contract_details input[name='efname']").val();
		    customer.lastName        = $("#contract_details input[name='elname']").val();
		    customer.phone           = $("#contract_details input[name='ephone']").val();
		    customer.address.street  = $("#contract_details input[name='estreet_and_house']").val();
		    customer.address.zip     = $("#contract_details input[name='ezip']").val();
			customer.address.city    = $("#contract_details input[name='ecity']").val();
		    customer.address.country = $("#contract_details input[name='ecountry']").val();
		    
			updateContract = yooAjax(null, {
				data: customer,
				url: "/api/v3/profile/update_customer",
				success: function (json) {
					//on success
				}
			});
		} else {
			updateContract = $.Deferred();
			updateContract.resolve();
		}
	    
		var updatePersonal = yooAjax(null, {
			data: localProfile,
			url: "/api/v4/profile/update_local_profile",
			success: function (json) {
				//on success
			}
		});

		setLoadingDiv("#editDataOverlay");
		$.when(
			updateContract,
			updatePersonal
	    ).success( function() {
    		setMessagePopUp("positive", "message_data_saved_successfully");
	    }).always(function() {
	    	unsetLoadingDiv("#editDataOverlay");
	    });	
	}
}



function setMandantData(mandatorInfo) {
	
	var id = mandatorInfo.baseInformation.id;
	var website = mandatorInfo.baseInformation.website;
	var version = mandatorInfo.baseInformation.version;
    
    $('.info').children('strong').text(website);
    $('.info').children('p').text(" (" + version + ")");
    $('.info').children('span').children('.codeid').text(id);

    return yooAjax(null, {
        url: "/ebl/v3/profile/get_mandator_statistic/" +  decodeURIComponent(id),
        success: function (json) {
            var mandatorStatistic = json.mandatorStatistic;
            $('#statistic_events').text(formatInteger(mandatorStatistic.eventsCalenderMonth));
            $('#statistic_recocalls').text(formatInteger(mandatorStatistic.recommendationCallsCalenderMonth));
            $('#statistic_active_profiles').text(formatInteger(mandatorStatistic.profilesTracked));
            $('#statistic_active_objects').text(formatInteger(mandatorStatistic.objectsTracked));
            $('#statistic_recommendations').text(formatInteger(mandatorStatistic.recommendationsCalenderMonth));
            $('#statistic_models').text(formatInteger(mandatorStatistic.models));
        },
    });
}


function formatInteger(v) {
	var result = '';
	v = v + '';
	for (var i = 0; i < v.length; i++) {
		result = v[v.length - 1 - i] + result;
		if ((i+1) % 3 == 0 && i != v.length - 1) {
			result = '.' + result;
		}
	}
	return result;
}



/** This function is called, after the mandator was sucessfully loaded
 * 
 *  Use the global variable "customerID" to have the current mandator ID. 
 * */ 
function initialLoadData() {
	
	var event = new CustomEvent('mandator_loaded', { 'detail': mandatorDao.mandator });
	window.dispatchEvent(event);
	
	var coma = mandatorDao.getProductComa();
	
	if (mandatorDao.getProductComa() == 'IBS') {
		$("#edit_personal_datal").hide();
	} else {
		$("#edit_personal_datal").show();
	}
	
	$('#edit_contact_datal').hide();
	
	if (coma == 'PACTAS') {
		
		var custId = mandatorDao.getId();

		yooAjax("header.top_head", {
			type: "POST", // but no data
	        url: "/api/v4/base/create_self_service_token/" + encodeURIComponent(custId),
	        success: function (json) {
//	        	$('#pactasPopup iframe').attr("src", json.url);
//	        	$('#pactasPopup').show();
	        	
	        	$('#edit_contact_datal').attr("href", json.url);
	        	
	        	$('#edit_contact_datal').show();
	        	
//	        	closePopupIfOpen("pactas_contract_details");
//	        	var win = window.open(json.url, "pactas_contract_details", "width=800, height=550, scrollbars=yes", true);
//	        	win.focus();
//	        	setTimeout(function(){win.focus();},1000);
//	        	switchHistoryState("contract", pushState);
	        },
	    });	
		
	}
	
	
	if ( ! ifExtended()) {
		$(".available_charts select option[value='rate']").hide();
		$(".available_charts select option[value='blacklist']").hide();
		$(".available_charts select option[value='basket']").hide();
	} else {
		$(".available_charts select option[value='rate']").show();
		$(".available_charts select option[value='blacklist']").show();
		$(".available_charts select option[value='basket']").show();		
	}
   	
    $('#createNewScenario').off('click').click(function() {
    	$('#settingsF').attr('src',"settingspop.html?customer_id=" + encodeURIComponent(customerID) + "&from_template=3");
    	$('#settingsP').show();
    });
    
    $('#contactlink').off('click').click(function() {
    	$('#messageContact').show();
    });
    $('#privacylink').off('click').click(function() {
    	$('#messagePrivacy').show();
    });
    $('#corporatlink').off('click').click(function() {
    	$('#messageCorporate').show();
    });
    
    $('#copyrightsLink').off('click').click(function() {
    	console.log("should close corporate1");
    	$('#messageCorporate').hide();
    	console.log("should close corporate2");
    	$('#messageCopyrights').show();
    });
    
	if(mandatorDao.getVersion() == 'EXTENDED'){
		$('section.scenarios li.tabAbTests').show();
		$('section.scenarios li.tabPlugins').show();
		$('section.scenarios li.tabImports').show();	
		if('321' === customerID || '1221'  === customerID || '1780'  === customerID  || '1351'  === customerID || '1209'  === customerID ){
			$('section.scenarios li.tabMail').show();
			$('#mailF').attr('src', 'mailconfig.html?customer_id=' +  encodeURIComponent(customerID));
			$('#createNewMail').off('click').click(function() {
				$('#mailF').attr('src', 'mailconfig.html?customer_id=' +  encodeURIComponent(customerID));
				$('#mailP').show();
			});
			readMailJobs();
		}else{
			$('section.scenarios li.tabMail').hide();
		}
		$('#itemimportF').attr('src', 'itempop.html?customer_id=' +  encodeURIComponent(customerID));
		$('#createNewImport').off('click').click(function() {
			$('#itemimportF').attr('src', 'itempop.html?customer_id=' +  encodeURIComponent(customerID));
			$('#itemimportP').show();
		});
		readImportJobs();
		
	}else{
		$('section.scenarios li.tabAbTests').hide();
		$('section.scenarios li.tabPlugins').hide();
		$('section.scenarios li.tabImports').hide();
		$('section.scenarios li.tabMail').hide();
	}
	$('section.scenarios ul.options_menu').find('li:visible').removeClass('last-child');
	$('section.scenarios ul.options_menu').find('li:visible:last').addClass('last-child');
 
	switchTab(false); // switching tab loading the last tab from session storage
}


var imports = new Array();
var  allJobsI;
var  allJobsM;

function readImportJobs(){
	$.ajax({
		  type: "GET",
		  mimeType: "application/json",
		  contentType: "application/json;charset=UTF-8",
		  dataType: "json",
		  url: "/api/v4/" + encodeURIComponent(customerID) + "/import/get_importjobs/",
		  success: function(json) {
			  var htmlToAppend ='';
			  if(json.length == 0){
				  htmlToAppend = '<div id="noTests" data-translate="item_import_no_jobs">you have no import jobs defined</div>';
			  }else{
				allJobsI = json;
				  for(var i = 0; i < json.length; i++) {
                      var obj = json[i];
                      var name = obj.name;
                      var interval = obj.interval;
                      var startdate = obj.startDate;
                      var lastRun = obj.lastRun;
                      if (!lastRun) {
                          lastRun = 'nope';
                      }
                      var enabled = obj.enabled;
                      var id = obj.id;
                      var runURL = 'img/clock.png';
                      var statusURL = 'img/red.png';
                      var margin = -48;
                      var off = 'active';
                      var on = '';
                      if (enabled) {
                          on = 'active';
                          off = '';
                          margin = 0;
                          statusURL = 'img/blue.png';
                          if (lastRun != 'nope') {
                              var diff = Math.abs(new Date() - new Date(lastRun));
                              var days = diff / (24 * 60 * 60 * 1000);
                              //console.log(diff + " " + days + " " + new Date(lastRun));
                              if (interval == 'DAILY' && days >= 1) {
                                  statusURL = 'img/yellow.png';
                              }
                              if (interval == 'WEEKLY' && days >= 7) {
                                  statusURL = 'img/yellow.png';
                              }
                          }
                      }
                      htmlToAppend += '<div class="tr test">\n';
                      htmlToAppend += ' <div class="tc name">' + name + '</div>';
                      htmlToAppend += ' <div class="tc interval">' + interval + '</div>';
                      htmlToAppend += ' <div class="tc startdate">' + startdate + '</div>';
                      htmlToAppend += ' <div class="tc lastimport">' + lastRun + '</div>';
                      htmlToAppend += ' <div class="tc showHistory"><a onclick="showImportHistory(' + obj.id + ')">Show History</a> </div>';

                      if (obj.fileFormat == "CSV") {
                          htmlToAppend += ' <div class="tc editimport"><a onclick="$(\'#itemimportF\').attr(\'src\', \'itempop.html?customer_id=' + encodeURIComponent(customerID) + '&importJobId=' + id + '\');$(\'#itemimportP\').show();">Edit</a> </div>';
                      } else {
                          htmlToAppend += ' <div class="tc editimport"></div>'
                      }

					    htmlToAppend +=' <div class="tc jobstatus"><img id="statusImage'+i+'" style="vertical-align: middle;" src="'+statusURL+'" /></div>';
					    htmlToAppend +=' <div class="tc jobstatus"><a onclick="runJobNow('+obj.id+');"><img style="vertical-align: middle;" src="'+runURL+'" /></a></div>';
					    htmlToAppend +=' <div class="tc jobon toggle-light">'
					    	+'<div class="toggle on" style="  margin: 0 auto; margin-bottom: -6px;  height: 22px;  width: 70px;">'
					    	+'<div class="toggle-slide" onclick="updateStatus('+i+');">'
						    	+'<div id="toggle-inner'+i+'" class="toggle-inner" style="width: 118px; margin-left: '+margin+'px;">'
						    		+'<div id="toggle-on'+i+'" class="toggle-on '+on+'" style="height: 22px; width: 59px; text-indent: -11px; line-height: 22px;">ON</div>'
						    		+'<div class="toggle-blob" style="height: 22px; width: 22px; margin-left: -11px;"></div>'
						    		+'<div id="toggle-off'+i+'" class="toggle-off '+off+'" style="height: 22px; width: 59px; margin-left: -11px; text-indent: 11px; line-height: 22px;">OFF</div>'
						    	 +'</div>'
						    +'</div></div></div>';
					    	
					    htmlToAppend +='</div>';
				  } 
				  htmlToAppend +='<div>';
			  }
			var header = $('#import_head').clone();
			$('#importJobsTable').empty(); 
			$('#importJobsTable').append(header);
          	$('#importJobsTable').append(htmlToAppend);
          	$('#importJobsTable').show();
          	
          	
          	
			  
		  },
		  error: mainErrorHandler
	  });
}

function readMailJobs(){
	$.ajax({
		  type: "GET",
		  mimeType: "application/json",
		  contentType: "application/json;charset=UTF-8",
		  dataType: "json",
		  url: "/api/v4/" + encodeURIComponent(customerID) + "/nl2go/pref/get_jobs/",
		  success: function(json) {
			  var htmlToAppend ='';
			  if(json.length == 0){
				  htmlToAppend = '<div id="noTests" data-translate="mail_no_jobs">you have no newsletters defined</div>';
			  }else{
				allJobsM = json;
				  for(var i = 0; i < json.length; i++) {
					    var obj = json[i];
					    var name = obj.scenario;
					    var nlid = obj.nlid;
					    var interval = obj.interval;
					    var startdate = obj.startDate;
					    var enabled = obj.enabled;
					    var runURL = 'img/clock.png';
					   
					    var margin = -48;
					    var off =  'active';
					    var on =  '';
					    if(enabled){
					    	on =  'active';
					    	off =  '';
					    	margin = 0;
					    	
					    }
					    htmlToAppend +='<div class="tr test">\n';
					    htmlToAppend +=' <div class="tc name">'+name+'</div>';
					    htmlToAppend +=' <div class="tc interval">'+interval+'</div>';
					  
	
					    
					    htmlToAppend +=' <div class="tc editimport"><a onclick="$(\'#mailF\').attr(\'src\', \'mailconfig.html?customer_id=' +  encodeURIComponent(customerID)+'&nlid='+nlid+'\');$(\'#mailP\').show();">Edit</a> </div>';
					    
					    htmlToAppend +=' <div class="tc jobstatus"><a onclick="sendMailNow('+nlid+');"><img style="vertical-align: middle;" src="'+runURL+'" /></a></div>';
					    htmlToAppend +=' <div class="tc jobon toggle-light">'
					    	+'<div class="toggle on" style="  margin: 0 auto; margin-bottom: -6px;  height: 22px;  width: 70px;">'
					    	+'<div class="toggle-slide" onclick="updateMailStatus('+i+');">'
						    	+'<div id="toggle-innerm'+i+'" class="toggle-inner" style="width: 118px; margin-left: '+margin+'px;">'
						    		+'<div id="toggle-onm'+i+'" class="toggle-on '+on+'" style="height: 22px; width: 59px; text-indent: -11px; line-height: 22px;">ON</div>'
						    		+'<div class="toggle-blob" style="height: 22px; width: 22px; margin-left: -11px;"></div>'
						    		+'<div id="toggle-offm'+i+'" class="toggle-off '+off+'" style="height: 22px; width: 59px; margin-left: -11px; text-indent: 11px; line-height: 22px;">OFF</div>'
						    	 +'</div>'
						    +'</div></div></div>';
					    	
					    htmlToAppend +='</div>';
				  } 
				  htmlToAppend +='<div>';
			  }
			var header = $('#mail_head').clone();
			$('#mailTable').empty(); 
			$('#mailTable').append(header);
          	$('#mailTable').append(htmlToAppend);
          	$('#mailTable').show();
          	
          	
          	
			  
		  },
		  error: mainErrorHandler
	  });
}

function sendMailNow(nlid){
	$.ajax({
		  type: "POST",
		  mimeType: "application/json",
		  contentType: "application/json;charset=UTF-8",
		  dataType: "json",
		  url: "/ebl/v3/" + encodeURIComponent(customerID) + "/modelbuild/trigger_mail/"+nlid,
		  success: function(json) {
			  showMailHistory(nlid);
		  },
		  error: mainErrorHandler
	  });
}

function updateMailStatus(activeId){
	var classList =$('#toggle-onm'+activeId).attr('class').split(/\s+/);
	var status = 1;
	var job = allJobsM[activeId];
	$.each( classList, function(index, item){
	    if (item === 'active') {
	    	status = 0;
	    }
	});

	if(status == 1){
		$('#toggle-innerm'+activeId).css('margin-left','0px');
		$('#toggle-onm'+activeId).addClass('active'); 
		$('#toggle-offm'+activeId).removeClass('active');
		job.enabled = true;
	}else{
		$('#toggle-innerm'+activeId).css('margin-left','-48px');
		$('#toggle-onm'+activeId).removeClass('active'); 
		$('#toggle-offm'+activeId).addClass('active'); 
		job.enabled = false;
	}
	 
	 
	 var urlsufix = '/nl2go/pref/updateJob';
	 $.ajax({
		  type: "POST",
		  mimeType: "application/json",
		  contentType: "application/json;charset=UTF-8",
		  dataType: "json",
		  data: JSON.stringify(job),
		  url: "/api/v4/" + encodeURIComponent(customerID) + urlsufix,
		  success: function(json) { 
		  },
		  error: function() {
			  stdAjaxErrorHandler();
		  }
	  });
}


function updateStatus(activeId){
	var classList =$('#toggle-on'+activeId).attr('class').split(/\s+/);
	var status = 1;
	var job = allJobsI[activeId];
	$.each( classList, function(index, item){
	    if (item === 'active') {
	    	status = 0;
	    }
	});
	var statusURL = 'img/blue.png';
	if(status == 1){
		$('#toggle-inner'+activeId).css('margin-left','0px');
		$('#toggle-on'+activeId).addClass('active'); 
		$('#toggle-off'+activeId).removeClass('active');
		var lastRun = job.lastRun;
		if(lastRun){
			var interval = job.interval;
			var diff = Math.abs( new Date() - new Date(lastRun) );
    		var days = diff/(24*60*60*1000);
    		if(interval == 'DAILY' && days >= 1){
    			statusURL = 'img/yellow.png';
    		}
    		if(interval == 'WEEKLY' && days >= 7){
    			statusURL = 'img/yellow.png';
    		}
		}
		job.enabled = true;
	}else{
		$('#toggle-inner'+activeId).css('margin-left','-48px');
		$('#toggle-on'+activeId).removeClass('active'); 
		$('#toggle-off'+activeId).addClass('active'); 
		statusURL = 'img/red.png';
		job.enabled = false;
	}
	 
	 
	 var urlsufix = '/import/save_importjob';
	 $.ajax({
		  type: "POST",
		  mimeType: "application/json",
		  contentType: "application/json;charset=UTF-8",
		  dataType: "json",
		  data: JSON.stringify(job),
		  url: "/api/v4/" + encodeURIComponent(customerID) + urlsufix,
		  success: function(json) {
			  $('#statusImage'+activeId).attr("src",statusURL);
		  },
		  error: function() {
			  stdAjaxErrorHandler();
		  }
	  });
}

function runJobNow(jobId) {
	$.ajax({
		  type: "POST",
		  mimeType: "application/json",
		  contentType: "application/json;charset=UTF-8",
		  dataType: "json",
		  url: "/api/v4/" + encodeURIComponent(customerID) + "/import/start_importjob/"+jobId,
		  success: function(json) {
			  showImportHistory(jobId);
		  },
		  error: mainErrorHandler
	  });
}

function showImportHistory(jobId) {
	$.ajax({
		  type: "GET",
		  mimeType: "application/json",
		  contentType: "application/json;charset=UTF-8",
		  dataType: "json",
		  url: "/api/v4/" + encodeURIComponent(customerID) + "/import/get_importjob_history/"+jobId,
		  success: function(json) {
			  var htmlToAppend ='';
			  if(json.length == 0){
				  htmlToAppend = '<div id="noTests" data-translate="item_import_no_history">no import history for this job found</div>';
			  }else{
				
				  for(var i = 0; i < json.length; i++) {
					    var obj = json[i];
					    var startTime = obj.runtime;
					    var finishTime = obj.finishtime;
					    var amount = obj.amount;

					    if(!finishTime){
					    	finishTime = 'still running';
					    }
					   
					    htmlToAppend +='<div class="tr test">\n';
					    htmlToAppend +=' <div class="tc startTime">'+startTime+'</div>';
					    htmlToAppend +=' <div class="tc finishTime">'+finishTime+'</div>';
					    htmlToAppend +=' <div class="tc amount">'+amount+'</div>';
					    htmlToAppend +=
							' <div class="tc log" id="logFiles'+i+'">' +
							'<a target="_blank" href="/api/v4/' + encodeURIComponent(customerID) + '/import/get_log/' + jobId + '/'+ obj.id +'">show log </a>' +
							'</div>';
					    htmlToAppend +='</div>';
				  } 
				  htmlToAppend +='<div>';
			  }
			var header = $('#import_history_head').clone();
			$('#importJobsHistoryTable').empty(); 
			$('#importJobsHistoryTable').append(header);
        	$('#importJobsHistoryTable').append(htmlToAppend);
        	$('#itemimportHistoryP').show();
			  
		  },
		  error: mainErrorHandler
	  });
}


function showMailHistory(nlid) {
	$.ajax({
		  type: "GET",
		  mimeType: "application/json",
		  contentType: "application/json;charset=UTF-8",
		  dataType: "json",
		  url: "/api/v4/" + encodeURIComponent(customerID) + "/nl2go/pref/getMailHistory?nlid="+nlid,
		  success: function(json) {
			  var htmlToAppend ='';
			  if(json.length == 0){
				  htmlToAppend = '<div id="noTests" data-translate="mail_no_history">no mail history for this job found</div>';
			  }else{
				
				  for(var i = 0; i < json.length; i++) {
					    var obj = json[i];
					    var finishTime = obj.lastSend;
					    var amount = obj.amount;
					   
	
					    if(!finishTime){
					    	finishTime = 'nope';
					    }
					   
					    htmlToAppend +='<div class="tr test">\n';
					    htmlToAppend +=' <div class="tc finishTime">'+finishTime+'</div>';
					    htmlToAppend +=' <div class="tc amount">'+amount+'</div>';
					    htmlToAppend +='</div>';
				  } 
				  htmlToAppend +='<div>';
			  }
			var header = $('#mail_history_head').clone();
			$('#mailJobsHistoryTable').empty(); 
			$('#mailJobsHistoryTable').append(header);
        	$('#mailJobsHistoryTable').append(htmlToAppend);
        	$('#mailHistoryP').show();
			  
		  },
		  error: mainErrorHandler
	  });
}


function showSpecificLog(urlLog){
	
	 $.get(urlLog, function( data ) {
		 var find = '\n';
		 var re = new RegExp(find, 'g');
         $('#importJobsHistoryLogTable').html(data.replace(re,"<br/>")) ;
         $('#itemimportHistoryLogP').show();
 });
}

function renderScenarioList() {
    
    var json = {"scenarioInfoList" : scenarioInfoList};
    
    if (json.scenarioInfoList.length < 1) {
        console.log("no scenarios");
    } else {

        var options = [];

        for (var j = 0; j < json.scenarioInfoList.length; j++) {
            //set the options in the select boxes
            var scenario = json.scenarioInfoList[j];

            //the dummy is a emtpy scenario that will be copied and added for all given scenarios from the server
            //it will be filled with the data from the server
            var dummy = $('.available_scenarios').children('li').first();
            var dummyClone = $(dummy).clone();
            $(dummyClone).show();
			var escapedRefCode = escape(scenario.referenceCode);
			
			var scenarioDiv = $(dummyClone).children("div");
			scenarioDiv.attr("id", "scenario_" + j);

            if (scenario.title == null || $.trim(scenario.title) == "") {
                scenario.title = scenario.referenceCode;
            }
            if (scenario.description == null) {
                scenario.description = "Some brief description of the scenario, that can be edited together with other parameters";
            }
            
            var option = $('<option></option>');
            option.text(scenario.title);
            option.attr("value", scenario.referenceCode);
            options.push(option);
            
			scenarioDiv.children("h4").children("span").text(scenario.title);
			scenarioDiv.children("p.description").text(scenario.description);
			
			scenarioDiv.find("h4 a").attr('data-refcode', escapedRefCode);

            scenarioDiv.find("h4 a").click(function() {
            	openScenarioDialog(customerID, $(this).attr('data-refcode'));
            });
                
            var derecos = sumDeliveredRecommendations(scenario);

            scenarioDiv.children("p.data").children("span").children("strong").text(formatInteger(derecos));

            //set the radio buttons initialy
            scenarioDiv.removeClass("problem").removeClass("ready_to_use").removeClass("partly_available");

            if (scenario.avaliable === "NOT_AVAILABLE") {
            	scenarioDiv.addClass("problem");
            } else if (scenario.avaliable === "AVAILABLE") {
            	scenarioDiv.addClass("ready_to_use");
            } else if (scenario.avaliable === "PARTLY_AVAILABLE") {
            	scenarioDiv.addClass("partly_available");
            }
            if(j == 0){
            	$('.available_scenarios').empty();
            	$('.available_scenarios').append(dummy);
            }
          
            $('.available_scenarios').append(dummyClone);
            
        }
		//removes all elements from the select except the first one
		function removeOptions(index){
			if (index>1){
				$(this).remove();
			}
		}
		
		$('.delivered_recommendation_chart li').each(function() {
			  var htmlSelect = $(this).find('select');
			  
			  htmlSelect.find('option[value!=""][value!="total"]').remove();
		
			  for (var i in  options) {
				  htmlSelect.append(options[i].clone());
			  }
	    });
		
        //Fill the select boxes at the bottom of the middle chart
        $('#select_for_delivered_recommendations_chart_bar_1').find('option[value="total"]').siblings().removeAttr('selected')
				.end().attr('selected', 'selected'); //select the total scenario

        $(".available_scenarios").siblings('.loading').remove().end().equalize({
            eqItems: "> li:visible",
            segmentSize: 5,
            applicantSelector: "> *"
        });
    }
}


function openScenarioDialog(mandatorId, referenceCode) {
	
	var additionalParameter = "?reference_code=" + encodeURIComponent(referenceCode) + "&customer_id=" + encodeURIComponent(mandatorId);
	
	$('#settingsF').attr('src', 'settingspop.html' + additionalParameter); 
	$('#settingsP').show();
}


function sumDeliveredRecommendations(scenario) {
	var result = 0;
	for (var i in scenario.statisticItems) {
		result += scenario.statisticItems[i].deliveredRecommendations;
	}
	return result;
}


function renderConversionRate() {
	 
	if (statistic.length < 1) {
		//To prevent old data in the graphs the use the "zero" object
		showEmptyCharts();
		showEmptyEventChart();
		console.log("no items available");
	} else {
		var conversionRateObject = {};
		conversionRateObject.relative = [];
		conversionRateObject.revenue = [];
		conversionRateObject.relativeRecs = [];
		conversionRateObject.relativeCb = [];
		conversionRateObject.relativePr = [];
		var convRateValMax = 0;
		var convRateRecsValMax = 0;
		var convRateCbValMax = 0;
		
		for(var i = 0; i < statistic.length; i++){
			var convRate = 0.0;
			var convRateRecs = 0.0;
			var convRateCb = 0.0;
			if(parseFloat(statistic[i].recommendationCalls) != 0){
				convRate = parseFloat(statistic[i].clickedRecommended) / parseFloat(statistic[i].recommendationCalls);
			}
			if(parseFloat(statistic[i].clickedRecommended) != 0){
				convRateRecs = parseFloat(valueOrDefault(statistic[i].purchasedRecommended)) / parseFloat(statistic[i].clickedRecommended);
			}
			if(parseFloat(statistic[i].clickEvents) != 0){
				convRateCb = parseFloat(valueOrDefault(statistic[i].purchaseEvents)) / parseFloat(statistic[i].clickEvents);
			}
			
			var convRateVal = isNaN(convRate) ? 0.0 : convRate * 100;
			conversionRateObject.relative.push(convRateVal);
			if(convRateVal > convRateValMax){
				convRateValMax = convRateVal;
			}
			
			var convRateRecsVal = isNaN(convRateRecs) ? 0.0 : convRateRecs * 100; 
			conversionRateObject.relativeRecs.push(convRateRecsVal);
			if(convRateRecsVal > convRateRecsValMax){
				convRateRecsValMax = convRateRecsVal;
			}
			
			var convRateCbVal = isNaN(convRateCb) ? 0.0 : convRateCb * 100;
			conversionRateObject.relativeCb.push(convRateCbVal);
			if(convRateCbVal > convRateCbValMax){
				convRateCbValMax = convRateCbVal;
			}
			
			conversionRateObject.relativePr.push(valueOrDefault(statistic[i].purchasedRecommended));
			conversionRateObject.revenue.push(valueOrDefault(statistic[i].revenue));
		}
		if ($("#conversion_units").val() == 'relative') {
			var precision = 0;
			if(convRateValMax<5){
				precision = 2;
			}else if(convRateValMax<10){
				precision = 1;
			}
			$(".conversion_rate_chart h3").attr('data-translate', "index_conversion_rate_relative");
			
			updateRightCharts(getGraphDescription(), conversionRateObject.relative, percentFormatter, precision);	
		} else if ($("#conversion_units").val() == 'relativerecs') {
			var precision = 0;
			if(convRateRecsValMax<5){
				precision = 2;
			}else if(convRateRecsValMax<10){
				precision = 1;
			}
			$(".conversion_rate_chart h3").attr('data-translate', "index_conversion_rate_relative_rate");
			
			updateRightCharts(getGraphDescription(), conversionRateObject.relativeRecs, percentFormatter, precision);	
		} else if ($("#conversion_units").val() == 'relativecb') {
			var precision = 0;
			if(convRateCbValMax<5){
				precision = 2;
			}else if(convRateCbValMax<10){
				precision = 1;
			}
			$(".conversion_rate_chart h3").attr('data-translate', "index_conversion_rate_relative_cb");
			
			updateRightCharts(getGraphDescription(), conversionRateObject.relativeCb, percentFormatter, precision);	
		} else if ($("#conversion_units").val() == 'relativepr') {
			
			$(".conversion_rate_chart h3").attr('data-translate', "index_conversion_rate_relative_pr");
			
			updateRightCharts(getGraphDescription(), conversionRateObject.relativePr, currencyFormatter, 0);	
		} else {
			var currencyCode = mandatorDao.mandator.advancedOptions.currency;
			var param = $(".conversion_rate_chart span[data-param='0']");
			param.text(currencyCode);
			i18n(param);
			
			$(".conversion_rate_chart h3").attr('data-translate', "index_conversion_rate_revenue");
			
			updateRightCharts(getGraphDescription(), conversionRateObject.revenue, currencyFormatter, 0);
		}
		i18n($(".conversion_rate_chart"));
	}
}


function getInnerArrayForRenderCollectedEventsWeek(item1,item2) {
	/*
		Mapping GUI to event types
		Click - clickEvents
		Purchase -purchaseEvents
		Consume - consumeEvents
		Recommended - clickedRecommended
		Rendered - renderedEvents
		Rate RateEvents
		Blacklist - blacklistEvents
		Owns OwnsEvents
		Total
		
		var quotient = 24; */
	    var innerArray = new Array();
	    $('select[id^="events_select_for_chart_bar"]').each(function (index) {
			var value = $(this).val();
	        switch (value) {
	        case "click":
	            innerArray.push((item1.clickEvents+item2.clickEvents) );
	            break;
	        case "consume":
	            innerArray.push((item1.consumeEvents+item2.consumeEvents));
	            break;
	        case "purchase":
	            innerArray.push((item1.purchaseEvents+item2.purchaseEvents));
	            break;
	        case "recommended":
	            innerArray.push((item1.clickedRecommended+item2.clickedRecommended));
	            break;
	        case "rendered":
	            innerArray.push((item1.renderedEvents+item2.renderedEvents));
	            break;
	        case "rate":
	            innerArray.push((item1.rateEvents+item2.rateEvents));
	            break;
	        case "blacklist":
	            innerArray.push((item1.blacklistEvents+item2.blacklistEvents));
	            break;
	        case "basket":
	            innerArray.push((item1.ownsEvents+item2.basketEvents));
	            break;
	        case "total":
	            var sum = getTotalSum(item1.clickEvents,item1.consumeEvents,item1.purchaseEvents,item1.clickedRecommended,item1.rateEvents,item1.blacklistEvents,item1.basketEvents)+
	            getTotalSum(item2.clickEvents,item2.consumeEvents,item2.purchaseEvents,item2.clickedRecommended,item2.rateEvents,item2.blacklistEvents,item2.basketEvents);
	             //render removed from the sum
	            innerArray.push(sum);
	            break;
	        default:
	            innerArray.push(0);
	            break;
	    	
	        }
	    });
	    return innerArray;
	}
	
function valueOrDefault(val) {
    return val == undefined ? 0 : val;
}

function getTotalSum(click1,consume1,purchase1,clickedRecommended1,rate1,blacklist1,basket1 ){
	var sum = valueOrDefault(click1)+valueOrDefault(consume1)+valueOrDefault(purchase1)+
				valueOrDefault(clickedRecommended1)+valueOrDefault(rate1)+valueOrDefault(blacklist1)+valueOrDefault(basket1);
	return sum;
}

function getInnerArrayForRenderCollectedEvents(item, daterange) {

/*
	Mapping GUI to event types
	Click - clickEvents
	Purchase -purchaseEvents
	Consume - consumeEvents
	Recommended - clickedRecommended
	Rendered - renderedEvents
	Rate RateEvents
	Blacklist - blacklistEvents
	Owns OwnsEvents
	Total

*/
    var innerArray = new Array();
    $('select[id^="events_select_for_chart_bar"]').each(function (index) {

        var value = $(this).val();
        switch (value) {
        case "click":
            innerArray.push(Math.round(item.clickEvents ));
            break;
        case "consume":
            innerArray.push(Math.round(item.consumeEvents));
            break;
        case "purchase":
            innerArray.push(Math.round(item.purchaseEvents));
            break;
        case "recommended":
            innerArray.push(Math.round(item.clickedRecommended));
            break;
        case "rendered":
            innerArray.push(Math.round(item.renderedEvents));
            break;
        case "rate":
            innerArray.push(Math.round(item.rateEvents));
            break;
        case "blacklist":
            innerArray.push(Math.round(item.blacklistEvents));
            break;
        case "basket":
            innerArray.push(Math.round(item.basketEvents));
            break;
        case "total":
        	var sum = getTotalSum(item.clickEvents,item.consumeEvents,item.purchaseEvents,item.clickedRecommended,item.rateEvents,item.blacklistEvents,item.basketEvents);
            //var sum = item.clickEvents + item.consumeEvents + item.purchaseEvents + item.clickedRecommended + item.rateEvents + item.blacklistEvents + item.ownsEvents; //render removed from the sum
            innerArray.push(sum);
            break;
        default:
            innerArray.push(0);
            break;
        }
    });
    return innerArray;
}


function renderRecommendationChart() {
	
	var daterange = period;

    //There must be a two dimension array to show the data in the bar graphic
    //e.g.: [[x,y,z],[x1,y1,z1]]
    //There will be created an inner and outer array and pushed the data inside.
    var outerArray = new Array();
    
    if (daterange == "DAY" || daterange == "24H") {
		var tmpDate = daterange == "DAY" ? getCurrentDateMinusDays(1) : new Date(Date.now()-24*3600*1000);
		var testDate;
        for (var i = 0; i < 24; i++) {
			testDate = getDateTimeValue(tmpDate.getFullYear(), tmpDate.getMonth() +1, tmpDate.getDate(), tmpDate.getHours(), 0, 0, false);
            var innerArray = new Array();
            $('select[id^="select_for_delivered_recommendations_chart_bar"]').each(function (index) {
				var addZeroOutter = true;
				var value = $(this).val();
                var totalDeliveredRecommendations = 0;

                for (var j = 0; j < scenarioInfoList.length; j++) {

                    var scenario = scenarioInfoList[j];
                    if (scenario.referenceCode == value || value == "total") {
                        //the selected scenario was found in the json object
                        for (var k = 0; k < scenario.statisticItems.length; k++) {
                            var item = scenario.statisticItems[k];
                            if (item.timespanBegin == testDate) {
                                if (value == "total") {
                                    totalDeliveredRecommendations = totalDeliveredRecommendations + scenario.statisticItems[k].scenarioCalls;
                                } else {
                                    innerArray.push(scenario.statisticItems[k].scenarioCalls);
                                    addZeroOutter = false;
                                }
                            }
                        }
                    }
                }

                if (value == "total") {
                    innerArray.push(totalDeliveredRecommendations);
                    addZeroOutter = false;
                }
                if (addZeroOutter) {
                    innerArray.push(0);
                }
            });

            outerArray.push(innerArray);
			tmpDate.setHours(tmpDate.getHours()+1);
		}
        
    } else if (daterange == "WEEK") {
        for (var i = 7; i > 0; i--) {
            var date = getCurrentDateMinusDays(i);
            var testDate = "";

            testDate = getDateTimeValue(date.year, date.month, date.day, 0, 0, 0, false);

            var innerArray = new Array();
            
            $('select[id^="select_for_delivered_recommendations_chart_bar"]').each(function (index) {
            	var addZeroOutter = true;
                var value = $(this).val();
                var totalDeliveredRecommendations = 0;

                for (var j = 0; j < scenarioInfoList.length; j++) {

                    var scenario = scenarioInfoList[j];
                    if (scenario.referenceCode == value || value == "total") {
                        //the selected scenario was found in the json object
                        for (var k = 0; k < scenario.statisticItems.length; k++) {
                            var item = scenario.statisticItems[k];
                            if (getDateTimeValueFromValue(item.timespanBegin,false) == testDate) {
                                if (value == "total") {
                                    totalDeliveredRecommendations = totalDeliveredRecommendations + scenario.statisticItems[k].scenarioCalls;
                                } else {
                                    innerArray.push(scenario.statisticItems[k].scenarioCalls );
                                    addZeroOutter = false;
                                }
                            }
                        }
                    }
                }

                if (value == "total") {
                    innerArray.push(totalDeliveredRecommendations);
                    addZeroOutter = false;
                }
                if (addZeroOutter) {
                    innerArray.push(0);
                }
            });

            outerArray.push(innerArray);
        }

    } else if (daterange == "MONTH") {
        for (var i = 30; i > 0; i--) {
            var date = getCurrentDateMinusDays(i);
            var testDate = getDateTimeValue(date.year, date.month, date.day, 0, 0, 0, false);
            var innerArray = new Array();
            $('select[id^="select_for_delivered_recommendations_chart_bar"]').each(function (index) {
            	var addZeroOutter = true;
                var value = $(this).val();
                var totalDeliveredRecommendations = 0;

                for (var j = 0; j < scenarioInfoList.length; j++) {

                    var scenario = scenarioInfoList[j];
                    if (scenario.referenceCode == value || value == "total") {
                        //the selected scenario was found in the json object
                        for (var k = 0; k < scenario.statisticItems.length; k++) {
                            var item = scenario.statisticItems[k];
                            if (item.timespanBegin == testDate) {
                                if (value == "total") {
                                    totalDeliveredRecommendations = totalDeliveredRecommendations + scenario.statisticItems[k].scenarioCalls ;
                                } else {
                                    innerArray.push(scenario.statisticItems[k].scenarioCalls);
                                    addZeroOutter = false;
                                }
                            }
                        }
                    }
                }

                if (value == "total") {
                    innerArray.push(totalDeliveredRecommendations);
                    addZeroOutter = false;
                }
                if (addZeroOutter) {
                    innerArray.push(0);
                }
            });

            outerArray.push(innerArray);
        }
    }
    
    updateMiddleChart(getGraphDescription(), outerArray);
}


function renderCollectedEvents() {

    //There must be a two dimension array to show the data in the bar graphic
    //e.g.: [[x,y,z],[x1,y1,z1]]
    //There will be created an inner and outer array and pushed the data inside.
   var outerArray = [];

   if (period == "WEEK") {
			
		for(var i = 0; i < statistic.length;){
			outerArray.push(getInnerArrayForRenderCollectedEventsWeek(statistic[i++], statistic[i++]));
		}
        updateLeftChart(getGraphDescription(), outerArray);

    } else {

		for(var j = 0; j < statistic.length; j++){
			outerArray.push(getInnerArrayForRenderCollectedEvents(statistic[j], period));
		}
        updateLeftChart(getGraphDescription(), outerArray);
    }
}


//Helper method that generates the X-Chart description for a month call
function getGraphDescription() {
	
	var resultDates = [];
	
	if (period == 'MONTH') {
	
	    for (var i = 30; i > 0; i = i - 1) {
	        if (i % 5 === 0) {
	            var date = getCurrentDateMinusDays(i);
	            resultDates.push(date.day + "." + date.month + ".");
	        } else {
	            resultDates.push("");
	        }
	    }
	    return resultDates;
	
	} else if (period == 'WEEK') {
	
	    for (var i = 7; i > 0; i = i - 1) {
	        var date = getCurrentDateMinusDays(i);
	        resultDates.push(date.day + "." + date.month + ".");
	    }
	    return resultDates;
	
	} else if (period == 'DAY') {
	
	    for (var i = 0; i < 25; i++) {
	        if (i % 4 !== 0) {
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
	} else { // 24H

		var tempDate = new Date(Date.now() - 24 * 3600 * 1000),
			legend = [tempDate.getHours() + ':00'],
			i = 1;
		for (; i < 25; i++) {
			tempDate.setHours(tempDate.getHours()+1);
			legend[i]= !(i%4) ? (tempDate.getHours() < 10 ? '0': '') + tempDate.getHours() + ':00' : '';
		}
		return legend;
	}
}
	

function myFormatter(obj, num) {
  if (num > 1000){
    num = (num/1000) + 'K';
  }
    return String(num);
}

function myFormatter2(obj, num)
{
	console.log(num);
  if (num > 1000){
    num = (num/1000) + 'K';
  }else if(num < 1 || (num+"") == "1.0"){
    num = (num*100) + '%';
  }
    return String(num);
}


function percentFormatter(obj, num){
	return num + '%';
}


function currencyFormatter(obj, num){
	return num;
}


function convertDataArray(dataArray){
    var conArray = [],
		i,
		j;
    for( i = 0;i<dataArray.length;i++){
            var currentApoint = dataArray[i];
            for( j = 0;j<currentApoint.length;j++){
                    if(conArray.length<(j+1)){
                            conArray[j] = new Array();
                    }
                    conArray[j][i] = currentApoint[j];

            }
    }
    for( i=0;i<conArray.length;i++){
            var curlineArray = conArray[i];
            var isZeroLine = true;
            for( j = 0;j<curlineArray.length;j++){
                    if(curlineArray[j] != 0){
                            isZeroLine = false;
                    }
            }
            if(isZeroLine){
                    conArray[i] = [0];
            }
    }

    return conArray;
}


function showEmptyCharts() {
    RGraph.Clear(document.getElementById("conversion_rate"));

    var rightLine = new RGraph.Line('conversion_rate', [0]);
    rightLine.Set('chart.labels', [' ']);
    rightLine.Set('chart.background.barcolor1', 'transparent');
    rightLine.Set('chart.background.barcolor2', 'transparent');
    rightLine.Set('chart.background.grid', true);
    rightLine.Set('chart.linewidth', 3);
    rightLine.Set('chart.gutter.left', 40);
    rightLine.Set('chart.scale.formatter', myFormatter2);
    rightLine.Set('chart.hmargin', 5);
    rightLine.Set('chart.background.grid.autofit.align', true);
    rightLine.Set('chart.background.grid.color', 'rgba(217, 226, 216, 1)');
    rightLine.Set('chart.colors', ['rgba(81, 142, 19, 1)']);
    rightLine.Set('chart.text.font', ['Istok Web, sans-serif']);
    rightLine.Set('chart.text.color', 'rgba(140, 150, 138, 1)');
    rightLine.Set('chart.text.size', '8');
    rightLine.Draw();

}

function showEmptyEventChart() {
    RGraph.Clear(document.getElementById('collected_events'));
    var leftbar = new RGraph.Bar('collected_events', [
        []
    ]);
    leftbar.Set('chart.background.barcolor1', 'transparent');
    leftbar.Set('chart.background.barcolor2', 'transparent');
    leftbar.Set('chart.labels', ' ');
    leftbar.Set('chart.key.position', 'gutter');
    leftbar.Set('chart.grouping', 'stacked');
    leftbar.Set('chart.key.background', 'transparent');
    leftbar.Set('chart.colors', ['rgba(255, 167, 57, 0.9)', 'rgba(98, 184, 188, 0.9)', 'rgba(204, 199, 158, 0.9)']);
    leftbar.Set('chart.shadow', false);
    leftbar.Set('chart.yaxispos', 'left');
    leftbar.Set('chart.strokestyle', 'rgba(0,0,0,0)');
    leftbar.Set('chart.gutter.left', 40);
    leftbar.Set('chart.scale.formatter', myFormatter);
    leftbar.Set('chart.text.font', ['Istok Web, sans-serif']);
    leftbar.Set('chart.text.color', 'rgba(140, 150, 138, 1)');
    leftbar.Set('chart.text.size', '8');
    leftbar.Draw();
}

function showEmptyRecommendationChart() {
    RGraph.Clear(document.getElementById('delivered_recommendations'));
    var middlebar = new RGraph.Bar('delivered_recommendations', [
        []
    ]);
    middlebar.Set('chart.background.barcolor1', 'transparent');
    middlebar.Set('chart.background.barcolor2', 'transparent');
    middlebar.Set('chart.labels', ' ');
    middlebar.Set('chart.key.position', 'gutter');
    middlebar.Set('chart.grouping', 'stacked');
    middlebar.Set('chart.key.background', 'transparent');
    middlebar.Set('chart.colors', ['rgba(255, 167, 57, 0.9)', 'rgba(98, 184, 188, 0.9)', 'rgba(204, 199, 158, 0.9)']);
    middlebar.Set('chart.shadow', false);
    middlebar.Set('chart.yaxispos', 'left');
    middlebar.Set('chart.strokestyle', 'rgba(0,0,0,0)');
    middlebar.Set('chart.gutter.left', 40);
    middlebar.Set('chart.scale.formatter', myFormatter);
    middlebar.Set('chart.text.font', ['Istok Web, sans-serif']);
    middlebar.Set('chart.text.color', 'rgba(140, 150, 138, 1)');
    middlebar.Set('chart.text.size', '8');
    middlebar.Draw();
}

function updateRightCharts(labels, conversionValues, formatter,precision) {
//	console.log('updating convRate chart');
//	console.log(conversionValues);
    RGraph.Clear(document.getElementById("conversion_rate"));

    rightLine = new RGraph.Line('conversion_rate', conversionValues);
    rightLine.Set('chart.labels', labels);
    rightLine.Set('chart.background.barcolor1', 'transparent');
    rightLine.Set('chart.background.barcolor2', 'transparent');
    rightLine.Set('chart.background.grid', true);
    rightLine.Set('chart.linewidth', 3);
    rightLine.Set('chart.gutter.left', 40);
    rightLine.Set('chart.scale.formatter', formatter);
    rightLine.Set('chart.scale.decimals', precision);
    rightLine.Set('chart.hmargin', 5);
    rightLine.Set('chart.background.grid.autofit.align', true);
    rightLine.Set('chart.background.grid.color', 'rgba(217, 226, 216, 1)');
    rightLine.Set('chart.colors', ['rgba(81, 142, 19, 1)']);
    rightLine.Set('chart.text.font', ['Istok Web, sans-serif']);
    rightLine.Set('chart.text.color', 'rgba(140, 150, 138, 1)');
    rightLine.Set('chart.text.size', '8');
    rightLine.Draw();
}

function updateMiddleChart(labels, dataArray) {
    RGraph.Clear(document.getElementById('delivered_recommendations'));
    middlebar = new RGraph.Line('delivered_recommendations', convertDataArray(dataArray));
    middlebar.Set('chart.labels', labels);
    middlebar.Set('chart.background.barcolor1', 'transparent');
    middlebar.Set('chart.background.barcolor2', 'transparent');
    middlebar.Set('chart.background.grid', true);
    middlebar.Set('chart.linewidth', 3);
    middlebar.Set('chart.gutter.left', 40);
    middlebar.Set('chart.scale.formatter', myFormatter);
    middlebar.Set('chart.hmargin', 5);
    middlebar.Set('chart.background.grid.autofit.align', true);
    middlebar.Set('chart.background.grid.color', 'rgba(217, 226, 216, 1)');
    middlebar.Set('chart.colors', ['rgba(81, 142, 19, 1)', 'rgba(155, 93, 184, 1)', 'rgba(18, 154, 253, 1)']);
    middlebar.Set('chart.text.font', ['Istok Web, sans-serif']);
    middlebar.Set('chart.text.color', 'rgba(140, 150, 138, 1)');
    middlebar.Set('chart.text.size', '8');
    middlebar.Draw();
}

function updateLeftChart(labels, dataArray) {

    RGraph.Clear(document.getElementById('collected_events'));
    leftbar = new RGraph.Line('collected_events', convertDataArray(dataArray));
    leftbar.Set('chart.labels', labels);
    leftbar.Set('chart.background.barcolor1', 'transparent');
    leftbar.Set('chart.background.barcolor2', 'transparent');
    leftbar.Set('chart.background.grid', true);
    leftbar.Set('chart.linewidth', 3);
	leftbar.Set('chart.gutter.left', 40);
    leftbar.Set('chart.scale.formatter', myFormatter);
    leftbar.Set('chart.hmargin', 5);
    leftbar.Set('chart.background.grid.autofit.align', true);
    leftbar.Set('chart.background.grid.color', 'rgba(217, 226, 216, 1)');
    leftbar.Set('chart.colors', ['rgba(255, 167, 57, 0.9)', 'rgba(98, 184, 188, 0.9)', 'rgba(204, 199, 158, 0.9)']);
    leftbar.Set('chart.text.font', ['Istok Web, sans-serif']);
    leftbar.Set('chart.text.color', 'rgba(140, 150, 138, 1)');
    leftbar.Set('chart.text.size', '8');
    leftbar.Draw();

}


function mainErrorHandler(jqXHR, textStatus, errorThrown) {
    if(jqXHR.status != null && jqXHR.status == 403) {
    	magicMessage("problem", "error_server_error_403");
	} else if(jqXHR.status != null && jqXHR.status == 401) {
		window.location = "/login.html";
	} else if(jqXHR.status != null && jqXHR.status == 400) {
		magicMessage("problem", "error_server_error_400");
	} else if(jqXHR.status != null && jqXHR.status == 404) {
		magicMessage("problem", "error_server_error_404");
	} else if(jqXHR.status != null && jqXHR.status == 409) {
		magicMessage("problem", "error_server_error_409");
	} else {
		magicMessage("problem", "error_server_error");
	}
}

