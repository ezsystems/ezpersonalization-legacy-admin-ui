
var open_reference_code = gupDecoded('reference_code');

var customerID; // <-- user "mandatorDao.mandator.baseInformation.id" instead

var scenarioInfoList; // loaded by ajaxScenarioList()

var statistic;

var period;

var mandatorList;


$(document).ready(function() {

    //set drop down field to default values: click, purchase, consume
    $('#events_select_for_chart_bar_1').val('click');
    $('#events_select_for_chart_bar_2').val('purchase');
    $('#events_select_for_chart_bar_3').val('recommended');

	showEmptyCharts();
	showEmptyEventChart();
	
	setLoadingDiv($('section.mandant > header'));
	
	include(["/js/switch_mandator.js", "/js/user.js", "/js/dao/mandator.js"], function() {
		
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
					showNoAvailableMandatorPopup();
					return;
				}
				
				$.when(
					  mandatorDao.init(customerID),
					  ajaxScenarioList('24H')
			    ).always(function() {
			    	unsetLoadingDiv($('section.mandant > header'));
			    	initialize();
			    });		
			}
		});		
	});
});




var ajaxScenarioList = function(new_period, callback) {
	
	if (!customerID) {
		return;
	}
	
	setLoadingDiv($('#statistic_charts'));
	setLoadingDiv($('.available_scenarios'));
	
	period = new_period;
	
	var from_date_time, to_date_time, granularity;
	
	if (period == 'WEEK') {
	    //calculate the from_date_time and to_date_time
	    var currentDate = getCurrentDateMinusDays(7);
	    from_date_time = getDateTimeValue(currentDate.year, currentDate.month, currentDate.day, 0, 0, 0, false);
	    currentDate = getCurrentDateMinusDays(0);
	    to_date_time = getDateTimeValue(currentDate.year, currentDate.month, currentDate.day, 0, 0, 0, false);
	    granularity = "PT12H";
	    
	} else if (period == 'MONTH') {
        var currentDate = getCurrentDateMinusDays(30);
        from_date_time = getDateTimeValue(currentDate.year, currentDate.month, currentDate.day, 0, 0, 0, false);
        currentDate = getCurrentDateMinusDays(0);
        to_date_time = getDateTimeValue(currentDate.year, currentDate.month, currentDate.day, 0, 0, 0, false);
        granularity = "P1D";
        
	} else if (period == 'DAY') {
	    var yesterday = getCurrentDateMinusDays(1);
	    from_date_time = getDateTimeValue(yesterday.getFullYear(), yesterday.getMonth() +1, yesterday.getDate(), yesterday.getHours(), 0, 0, false);
	    var currentDate = getCurrentDateMinusDays(0);
	    to_date_time = getDateTimeValue(currentDate.getFullYear(), currentDate.getMonth() +1, currentDate.getDate(), currentDate.getHours(), 0, 0, false);
	    granularity = "PT1H";
	    
	} else { // 24H
	    var yesterday = new Date(Date.now() - 24*3600000);
	    from_date_time = getDateTimeValue(yesterday.getFullYear(), yesterday.getMonth() +1, yesterday.getDate(), yesterday.getHours(), 0, 0, false);
	    var currentDate = new Date();
	    to_date_time = getDateTimeValue(currentDate.getFullYear(), currentDate.getMonth() +1, currentDate.getDate(), currentDate.getHours(), 0, 0, false);
	    granularity = "PT1H";
	}
	
	var result1 = $.ajax({
        dataType: "json",
        url: "/api/v4/" + encodeURIComponent(customerID) + "/statistic/summary/REVENUE,RECOS,EVENTS?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time + "&granularity=" + granularity + "&no-realm",
		success: function (data) {
			statistic = data;
        },
        error: mainErrorHandler
    });
	
	var result2 = $.ajax({
	    dataType: "json",
	    url: "/api/v3/" + encodeURIComponent(customerID) + "/structure/get_scenario_list?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time + "&granularity=" + granularity + "&no-realm",
	    success: function (json) {
	    	scenarioInfoList = json.scenarioInfoList;
	    },
	    error: mainErrorHandler
	});
	
	return $.when(result1, result2).done(function() {
		
		$('.export').attr('href', "/api/v3/" + encodeURIComponent(customerID) + "/revenue/statistic.xlsx?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time + "&granularity=" + granularity + "&no-realm");
		
		if (period == 'WEEK') {
			$('#index_conversion_rate_average').attr('data-translate', 'index_conversion_rate_average_week');
			$('#index_delivered_recommendations').attr('data-translate', 'index_delivered_recommendations_week');
			$('#index_collected_events').attr('data-translate', 'index_collected_events_week');
		    
		} else if (period == 'MONTH') {
			$('#index_conversion_rate_average').attr('data-translate', 'index_conversion_rate_average_month');
			$('#index_delivered_recommendations').attr('data-translate', 'index_delivered_recommendations_month');
			$('#index_collected_events').attr('data-translate', 'index_collected_events_month');
	        
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
	 _paq.push(["trackPageView"]);
	 _paq.push(["enableLinkTracking"]);

	(function() {
	   var u=(("https:" == document.location.protocol) ? "https" : "http") + "://www.yoochoose.com/piwik/";
	   _paq.push(["setTrackerUrl", u+"piwik.php"]);
	   _paq.push(["setSiteId", "4"]);
	   var d=document, g=d.createElement("script"), s=d.getElementsByTagName("script")[0]; g.type="text/javascript";
	   g.defer=true; g.async=true; g.src=u+"piwik.js"; s.parentNode.insertBefore(g,s);
	})();
}


/** Called only once, when the page is loaded.
 *  User related GUI emements must be configured here. 
 *  
 *  @see #initialLoadData()
 */
function initialize() {

	getCurrentUser(function(loginInfo) {
		
		var name = "";
		if (loginInfo.firstName) name += loginInfo.firstName;
		if (loginInfo.lastName && name) name += " ";
		if (loginInfo.lastName) name += loginInfo.lastName;
		
		if ( ! name) {
			name += loginInfo.id;
		}
		
		$('.account_data').children('li').first().find('strong').text(name);
		piwikCaller(name);
		
	    if (loginInfo.provider == "ibs") {
	    	$('.ibs_item').show();
	    } else {
	    	$('.ibs_item').hide();
	    }
	    
	    // updating interface language
	    if (loginInfo.lang && in_to_language != loginInfo.lang) { // "in_to_language" is a global variable defined in "i18n.js"
	    	changeLang(loginInfo.lang, false);
	    }
	});
	
	if (mandatorList.length > 1) {
		$('.switch').show();
	} else {
		$('.switch').hide();
	}
	
	for (var i = 0; i < mandatorList.length; i++) {
		var mandatorInfo = mandatorList[i];
		var id = mandatorList[i].baseInformation.id;
		var web = mandatorList[i].baseInformation.website;
		
		$('#choose_mandant').append('<option value="' + id + '">' + id + ': ' + web + '</option>');
	}

	initialLoadData();
	setMandantData(mandatorDao.mandator);

	$('#index_conversion_rate_average').attr('data-translate', 'index_conversion_rate_average_day');
	$('#index_delivered_recommendations').attr('data-translate', 'index_delivered_recommendations_day');
	$('#index_collected_events').attr('data-translate', 'index_collected_events_day');
	
	
	$('#copyrightsLink').off('click').click(function() {
    	console.log("should close corporate1");
    	$('#messageCorporate').hide();
    	console.log("should close corporate2");
    	$('#messageCopyrights').show();
    });


    //Change the value in selectbox 1 in collected events
    $('select[id^="events_select_for_chart_bar"]').change(function () {
        renderCollectedEvents();
    });

    $('select[id^="select_for_delivered_recommendations_chart_bar"]').change(function () {
        renderRecommendationChart();
    });

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
    
    // is called if right converison unit is changed from relative -> absolute and vice versa
	$('#conversion_units').change(function () {
		renderConversionRate();
	});
	
    $('#settingsP .closeOverlay').click(function () {
    	window.parent.history.replaceState(null, null, "/");
    });
	
	$('section  div.index_mandator').hover(function() {
		$(this).find('.index_hover').css('display', 'table-row');
	}, function() {
		$(this).find('.index_hover').css('display', 'none');
	});
	
	if (customerID && open_reference_code) {
		openScenarioDialog(customerID, open_reference_code);
	}
	
};


/** Opens the popup "Edit personal and contact data".
 *  It opens the legacy customer data or Pactas popup.
 *  
 *  It must not be called for IBS mandator.
 */
function openContractDetails() {
	var mandator = mandatorDao.mandator;
	if (! mandator) {
		console.log("No mandator loaded. Unable to open Pactas/Customer popup.");
		return;
	}
	if (mandatorDao.mandator.product.comaId.coma == "PACTAS") {
		$('#pactasPopup').show();
	} else {
		$('#editDataOverlay').show();
	}
}


var ifExtended = function() {
	  var solution = mandatorDao.mandator.baseInformation.version;
	  var extendedSolution = (solution == 'EXTENDED');
	  
	  return extendedSolution;
};


function updateDatae() {

    var json = $('body').data('dataprp');
    var customer = json.profilePack.customer;
    customer.company = $('#ecompany').val();
    customer.firstName = $('#efname').val();
    customer.lastName = $('#elname').val();
    customer.phone = $('#ephone').val();
    customer.address.street = $('#estreet_and_house').val();
    customer.address.zip = $('#ezip').val();
	customer.address.city = $('#ecity').val();
    customer.address.country = $('#ecountry').val();
	console.log("customer: "+customer);
    $('body').data('dataprp', json);

}

function saveForme() {

	var showError = false;
	if($('#ecompany').val() == "") {
		$('label[for="ecompany"]').parent().addClass("problem");
		showError = true;
	} else {
		$('label[for="ecompany"]').parent().removeClass("problem");
	}
	if($('#efname').val() == "") {
		$('label[for="efname"]').parent().addClass("problem");
		showError = true;
	} else {
		$('label[for="efname"]').parent().removeClass("problem");
	}
	if($('#elname').val() == "") {
		$('label[for="elname"]').parent().addClass("problem");
		showError = true;
	} else {
		$('label[for="elname"]').parent().removeClass("problem");
	}
	if($('#estreet_and_house').val() == "") {
		$('label[for="estreet_and_house"]').parent().addClass("problem");
		showError = true;
	} else {
		$('label[for="estreet_and_house"]').parent().removeClass("problem");
	}
	if($('#ezip').val() == "") {
		$('label[for="ezip"]').parent().addClass("problem");
		showError = true;
	} else {
		$('label[for="ezip"]').parent().removeClass("problem");
	}
	if($('#ecity').val() == "") {
		$('label[for="ecity"]').parent().addClass("problem");
		showError = true;
	} else {
		$('label[for="ecity"]').parent().removeClass("problem");
	}
	if($('#ecountry').val() == "") {
		$('label[for="ecountry"]').parent().addClass("problem");
		showError = true;
	} else {
		$('label[for="ecountry"]').parent().removeClass("problem");
	}
	if($('#ephone').val() == "") {
		$('label[for="ephone"]').parent().addClass("problem");
		showError = true;
	} else {
		$('label[for="ephone"]').parent().removeClass("problem");
	}
	
	if(showError == true) {
		setMessagePopUp("problem", "error_fill_required_fields");
	} else {
		var json = $('body').data('dataprp'),
			customer = json.profilePack.customer;

		$.ajax({
			type: "POST",
			beforeSend: function (x) {
				if (x && x.overrideMimeType) {
					x.overrideMimeType("application/json;charset=UTF-8");
				}
			},
			mimeType: "application/json",
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify(customer),
			url: "ebl/v3/profile/update_customer?no-realm",
			success: function (json) {
				//on success
				setMessagePopUp("positive", "message_data_saved_successfully");
			},
			error: mainErrorHandler
		});
	}
}


function getEditData(json) {

    $('#editDataOverlay').find("input").off('change').change(function () {
        updateDatae();
    });
    $('#showLicenseKey').off('click').on('click', function(){
        $('#thekeyid').html(json.profilePack.mandator.licenseKey);
        $('#licenceKeyId').show();
	});
	
    var customer = json.profilePack.customer;
    $('body').data('dataprp', json);
			
	$('#eemail').val(ifnull(customer.email, ""));
	$('#ecompany').val(ifnull(customer.company, ""));
	$('#efname').val(ifnull(customer.firstName, ""));
	$('#elname').val(ifnull(customer.lastName, ""));
	$('#ephone').val(ifnull(customer.phone, ""));
	$('#estreet_and_house').val(ifnull(customer.address.street, ""));
	$('#ezip').val(ifnull(customer.address.zip, ""));
	$('#ecity').val(ifnull(customer.address.city, ""));
	$('#ecountry').val(ifnull(customer.address.country, ""));
       
    $('#changeEditdata').click(function () {
        saveForme();
    });
}


function setMandantData(mandatorInfo) {
	
	var id = mandatorInfo.baseInformation.id;
	var website = mandatorInfo.baseInformation.website;
	var version = mandatorInfo.baseInformation.version;
    
    $('.info').children('strong').text(website);
    $('.info').children('p').text(" (" + version + ")");
    $('.info').children('span').children('.codeid').text(id);

    yooAjax(null, {
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


var mandatorVersionType='BASIC';



/** This function is called, after the mandator was  sucessfully loaded
 * */ 
function initialLoadData() {
	
	if (mandatorDao.getProductComa() == 'IBS') {
		$("#edit_contact_datal").hide();
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

    yooAjax(null, {
        url: "ebl/v3/profile/get_profile_pack/" + decodeURIComponent(customerID),
        success: function (json) {
            var mandator = json.profilePack.mandator;
			if(mandator !=null && 'version' in mandator){
				mandatorVersionType = mandator.version;
			}
			$.cookie('mandatorVersionType', mandatorVersionType);
			if(mandatorVersionType == 'EXTENDED'){
				$('#ABTestTab').show();
			}else{
				$('#ABTestTab').hide();
			}
			$('section.scenarios ul.options_menu').find('li:visible').removeClass('last-child');
			$('section.scenarios ul.options_menu').find('li:visible:last').addClass('last-child');
			
			getEditData(json);
        }
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
			param.attr('data-translate', "currency_" + currencyCode);
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
		setMessagePopUp("problem", "error_server_error_403");
	} else if(jqXHR.status != null && jqXHR.status == 401) {
		$.cookie('password', null);
		$.cookie('email', null);
		window.location = "/login.html";
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

