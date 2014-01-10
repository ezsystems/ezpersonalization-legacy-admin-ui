var customerID = $.cookie('customerID');

$(document).ready(function () {

    var loginName = $.cookie('email');
		$('.account_data').children('li').first().find('strong').text(loginName);
		setLoadingDiv($('section.mandant > header'));
		setLoadingDiv($('.available_scenarios'));
		setLoadingDiv($('#conversion_rate'));
		setLoadingDiv($('#collected_events'));
		setLoadingDiv($('#delivered_recommendations'));
		$.ajax({
			dataType: "json",
			beforeSend: function (req) {
            	req.setRequestHeader('no-realm', 'realm1');
			},
			 statusCode: {
                    401: function (jqXHR, textStatus, errorThrown) {
						$.cookie('password', null);
						$.cookie('email', null);
						window.location = "login.html";
                    }
            },
			url: "ebl/v3/registration/get_accesible_mandator_list/",
			success: function (json) {


				var isInList = false;
				if(json.mandatorInfoList.length != 0)
				{
					if (json.mandatorInfoList.length > 1) {
						$('.switch').show();
						for (var i = 0; i < json.mandatorInfoList.length; i++) {
							var mandatorInfo = json.mandatorInfoList[i];
							$('#choose_mandant').append('<option value="' + mandatorInfo.name + '">' + mandatorInfo.name + ': ' + mandatorInfo.website + '</option>');
							$('body').data('mandatorInfoList', json);
							if ($.cookie('customerID') != null) {
								if ($.cookie('customerID') == mandatorInfo.name) {
									isInList = true;
								}
							}
						}
						if (isInList == false) {
							$.cookie('customerID', null);
						}
					} else if (json.mandatorInfoList.length == 1) {
						$('.switch').hide();
						for (var i = 0; i < json.mandatorInfoList.length; i++) {
							var mandatorInfo = json.mandatorInfoList[i];
							$('#choose_mandant').append('<option value="' + mandatorInfo.name + '">' + mandatorInfo.name + ': ' + mandatorInfo.website + '</option>');
							$('body').data('mandatorInfoList', json);
							$.cookie('customerID', mandatorInfo.name, { expires: 365 });
						}
					}

					if ($.cookie('customerID') == null) {
						$('.overlay').show();
						$('.dialog_body').show();
					} else {

						//$('.edit_contact_data').attr('href', 'edit_contact_data.html?customer_id=' + $.cookie('customerID'));
						initialLoadData();
						setMandantData();
					}
				unsetLoadingDiv($('section.mandant > header'));
				}
				else{
					setMessagePopUp("problem", "error_no_mandators_in_list");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						setMessagePopUp("problem", "error_server_error_409");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
			}
		});

	$('#index_conversion_rate_average').attr('data-translate', 'index_conversion_rate_average_day');
	$('#index_delivered_recommendations').attr('data-translate', 'index_delivered_recommendations_day');
	$('#index_collected_events').attr('data-translate', 'index_collected_events_day');
	
	
	$('#copyrightsLink').off('click').click(function() {
    	console.log("should close corporate1");
    	$('#messageCorporate').hide();
    	console.log("should close corporate2");
    	$('#messageCopyrights').show();
    });
	
    //set drop down field to default values: click, purchase, consume
    $('#events_select_for_chart_bar_1').val('click');
    $('#events_select_for_chart_bar_2').val('purchase');
    $('#events_select_for_chart_bar_3').val('consume');



    //Change the value in selectbox 1 in collected events
    $('select[id^="events_select_for_chart_bar"]').change(function () {

        var json = $('.collected_events_chart').data('currentJSON');

        if ($('li.current').hasClass('view_option_day')) {
            renderCollectedEvents(json, "day");
        } else if ($('li.current').hasClass('view_option_week')) {
            renderCollectedEvents(json, "week");
        } else if ($('li.current').hasClass('view_option_month')) {
            renderCollectedEvents(json, "month");
        }
    });



    $('select[id^="select_for_delivered_recommendations_chart_bar"]').change(function () {

        var json = $('.delivered_recommendation_chart').data('currentJSON');

        if ($('li.current').hasClass('view_option_day')) {
            renderRecommendationChart(json, "day");
        } else if ($('li.current').hasClass('view_option_week')) {
            renderRecommendationChart(json, "week");
        } else if ($('li.current').hasClass('view_option_month')) {
            renderRecommendationChart(json, "month");
        }
    });

    //Last day click event
    $('#view_option_day').click(function () {
	
		$('#index_conversion_rate_average').attr('data-translate', 'index_conversion_rate_average_day');
		$('#index_delivered_recommendations').attr('data-translate', 'index_delivered_recommendations_day');
		$('#index_collected_events').attr('data-translate', 'index_collected_events_day');
		localizer();
	
        setLoadingDiv($('#conversion_rate'));
        setLoadingDiv($('#collected_events'));
        setLoadingDiv($('#delivered_recommendations'));
        fillConversionRateDay();
        fillRecommendationDay();
    });

    $('#view_option_week').click(function () {

		$('#index_conversion_rate_average').attr('data-translate', 'index_conversion_rate_average_week');
		$('#index_delivered_recommendations').attr('data-translate', 'index_delivered_recommendations_week');
		$('#index_collected_events').attr('data-translate', 'index_collected_events_week');
		localizer();
	
        //calculate the from_date_time and to_date_time
        var currentDate = getCurrentDateMinusDays(7);
        var from_date_time = getDateTimeValue(currentDate.year, currentDate.month, currentDate.day, 0, 0, 0, false);
        currentDate = getCurrentDateMinusDays(0);
        var to_date_time = getDateTimeValue(currentDate.year, currentDate.month, currentDate.day, 0, 0, 0, false);
        var granularity = "PT12H";
		
        setLoadingDiv($('#collected_events'));
        setLoadingDiv($('#conversion_rate'));

        customerID = $.cookie('customerID');
		$('.export').attr('href', "ebl/v3/" + customerID + "/revenue/statistic.xlsx?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time + "&granularity=" + granularity);
        $.ajax({
            dataType: "json",
			beforeSend: function (req) {
            req.setRequestHeader('no-realm', 'realm1');
			},
			 statusCode: {
                    401: function (jqXHR, textStatus, errorThrown) {
						$.cookie('password', null);
						$.cookie('email', null);
						window.location = "login.html";
                    }
            },
            url: "ebl/v4/" + customerID + "/statistic/summary/REVENUE,RECOS,EVENTS?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time + "&granularity=" + granularity,
			success: function (data) {
				var json = {
							'revenueResponse': {
								'items' : data
							}
						},
						conversionRateObject = {
							'relative' : [0],
							'absolute' : [0]
						},
						l, i, convRate;
				if (json.revenueResponse.items.length < 1) {

					//To prevent old data in the graphs the use the "zero" object
					showEmptyCharts();
					showEmptyEventChart();
					console.log("no items available");
				} else {
					conversionRateObject.relative = [];
					conversionRateObject.absolute = [];
					l = json.revenueResponse.items.length;
					for(i = 0; i < l; i++){
						convRate = parseFloat(json.revenueResponse.items[i].clickedRecommended)/parseFloat(json.revenueResponse.items[i].clickEvents);
						conversionRateObject.relative.push(isNaN(convRate) ? 0.0 : convRate * 100 );
						conversionRateObject.absolute.push(json.revenueResponse.items[i].clickedRecommended);
					}
					renderCollectedEvents(json, "week");
					$('.collected_events_chart').data('currentJSON', json);
                    updateCharts(getGraphDescriptionOfLastWeek(), conversionRateObject.relative, percentFormatter);
                }
				$('body').data('conversionRateObject', conversionRateObject);
                unsetLoadingDiv($('#collected_events'));
                unsetLoadingDiv($('#conversion_rate'));
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						setMessagePopUp("problem", "error_server_error_409");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
            }
        });
		
		
		
        granularity = "P1D";
        setLoadingDiv($('#delivered_recommendations'));

        $.ajax({
            dataType: "json",
			beforeSend: function (req) {
            req.setRequestHeader('no-realm', 'realm1');
			},
			 statusCode: {
                    401: function (jqXHR, textStatus, errorThrown) {
						$.cookie('password', null);
						$.cookie('email', null);
						window.location = "login.html";
                    }
            },
			beforeSend: function (req) {
            req.setRequestHeader('no-realm', 'realm1');
			},
            url: "ebl/v3/" + customerID + "/structure/get_scenario_list?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time + "&granularity=" + granularity,
            success: function (json) {

                if (json.scenarioInfoList.length < 1) {
                    showEmptyRecommendationChart();
                    console.log("no scenarios");
                } else {
                    $('.delivered_recommendation_chart').data('currentJSON', json);
                    renderRecommendationChart(json, "week");
                }
                unsetLoadingDiv($('#delivered_recommendations'));
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						setMessagePopUp("problem", "error_server_error_409");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
            }
        });


    });

    $('#view_option_month').click(function () {

		$('#index_conversion_rate_average').attr('data-translate', 'index_conversion_rate_average_month');
		$('#index_delivered_recommendations').attr('data-translate', 'index_delivered_recommendations_month');
		$('#index_collected_events').attr('data-translate', 'index_collected_events_month');
		localizer();

        //calculate the from_date_time and to_date_time
        var currentDate = getCurrentDateMinusDays(30);
        var from_date_time = getDateTimeValue(currentDate.year, currentDate.month, currentDate.day, 0, 0, 0, false);
        currentDate = getCurrentDateMinusDays(0);
        var to_date_time = getDateTimeValue(currentDate.year, currentDate.month, currentDate.day, 0, 0, 0, false);
        var granularity = "P1D";

        setLoadingDiv($('#conversion_rate'));
        setLoadingDiv($('#collected_events'));

        customerID = $.cookie('customerID');
		$('.export').attr('href', "ebl/v3/" + customerID + "/revenue/statistic.xlsx?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time + "&granularity=" + granularity);
        $.ajax({
            dataType: "json",
			beforeSend: function (req) {
            req.setRequestHeader('no-realm', 'realm1');
			},
			 statusCode: {
                    401: function (jqXHR, textStatus, errorThrown) {
						$.cookie('password', null);
						$.cookie('email', null);
						window.location = "login.html";
                    }
            },
            url: "ebl/v4/" + customerID + "/statistic/summary/REVENUE,RECOS,EVENTS?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time + "&granularity=" + granularity,
            success: function (data) {

				var json = {
						'revenueResponse': {
							'items' : data
						}
					},
					conversionRateObject = {
						'relative' : [0],
						'absolute' : [0]
					},
					l, i, convRate;

                if (json.revenueResponse.items.length < 1) {
					//To prevent old data in the graphs the objects have to be deleted
                    showEmptyCharts();
                    console.log("no items available");
                } else {
					conversionRateObject.relative = [];
					conversionRateObject.absolute = [];
					l = json.revenueResponse.items.length;
					for(i = 0; i < l; i++){
						convRate = parseFloat(json.revenueResponse.items[i].clickedRecommended)/parseFloat(json.revenueResponse.items[i].clickEvents);
						conversionRateObject.relative.push(isNaN(convRate) ? 0.0 : convRate * 100 );
						conversionRateObject.absolute.push(json.revenueResponse.items[i].clickedRecommended);
					}
                    renderCollectedEvents(json, "month");
                    $('.collected_events_chart').data('currentJSON', json);
                    updateCharts(getGraphDescriptionOfLastMonth(), conversionRateObject.relative, percentFormatter);
                }

				$('body').data('conversionRateObject', conversionRateObject);
                unsetLoadingDiv($('#conversion_rate'));
                unsetLoadingDiv($('#collected_events'));
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						setMessagePopUp("problem", "error_server_error_409");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
            }
        });

        setLoadingDiv($('#delivered_recommendations'));

        $.ajax({
            dataType: "json",
			beforeSend: function (req) {
            req.setRequestHeader('no-realm', 'realm1');
			},
			 statusCode: {
                    401: function (jqXHR, textStatus, errorThrown) {
						$.cookie('password', null);
						$.cookie('email', null);
						window.location = "login.html";
                    }
            },
            url: "ebl/v3/" + customerID + "/structure/get_scenario_list?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time + "&granularity=" + granularity,
            success: function (json) {

                if (json.scenarioInfoList.length < 1) {
                    showEmptyRecommendationChart();
                    console.log("no scenarios");
                } else {
                    $('.delivered_recommendation_chart').data('currentJSON', json);
                    renderRecommendationChart(json, "month");
                }
                unsetLoadingDiv($('#delivered_recommendations'));
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						setMessagePopUp("problem", "error_server_error_409");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
            }
        });

    });

    
    
    // is called if right converison unit is changed from relative -> absolute and vice versa
	$('#conversion_units').change(function () {
		var conversionRateObject = $('body').data('conversionRateObject');
		
		var statusObject,
			formatter;
		if($(this).val() == 'relative')
		{
			statusObject = conversionRateObject.relative;
			//console.log(statusObject);
			formatter = percentFormatter;
		}
		else
		{
			statusObject = conversionRateObject.absolute;
			formatter = myFormatter;
		}
		console.log(statusObject);
		if($('li.current').hasClass('view_option_day'))
		{
			updateCharts(getGraphDescriptionOf24h(), statusObject, formatter);
		}
		else if($('li.current').hasClass('view_option_week'))
		{
			updateCharts(getGraphDescriptionOfLastWeek(), statusObject, formatter);
		}
		else if($('li.current').hasClass('view_option_month'))
		{
			updateCharts(getGraphDescriptionOfLastMonth(), statusObject, formatter);
		}
		
	});
	

});


$(document).on("click", '#saveMandatorChange', function (event) {
	if($('#choose_mandant').val() != "")
	{
		$.cookie('customerID', $('#choose_mandant').val(), { expires: 365 });
		customerID = $.cookie('customerID');
		//$('.edit_contact_data').attr('href', 'edit_contact_data.html?customer_id=' + $.cookie('customerID'));
		$('.overlay').hide();
		$('.dialog_body').hide();
		initialLoadData();
		setMandantData();
		
		$('.available_view_options').children('li').removeClass('current');
		$('.available_view_options').children('li').first().addClass('current');
		console.log('triggering mandatorChanged');
		var event = new Event('mandatorChanged');
		document.dispatchEvent(event);
	}
	else
	{
		setMessagePopUp("problem", "error_no_customer_select");
	}
});

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
	if($('#ecompany').val() == "")
	{
		$('label[for="ecompany"]').parent().addClass("problem");
		showError = true;
	}
	else
	{
		$('label[for="ecompany"]').parent().removeClass("problem");
	}
	if($('#efname').val() == "")
	{
		$('label[for="efname"]').parent().addClass("problem");
		showError = true;
	}
	else
	{
		$('label[for="efname"]').parent().removeClass("problem");
	}
	if($('#elname').val() == "")
	{
		$('label[for="elname"]').parent().addClass("problem");
		showError = true;
	}
	else
	{
		$('label[for="elname"]').parent().removeClass("problem");
	}
	if($('#estreet_and_house').val() == "")
	{
		$('label[for="estreet_and_house"]').parent().addClass("problem");
		showError = true;
	}
	else
	{
		$('label[for="estreet_and_house"]').parent().removeClass("problem");
	}
	if($('#ezip').val() == "")
	{
		$('label[for="ezip"]').parent().addClass("problem");
		showError = true;
	}
	else
	{
		$('label[for="ezip"]').parent().removeClass("problem");
	}
	if($('#ecity').val() == "")
	{
		$('label[for="ecity"]').parent().addClass("problem");
		showError = true;
	}
	else
	{
		$('label[for="ecity"]').parent().removeClass("problem");
	}
	if($('#ecountry').val() == "")
	{
		$('label[for="ecountry"]').parent().addClass("problem");
		showError = true;
	}
	else
	{
		$('label[for="ecountry"]').parent().removeClass("problem");
	}
	if($('#ephone').val() == "")
	{
		$('label[for="ephone"]').parent().addClass("problem");
		showError = true;
	}
	else
	{
		$('label[for="ephone"]').parent().removeClass("problem");
	}
	
	if(showError == true)
	{
		setMessagePopUp("problem", "error_fill_required_fields");
	}
	else
	{
		var json = $('body').data('dataprp'),
			customer = json.profilePack.customer;

		$.ajax({
			type: "POST",
			beforeSend: function (x) {
				if (x && x.overrideMimeType) {
					x.overrideMimeType("application/json;charset=UTF-8");
				}
				x.setRequestHeader('no-realm', 'realm1');
			},
			mimeType: "application/json",
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify(customer),
			url: "ebl/v3/profile/update_customer",
			success: function (json) {
				//on success
				setMessagePopUp("positive", "message_data_saved_successfully");
			},
			error: function (jqXHR, textStatus, errorThrown) {
				if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						setMessagePopUp("problem", "error_server_error_409");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
			}
		});
	}
}


function getEditData(json) {

	//var licenceKey = $.cookie('licenceKey');

    $('#editDataOverlay').find("input").off('change').change(function () {
        updateDatae();
    });
    $('#showLicenseKey').off('click').on('click', function(){
        $('#thekeyid').html(json.profilePack.mandator.licenseKey);
        $('#licenceKeyId').show();
	
	});
	
    var customer = json.profilePack.customer;
    $('body').data('dataprp', json);
			if(customer.email == null)
			{
				$('#eemail').val("");
			}
			else
			{
				$('#eemail').val(customer.email);
			}
			if(customer.company == null)
			{
				$('#ecompany').val("");
			}
			else
			{
				 $('#ecompany').val(customer.company);
			}
			if(customer.firstName == null)
			{
				$('#efname').val("");
			}
			else
			{
				$('#efname').val(customer.firstName);
			}
			if(customer.lastName == null)
			{
				$('#elname').val("");
			}
			else
			{
				$('#elname').val(customer.lastName);
			}
			if(customer.phone == null)
			{
				$('#ephone').val("");
			}
			else
			{
				$('#ephone').val(customer.phone);
			}
			if(customer.address.street == null)
			{
				$('#estreet_and_house').val("");
			}
			else
			{
				$('#estreet_and_house').val(customer.address.street);
			}
			if(customer.address.zip == null)
			{
				$('#ezip').val("");
			}
            else
			{
				$('#ezip').val(customer.address.zip);
			}
			if(customer.address.city == null)
			{
				$('#ecity').val("");
			}
            else
			{
				$('#ecity').val(customer.address.city);
			}
			
			if(customer.address.country == null)
			{
				$('#ecountry').val("");
			}
			else
			{
				$('#ecountry').val(customer.address.country);
			}
            
        
       

    $('#changeEditdata').click(function () {
        saveForme();
    });

}

function setMandantData() {
    var json = $('body').data('mandatorInfoList');
    var customerID = $.cookie('customerID');
    for (var i = 0; i < json.mandatorInfoList.length; i++) {
        if (json.mandatorInfoList[i].name == customerID) {
            $('.info').children('strong').text(json.mandatorInfoList[i].website);
            $('.info').children('p').text(json.mandatorInfoList[i].type + " (" + json.mandatorInfoList[i].version + ")");
            $('.info').children('span').children('.codeid').text(json.mandatorInfoList[i].name);
			$.cookie('mandatorType', json.mandatorInfoList[i].type);
        }
    }

    $.ajax({
        dataType: "json",
		beforeSend: function (req) {
            req.setRequestHeader('no-realm', 'realm1');
		},
        url: "/ebl/v3/profile/get_mandator_statistic/" + customerID,
        success: function (json) {

            var mandatorStatistic = json.mandatorStatistic;
            $('#statistic_events').text(mandatorStatistic.eventsCalenderMonth);
            //$('#statistic_outdated_objects').text(mandatorStatistic.modelsBuilt);
            //$('#statistic_outdated_profiles').text(mandatorStatistic.profilesTracked);
            $('#statistic_active_profiles').text(mandatorStatistic.profilesTracked);
            $('#statistic_active_objects').text(mandatorStatistic.objectsTracked);
            $('#statistic_recommendations').text(mandatorStatistic.recommendationsCalenderMonth);

        },
        error: function (jqXHR, textStatus, errorThrown) {

            if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						setMessagePopUp("problem", "error_server_error_409");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
        }
    });
}
var mandatorVersionType='BASIC';

function initialLoadData() {
    $('.available_scenarios').children('li').each(function (index) {
        if (index > 0) {
            $(this).remove();
        }
    });

    var customerID = $.cookie('customerID');
   	
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
    
    $('#edit_contact_datal').off('click').click(function() {
    	$('#editDataOverlay').show();
    }); 
    
    
   
    
    

	var yesterday = new Date(Date.now() - 24*3600000);
	var from_date_time = getDateTimeValue(yesterday.getFullYear(), yesterday.getMonth() +1, yesterday.getDate(), yesterday.getHours(), 0, 0, false);
	var currentDate = new Date();
	var to_date_time = getDateTimeValue(currentDate.getFullYear(), currentDate.getMonth() +1, currentDate.getDate(), currentDate.getHours(), 0, 0, false);
	var granularity = "PT1H";


	$('.export').attr('href', "ebl/v3/" + customerID + "/revenue/statistic.xlsx?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time + "&granularity=" + granularity);
	
    $.ajax({
        dataType: "json",
		beforeSend: function (req) {
            req.setRequestHeader('no-realm', 'realm1');
			},
			 statusCode: {
                    401: function (jqXHR, textStatus, errorThrown) {
						$.cookie('password', null);
						$.cookie('email', null);
						window.location = "login.html";
                    }
            },
        url: "ebl/v4/" + customerID + "/statistic/summary/REVENUE,RECOS,EVENTS?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time + "&granularity=" + granularity,
        success: function (data) {
			var json = {
				'revenueResponse': {
					'items' : data
				}
			};
            if (json.revenueResponse.items.length < 1) {
                showEmptyEventChart();
                console.log("no items available");
            } else {
                $('.collected_events_chart').data('currentJSON', json);
                renderCollectedEvents(json, "day", yesterday);
            }
            unsetLoadingDiv($('#collected_events'));
        },
        error: function (jqXHR, textStatus, errorThrown) {
			if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						setMessagePopUp("problem", "error_server_error_409");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
        }
    });

    $.ajax({
        dataType: "json",
		beforeSend: function (req) {
            req.setRequestHeader('no-realm', 'realm1');
			},
			 statusCode: {
                    401: function (jqXHR, textStatus, errorThrown) {
						$.cookie('password', null);
						$.cookie('email', null);
						window.location = "login.html";
                    }
            },
        url: "ebl/v3/profile/get_profile_pack/" + customerID,
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
			getEditData(json);
			//To show this parameters on other screens, the will be saved in the session storage
			//$.cookie('licenceKey', mandator.licenseKey);
            //$('#licence_key').children('strong').text(mandator.licenseKey);

        },
        error: function (jqXHR, textStatus, errorThrown) {
			if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						setMessagePopUp("problem", "error_server_error_409");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
        }
    });
    fillConversionRateDay();
    fillRecommendationDay();
    loadScenarios();
    
}

function loadScenarios(){
	var customerID = $.cookie('customerID');
	//initial load of the scenarios to set the select boxes and add the scenarios at the bottom of the screen
    //the arrows at every scenario will be calculated through the recommendations of the last two weeks
    var currentDate = getCurrentDateMinusDays(14);
    var from_date_time = getDateTimeValue(currentDate.year, currentDate.month, currentDate.day, 0, 0, 0, false);
    currentDate = getCurrentDateMinusDays(0);
    var to_date_time = getDateTimeValue(currentDate.year, currentDate.month, currentDate.day, 0, 0, 0, false);
    var granularity = "P7D";

    $.ajax({
        dataType: "json",
		beforeSend: function (req) {
            req.setRequestHeader('no-realm', 'realm1');
			},
			 statusCode: {
                    401: function (jqXHR, textStatus, errorThrown) {
						$.cookie('password', null);
						$.cookie('email', null);
						window.location = "login.html";
                    }
            },
        url: "ebl/v3/" + customerID + "/structure/get_scenario_list?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time + "&granularity=" + granularity,
        success: function (json) {

            if (json.scenarioInfoList.length < 1) {

                console.log("no scenarios");
				unsetLoadingDiv($('.available_scenarios'));
            } else {

                var options = "";
				$('body').data('scenariolist', json);
                for (var j = 0; j < json.scenarioInfoList.length; j++) {
                    //set the options in the select boxes
                    var scenario = json.scenarioInfoList[j];

                    //the dummy is a emtpy scenario that will be copied and added for all given scenarios from the server
                    //it will be filled with the data from the server
                    var dummy = $('.available_scenarios').children('li').first();
                    var dummyClone = $(dummy).clone();
                    $(dummyClone).show();
					var escapedRefCode = escape(scenario.referenceCode);
                    $(dummyClone).children("div").attr("id", "scenario_" + j);

                    if (scenario.title == null || $.trim(scenario.title) == "") {
                        scenario.title = scenario.referenceCode;
                    }
                    if (scenario.description == null) {
                        scenario.description = "Some brief description of the scenario, that can be edited together with other parameters";
                    }
					options = options + "<option value='" + scenario.referenceCode + "'>" + scenario.title + "</option>";
                    $(dummyClone).children("div#scenario_" + j).children("h4").children("span").text(scenario.title);
                    
                    $(dummyClone).children("div#scenario_" + j).children("p.description").text(scenario.description);

                    var additionalParameter = "?reference_code=" + escapedRefCode + "&customer_id=" + customerID;
                    //The links at the end of the page must have a referenceCode and customerID at request get parameter
                   $(dummyClone).children("div#scenario_" + j).find("h4").children("font.settings").html('<a  onclick="$(\'#settingsF\').attr(\'src\',\'settingspop.html' + additionalParameter + '\'); $(\'#settingsP\').show();"><span>&nbsp;&nbsp;&nbsp;&nbsp;</span></a>');

                    $(dummyClone).children("div").children("p.data").removeClass("unavailable").removeClass("ascending").removeClass("descending");
                    if (scenario.statisticItems.length < 1 || scenario.statisticItems.length > 2) {
                        //if the response have not correct data, the arrow gets an unavailable icon
                        console.log("no correct number of items to show delivered recommendations");
                        $(dummyClone).children("div").children("p.data").removeClass("unavailable").addClass("unavailable");
                        if (scenario.statisticItems.length == 0) {
                            $(dummyClone).children("div").children("p.data").children("span").children("strong").text("0");
                        } else {
                            $(dummyClone).children("div").children("p.data").children("span").children("strong").text(scenario.statisticItems[1].deliveredRecommendations);
                        }
                    } else if (scenario.statisticItems.length == 1) {
                        //if there is not enough data to calculate the arrow, the arrow gets an unavailable icon and the one data will be shown in the delivered recommendation text
                        $(dummyClone).children("div").children("p.data").children("span").children("strong").text(scenario.statisticItems[0].deliveredRecommendations);
                        $(dummyClone).children("div").children("p.data").removeClass("unavailable").addClass("unavailable");
                    } else {
                        //the arrow will be calculated with the cummulated data of the last two weeks.
                        //if the difference of this two values is greater or smaller as 5% an arrow will be shown.
                        //if the value from the newest data is greater, the arrow shows up, else it shows down
                        var difference = scenario.statisticItems[1].deliveredRecommendations - scenario.statisticItems[0].deliveredRecommendations;
                        if (difference > 0) {
                            $(dummyClone).children("div").children("p.data").removeClass("unavailable").addClass("ascending");
                        } else if (difference < 0) {
                            $(dummyClone).children("div").children("p.data").removeClass("unavailable").addClass("descending");
                        } else {
                            $(dummyClone).children("div").children("p.data").removeClass("unavailable").addClass("unavailable");
                        }

                        $(dummyClone).children("div").children("p.data").children("span").children("strong").text(scenario.statisticItems[1].deliveredRecommendations);

                    }
                    //set the radio buttons initialy
                    $(dummyClone).children("div#scenario_" + j).removeClass("problem").removeClass("ready_to_use").removeClass("partly_available");

                    if (scenario.avaliable === "NOT_AVAILABLE") {
                        $(dummyClone).children("div#scenario_" + j).addClass("problem");
                    } else if (scenario.avaliable === "AVAILABLE") {
                        $(dummyClone).children("div#scenario_" + j).addClass("ready_to_use");
                    } else if (scenario.avaliable === "PARTLY_AVAILABLE") {
                        $(dummyClone).children("div#scenario_" + j).addClass("partly_available");
                    }
                    if(j == 0){
                    	console.log( $('.available_scenarios').children('li').length);
                    	$('.available_scenarios').empty();
                    	$('.available_scenarios').append(dummy);
                    	console.log( $('.available_scenarios').children('li').length);
                    }
                  
                    $('.available_scenarios').append(dummyClone);
                    
                }
				//removes all elements from the select except the first one
				function removeOptions(index){
					if (index>1){
						$(this).remove();
					}
				}
                //Fill the select boxes at the bottom of the middle chart
                $('#select_for_delivered_recommendations_chart_bar_1').find('option').each(removeOptions).end().append(options)
						.find('option[value="total"]')
							.siblings()
								.removeAttr('selected')
						.end()
							.attr('selected', 'selected');//select the total scenario
                $('#select_for_delivered_recommendations_chart_bar_2').find('option').each(removeOptions).end().append(options);
                $('#select_for_delivered_recommendations_chart_bar_3').find('option').each(removeOptions).end().append(options);
                unsetLoadingDiv($('.available_scenarios'));

                $(".available_scenarios")
						.siblings('.loading').remove().end()
				.equalize({
                    eqItems: "> li:visible",
                    segmentSize: 5,
                    applicantSelector: "> *"
                });
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
			if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						setMessagePopUp("problem", "error_server_error_409");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
        }
    });
}

function fillRecommendationDay() {
    //initial load of the scenarios for the middle chart
    var customerID = $.cookie('customerID');
	var yesterday = new Date(Date.now() - 24*3600000);
	var from_date_time = getDateTimeValue(yesterday.getFullYear(), yesterday.getMonth() +1, yesterday.getDate(), yesterday.getHours(), 0, 0, false);
	var currentDate = new Date();
	var to_date_time = getDateTimeValue(currentDate.getFullYear(), currentDate.getMonth() +1, currentDate.getDate(), currentDate.getHours(), 0, 0, false);
	var granularity = "PT1H";

	$.ajax({
        dataType: "json",
		beforeSend: function (req) {
            req.setRequestHeader('no-realm', 'realm1');
			},
			 statusCode: {
                    401: function (jqXHR, textStatus, errorThrown) {
						$.cookie('password', null);
						$.cookie('email', null);
						window.location = "login.html";
                    }
            },
        url: "ebl/v3/" + customerID + "/structure/get_scenario_list?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time + "&granularity=" + granularity,
        success: function (json) {

            if (json.scenarioInfoList.length < 1) {
                showEmptyRecommendationChart();
                console.log("no scenarios");
            } else {
                $('.delivered_recommendation_chart').data('currentJSON', json);
                renderRecommendationChart(json, "day", yesterday);
            }
            unsetLoadingDiv($('#delivered_recommendations'));
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						setMessagePopUp("problem", "error_server_error_409");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
        }
    });

}

function fillConversionRateDay() {
    var customerID = $.cookie('customerID');
    var yesterday = new Date(Date.now() - 24*3600000);
    var from_date_time = getDateTimeValue(yesterday.getFullYear(), yesterday.getMonth() +1, yesterday.getDate(), yesterday.getHours(), 0, 0, false);
    currentDate = new Date();
    var to_date_time = getDateTimeValue(currentDate.getFullYear(), currentDate.getMonth() +1, currentDate.getDate(), currentDate.getHours(), 0, 0, false);
    var granularity = "PT1H";
	$('.export').attr('href', "ebl/v3/" + customerID + "/revenue/statistic.xlsx?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time + "&granularity=" + granularity);
    $.ajax({
        dataType: "json",
		beforeSend: function (req) {
            req.setRequestHeader('no-realm', 'realm1');
			},
			 statusCode: {
                    401: function (jqXHR, textStatus, errorThrown) {
						$.cookie('password', null);
						$.cookie('email', null);
						window.location = "login.html";
                    }
            },
        url: "ebl/v4/" + customerID + "/statistic/summary/REVENUE,RECOS,EVENTS?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time + "&granularity=" + granularity,
        success: function (data) {
			var json = {
					'revenueResponse': {
						'items' : data
					}
				},
			conversionRateObject = {
				'relative' : [0],
				'absolute' : [0]
			},
					l, i, convRate;
            if (json.revenueResponse.items.length < 1) {
			
				//To prevent old data in the graphs the use the "zero" object
                showEmptyCharts();
                showEmptyEventChart();
                console.log("no items available");
            } else {
				conversionRateObject.relative = [];
				conversionRateObject.absolute = [];
				l = json.revenueResponse.items.length;
				for(i = 0; i < l; i++){
					convRate = parseFloat(json.revenueResponse.items[i].clickedRecommended)/parseFloat(json.revenueResponse.items[i].clickEvents);
					conversionRateObject.relative.push(isNaN(convRate) ? 0.0 : convRate * 100 );
					conversionRateObject.absolute.push(json.revenueResponse.items[i].clickedRecommended);
				}
                renderCollectedEvents(json, "day");
                $('.collected_events_chart').data('currentJSON', json);
                updateCharts(getGraphDescriptionOf24h(yesterday), conversionRateObject.relative, percentFormatter);
            }

			$('body').data('conversionRateObject', conversionRateObject);
            //currentOption.parent.parent.addClass("current");
            unsetLoadingDiv($('#conversion_rate'));
            unsetLoadingDiv($('#collected_events'));
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						setMessagePopUp("problem", "error_server_error_409");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
        }
    });
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
	        case "own":
	            innerArray.push((item1.ownsEvents+item2.ownsEvents));
	            break;
	        case "total":
	            var sum = getTotalSum(item1.clickEvents,item1.consumeEvents,item1.purchaseEvents,item1.clickedRecommended,item1.rateEvents,item1.blacklistEvents,item1.ownsEvents)+
	            getTotalSum(item2.clickEvents,item2.consumeEvents,item2.purchaseEvents,item2.clickedRecommended,item2.rateEvents,item2.blacklistEvents,item2.ownsEvents);
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

function getTotalSum(click1,consume1,purchase1,clickedRecommended1,rate1,blacklist1,owns1 ){
	var sum = valueOrDefault(click1)+valueOrDefault(consume1)+valueOrDefault(purchase1)+
				valueOrDefault(clickedRecommended1)+valueOrDefault(rate1)+valueOrDefault(blacklist1)+valueOrDefault(owns1);
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
        case "own":
            innerArray.push(Math.round(item.ownsEvents));
            break;
        case "total":
        	var sum = getTotalSum(item.clickEvents,item.consumeEvents,item.purchaseEvents,item.clickedRecommended,item.rateEvents,item.blacklistEvents,item.ownsEvents);
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


function renderRecommendationChart(json, daterange, yesterday) {

    //There must be a two dimension array to show the data in the bar graphic
    //e.g.: [[x,y,z],[x1,y1,z1]]
    //There will be created an inner and outer array and pushed the data inside.
    var outerArray = new Array();
    if (daterange == "day") {
		var tmpDate = yesterday ? new Date(yesterday.getTime()) : new Date(Date.now()-24*3600*1000);
		var testDate;
        for (var i = 0; i < 24; i++) {
			testDate = getDateTimeValue(tmpDate.getFullYear(), tmpDate.getMonth() +1, tmpDate.getDate(), tmpDate.getHours(), 0, 0, false);
            var innerArray = new Array();
            $('select[id^="select_for_delivered_recommendations_chart_bar"]').each(function (index) {
				var addZeroOutter = true;
				var value = $(this).val();
                var totalDeliveredRecommendations = 0;

                for (var j = 0; j < json.scenarioInfoList.length; j++) {

                    var scenario = json.scenarioInfoList[j];
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
        updateMiddleChart(getGraphDescriptionOf24h(yesterday), outerArray);
    } else if (daterange == "week") {
        for (var i = 7; i > 0; i--) {
            var date = getCurrentDateMinusDays(i);
            var testDate = "";

            testDate = getDateTimeValue(date.year, date.month, date.day, 0, 0, 0, false);

            var innerArray = new Array();
            
            $('select[id^="select_for_delivered_recommendations_chart_bar"]').each(function (index) {
            	var addZeroOutter = true;
                var value = $(this).val();
                var totalDeliveredRecommendations = 0;

                for (var j = 0; j < json.scenarioInfoList.length; j++) {

                    var scenario = json.scenarioInfoList[j];
                    if (scenario.referenceCode == value || value == "total") {
                        //the selected scenario was found in the json object
                        for (var k = 0; k < scenario.statisticItems.length; k++) {
                            var item = scenario.statisticItems[k];
                            if (item.timespanBegin == testDate) {
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
        updateMiddleChart(getGraphDescriptionOfLastWeek(), outerArray);
    } else if (daterange == "month") {
        for (var i = 30; i > 0; i--) {
            var date = getCurrentDateMinusDays(i);
            var testDate = getDateTimeValue(date.year, date.month, date.day, 0, 0, 0, false);
            var innerArray = new Array();
            $('select[id^="select_for_delivered_recommendations_chart_bar"]').each(function (index) {
            	var addZeroOutter = true;
                var value = $(this).val();
                var totalDeliveredRecommendations = 0;

                for (var j = 0; j < json.scenarioInfoList.length; j++) {

                    var scenario = json.scenarioInfoList[j];
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
        updateMiddleChart(getGraphDescriptionOfLastMonth(), outerArray);

    }
}

function renderCollectedEvents(json, daterange, yesterday) {

    //There must be a two dimension array to show the data in the bar graphic
    //e.g.: [[x,y,z],[x1,y1,z1]]
    //There will be created an inner and outer array and pushed the data inside.
    var outerArray = [],
		i,
		j;

    if (daterange == "day") {
		yesterday = yesterday ? yesterday : new Date(Date.now()-24*3600*1000); // default value for yesteday

		var l = json.revenueResponse.items.length;
		for(i=0; i<l; i++){
			outerArray.push(getInnerArrayForRenderCollectedEvents(json.revenueResponse.items[i], "day"));
		}
        updateLeftChart(getGraphDescriptionOf24h(yesterday), outerArray);

    } else if (daterange == "week") {
			l = json.revenueResponse.items.length;
			for(i = 0; i<l;){
				outerArray.push(getInnerArrayForRenderCollectedEventsWeek(json.revenueResponse.items[i++], json.revenueResponse.items[i++]));
			}
        updateLeftChart(getGraphDescriptionOfLastWeek(), outerArray);

    } else if (daterange == "month") {

			l = json.revenueResponse.items.length;
			for(j=0; j<l; j++){
				outerArray.push(getInnerArrayForRenderCollectedEvents(json.revenueResponse.items[j], "month"));
			}
        updateLeftChart(getGraphDescriptionOfLastMonth(), outerArray);
    }
}

function myFormatter(obj, num)
{
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

function updateCharts(labels, conversionValues, formatter) {
	console.log('updating convRate chart');
	console.log(conversionValues);
    RGraph.Clear(document.getElementById("conversion_rate"));

    rightLine = new RGraph.Line('conversion_rate', conversionValues);
    rightLine.Set('chart.labels', labels);
    rightLine.Set('chart.background.barcolor1', 'transparent');
    rightLine.Set('chart.background.barcolor2', 'transparent');
    rightLine.Set('chart.background.grid', true);
    rightLine.Set('chart.linewidth', 3);
    rightLine.Set('chart.gutter.left', 40);
    rightLine.Set('chart.scale.formatter', formatter);
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


