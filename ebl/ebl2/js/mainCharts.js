function chartListener(){
	
	$('#index_conversion_rate_average').attr('data-translate', 'index_conversion_rate_average_day');
	$('#index_delivered_recommendations').attr('data-translate', 'index_delivered_recommendations_day');
	$('#index_collected_events').attr('data-translate', 'index_collected_events_day');
	localizer();
    //set drop down field to default values: click, purchase, consume
    $('#events_select_for_chart_bar_1').val('click');
    $('#events_select_for_chart_bar_2').val('recommended');
   



 

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
    });

    $('#view_option_week').click(function () {

		$('#index_conversion_rate_average').attr('data-translate', 'index_conversion_rate_average_week');
		$('#index_delivered_recommendations').attr('data-translate', 'index_delivered_recommendations_week');
		$('#index_collected_events').attr('data-translate', 'index_collected_events_week');
		localizer();
	
       // var currentOption = $(this);
        //calculate the from_date_time and to_date_time
        var currentDate = getCurrentDateMinusDays(7);
        var from_date_time = getDateTimeValue(currentDate.year, currentDate.month, currentDate.day, 0, 0, 0, false);
        currentDate = getCurrentDateMinusDays(0);
        var to_date_time = getDateTimeValue(currentDate.year, currentDate.month, currentDate.day, 0, 0, 0, false);
        var granularity = "PT12H";

        setLoadingDiv($('#conversion_rate'));
        setLoadingDiv($('#collected_events'));
        setLoadingDiv($('#delivered_recommendations'));
        customerID = $.cookie('customerID');
		
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
            url: "/ebl/v3/" + customerID + "/revenue/summary?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time + "&granularity=" + granularity,
            success: function (json) {
            	if(!('revenueResponse' in json)){
            		json.revenueResponse = new Object();
            		json.revenueResponse.items = json.items;
            	}
                if (json.revenueResponse.items.length < 1) {
                	showEmptyRecommendationChart();
					//To prevent old data in the graphs the objects have to be deleted
					var conversionRateObject = new Object();
					conversionRateObject.relative = [0];
					$('body').data('conversionRateObject', conversionRateObject);
                    updateCharts([' '],[0]);
                    renderCollectedEvents(json, "week");
					$('.collected_events_chart').data('currentJSON', json);
					$('.delivered_recommendation_chart').data('currentJSON', json);
                    console.log("no items available");
                } else {
                	renderCollectedEvents(json, "week");
                    $('.collected_events_chart').data('currentJSON', json);
                    $('.delivered_recommendation_chart').data('currentJSON', json);
                    renderRecommendationChart(json, "week");
                    var valuesConversionRate = new Array();
                   // var dateTime = new Array();
                    for (var i = 7; i > 0; i--) {
                        var date = getCurrentDateMinusDays(i);
                        var testDate = "";
                        // every day must be iterate two times for 0 and 12 o'clock.
                        for (var k = 0; k < 2; k++) {

                            testDate = getDateTimeValue(date.year, date.month, date.day, k * 12, 0, 0, false);

                            var addZero = true;
                            for (var j = 0; j < json.revenueResponse.items.length; j++) {
                                var item = json.revenueResponse.items[j];
                                if (item.timespanBegin == testDate) {
                                    valuesConversionRate.push(item.conversionRate);
                                    addZero = false;
                                }
                            }
                            if (addZero) {
                                valuesConversionRate.push(0);
                              
                            }
                        }
                    }
                    var conversionRateObject = new Object();
                    conversionRateObject.relative = valuesConversionRate;
                    $('body').data('conversionRateObject', conversionRateObject);
                    updateCharts(getGraphDescriptionOfLastWeek(), valuesConversionRate);
                }
                unsetLoadingDiv($('#conversion_rate'));
                unsetLoadingDiv($('#collected_events'));
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
	
        //var currentOption = $(this);
        //calculate the from_date_time and to_date_time
        var currentDate = getCurrentDateMinusDays(30);
        var from_date_time = getDateTimeValue(currentDate.year, currentDate.month, currentDate.day, 0, 0, 0, false);
        currentDate = getCurrentDateMinusDays(0);
        var to_date_time = getDateTimeValue(currentDate.year, currentDate.month, currentDate.day, 0, 0, 0, false);
        var granularity = "P1D";

        setLoadingDiv($('#conversion_rate'));
        setLoadingDiv($('#collected_events'));
        setLoadingDiv($('#delivered_recommendations'));
        customerID = $.cookie('customerID');
	
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
            url: "/ebl/v3/" + customerID + "/revenue/summary?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time + "&granularity=" + granularity,
            success: function (json) {
            	if(!('revenueResponse' in json)){
            		json.revenueResponse = new Object();
            		json.revenueResponse.items = json.items;
            	}
                if (json.revenueResponse.items.length < 1) {
				
					//To prevent old data in the graphs the objects have to be deleted
					$('.collected_events_chart').data('currentJSON', json);
					$('.delivered_recommendation_chart').data('currentJSON', json);
					var conversionRateObject = new Object();
					conversionRateObject.relative = [0];
					$('body').data('conversionRateObject', conversionRateObject);
					showEmptyRecommendationChart();
                    updateCharts([' '],[0]);
                    console.log("no items available");
                } else {

                    var valuesConversionRate = new Array();
                   
                    //var valuesDeliveredRecommendations = new Array();
                    //var dateTime = new Array();
                    for (var i = 30; i > 0; i--) {
                        var date = getCurrentDateMinusDays(i);

                        var testDate = getDateTimeValue(date.year, date.month, date.day, 0, 0, 0, false);

                        var addZero = true;
                        for (var j = 0; j < json.revenueResponse.items.length; j++) {
                            var item = json.revenueResponse.items[j];
                            if (item.timespanBegin == testDate) {
                                valuesConversionRate.push(item.conversionRate);
                               
                                //valuesDeliveredRecommendations.push(item.deliveredRecommendations);
                                addZero = false;
                            }
                        }
                        if (addZero) {
                            valuesConversionRate.push(0);
                           
                            //valuesDeliveredRecommendations.push(0);
                        }
                    }
                    renderCollectedEvents(json, "month");
                    $('.collected_events_chart').data('currentJSON', json);
                    $('.delivered_recommendation_chart').data('currentJSON', json);
                    renderRecommendationChart(json, "month");
                    var conversionRateObject = new Object();
                    conversionRateObject.relative = valuesConversionRate;
                    $('body').data('conversionRateObject', conversionRateObject);
                    updateCharts(getGraphDescriptionOfLastMonth(), valuesConversionRate);
                }
                unsetLoadingDiv($('#conversion_rate'));
                unsetLoadingDiv($('#collected_events'));
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

	$('#conversion_units').change(function () {
		var conversionRateObject = $('body').data('conversionRateObject');
		
		var statusObject = new Object();
		statusObject = conversionRateObject.relative;
				
		if($('li.current').hasClass('view_option_day'))
		{
			updateCharts(getGraphDescriptionOf24h(new Date()), statusObject);
		}
		else if($('li.current').hasClass('view_option_week'))
		{
			updateCharts(getGraphDescriptionOfLastWeek(), statusObject);
		}
		else if($('li.current').hasClass('view_option_month'))
		{
			updateCharts(getGraphDescriptionOfLastMonth(), statusObject);
		}
		
	});
	
}

var chartListenerToLoad = true;

function initialLoadData() {

    fillConversionRateDay();
}



function fillConversionRateDay() {
    var customerID = $.cookie('customerID');
   // var currentOption = $(this);
    //calculate the from_date_time and to_date_time
    var currentDate = getCurrentDateMinusDays(1);
    var from_date_time = getDateTimeValue(currentDate.year, currentDate.month, currentDate.day, currentDate.hour, 0, 0, false);
    currentDate = getCurrentDateMinusDays(0);
    var to_date_time = getDateTimeValue(currentDate.year, currentDate.month, currentDate.day, currentDate.hour, 0, 0, false);
    var granularity = "PT1H";
	
    $.ajax({
    	type: "POST",
        dataType: "json",
        async: false,
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
        url: "/ebl/v3/" + customerID + "/revenue/summary",
        data: {
        	from_date_time: from_date_time,
        	to_date_time: to_date_time,
        	granularity: granularity
		},
        success: function (json) {
        	if(!('revenueResponse' in json)){
        		json.revenueResponse = new Object();
        		json.revenueResponse.items = json.items;
        	}
            currentStatisticObject = json;
            if (json.revenueResponse.items.length < 1) {
			
				//To prevent old data in the graphs the objects have to be deleted
				var conversionRateObject = new Object();
                conversionRateObject.relative = [0];
                $('body').data('conversionRateObject', conversionRateObject);
                updateCharts([' '],[0]);
                showEmptyEventChart();
                showEmptyRecommendationChart();
                console.log("no items available");
            } else {
                var valuesConversionRate = new Array();
                
               // var dateTime = new Array();
                for (var i = 0; i < 24; i++) {
                	var date = getCurrentDateTimeMinusDays(1,i);
                    var testDate = "";
                    // every day must be iterate two times for 0 and 12 o'clock.
                    testDate = getDateTimeValue(date.year, date.month, date.day, date.hour, 0, 0, false);

                    var addZero = true;
                    for (var j = 0; j < json.revenueResponse.items.length; j++) {
                        var item = json.revenueResponse.items[j];
                        if (item.timespanBegin == testDate) {
                            valuesConversionRate.push(item.conversionRate);
                            
                            addZero = false;
                        }
                    }
                    if (addZero) {
                        valuesConversionRate.push(0);
                       
                    }
                }
                renderCollectedEvents(json, "day");
                $('.collected_events_chart').data('currentJSON', json);
                $('.delivered_recommendation_chart').data('currentJSON', json);
                renderRecommendationChart(json, "day");
                var conversionRateObject = new Object();
                conversionRateObject.relative = valuesConversionRate;
         
                $('body').data('conversionRateObject', conversionRateObject);
                updateCharts(getGraphDescriptionOf24h(new Date()), valuesConversionRate);
            }
            //currentOption.parent.parent.addClass("current");
            unsetLoadingDiv($('#conversion_rate'));
            unsetLoadingDiv($('#collected_events'));
            unsetLoadingDiv($('#delivered_recommendations'));
            if(chartListenerToLoad){
            	chartListenerToLoad = false;
            	setChartsDimensions();
            	setOptionsBar();
            	chartListener();
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
            innerArray.push(item.clickEvents);
            break;
       
        case "recommended":
            innerArray.push(item.clickedRecommended);
            break;
        
        case "total":
            var sum = item.clickEvents  + item.clickedRecommended ;
            innerArray.push(sum);
            break;
        default:
            innerArray.push(0);
            break;
        }
    });
    return innerArray;
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

	*/
		

	    var innerArray = new Array();
	    $('select[id^="events_select_for_chart_bar"]').each(function (index) {

	        var value = $(this).val();
	        switch (value) {
	        case "click":
	            innerArray.push( item1.clickEvents+item2.clickEvents );
	            break;
	       
	        case "recommended":
	            innerArray.push(item1.clickedRecommended+item2.clickedRecommended);
	            break;
	        
	        case "total":
	            var sum = (item1.clickEvents+item2.clickEvents)  + (item1.clickedRecommended+item2.clickedRecommended) ;
	            innerArray.push(sum);
	            break;
	        default:
	            innerArray.push(0);
	            break;
	        }
	    });
	    return innerArray;
	}



function renderRecommendationChart(json, daterange) {
    //There must be a two dimension array to show the data in the bar graphic
    //e.g.: [[x,y,z],[x1,y1,z1]]
    //There will be created an inner and outer array and pushed the data inside.
    var outerArray = new Array();

    if (daterange == "day") {
    	
        for (var i = 0; i < 24; i++) {
        	var date = getCurrentDateTimeMinusDays(1,i);
            var testDate = "";

            testDate = getDateTimeValue(date.year, date.month, date.day, date.hour, 0, 0, false);

            var innerArray = new Array();
            
            var totalDeliveredRecommendations = 0;

            for (var k = 0; k < json.revenueResponse.items.length; k++) {
         	   var item = json.revenueResponse.items[k];
         	   if (item.timespanBegin == testDate) {
         		  totalDeliveredRecommendations = totalDeliveredRecommendations +item.recommendationCalls;
         	   }
            }

            innerArray.push(totalDeliveredRecommendations);
            outerArray.push(innerArray);
        }
        updateMiddleChart(getGraphDescriptionOf24h(new Date()), outerArray);
    } else if (daterange == "week") {
        for (var i = 7; i > 0; i--) {
           // var innerArray = new Array();
            var date = getCurrentDateMinusDays(i);
            var testDate = "";

            testDate = getDateTimeValue(date.year, date.month, date.day, 0, 0, 0, false);

            var innerArray = new Array();
            
            var totalDeliveredRecommendations = 0;
            for (var k = 0; k < json.revenueResponse.items.length; k++) {
         	   	var item = json.revenueResponse.items[k];
            	if (getDateTimeValueFromValue(item.timespanBegin,false) == testDate) {
            		totalDeliveredRecommendations = totalDeliveredRecommendations +item.recommendationCalls;
            	}
            }

            innerArray.push(totalDeliveredRecommendations);
            outerArray.push(innerArray);
        }
        updateMiddleChart(getGraphDescriptionOfLastWeek(), outerArray);
        
    } else if (daterange == "month") {
        for (var i = 30; i > 0; i--) {
            var date = getCurrentDateMinusDays(i);
           // var testDate = "";
            var testDate = getDateTimeValue(date.year, date.month, date.day, 0, 0, 0, false);

            var innerArray = new Array();
           
            var totalDeliveredRecommendations = 0;

           for (var k = 0; k < json.revenueResponse.items.length; k++) {
        	   var item = json.revenueResponse.items[k];
        	   if (item.timespanBegin == testDate) {
        		   totalDeliveredRecommendations = totalDeliveredRecommendations +item.recommendationCalls;
                               
        	   }   
            }
            innerArray.push(totalDeliveredRecommendations);

            outerArray.push(innerArray);
        }
        updateMiddleChart(getGraphDescriptionOfLastMonth(), outerArray);

    }
}

function renderCollectedEvents(json, daterange) {

    //There must be a two dimension array to show the data in the bar graphic
    //e.g.: [[x,y,z],[x1,y1,z1]]
    //There will be created an inner and outer array and pushed the data inside.
    var outerArray = new Array();

    if (daterange == "day") {
        for (var i = 0; i < 24; i++) {
            var innerArray = new Array();
            var date = getCurrentDateTimeMinusDays(1,i);
            var testDate = "";

            testDate = getDateTimeValue(date.year, date.month, date.day, date.hour, 0, 0, false);

            var addZero = true;
            for (var j = 0; j < json.revenueResponse.items.length; j++) {
                var item = json.revenueResponse.items[j];
                if (item.timespanBegin == testDate) {
                    innerArray = getInnerArrayForRenderCollectedEvents(item, "day");
                    addZero = false;
                }
            }
            if (addZero) {
                innerArray.push(0);
                innerArray.push(0);
                innerArray.push(0);
            }
            outerArray.push(innerArray);
        }
        updateLeftChart(getGraphDescriptionOf24h(new Date()), outerArray);
    } else if (daterange == "week") {
        for (var i = 7; i > 0; i--) {
            var innerArray = new Array();
            var date = getCurrentDateMinusDays(i);
            var testDate = "";

            testDate = getDateTimeValue(date.year, date.month, date.day, 0, 0, 0, false);

            var addZero = true;
            var item1 = null ;
            var item2;
            var prevDate = null;
            for (var j = 0; j < json.revenueResponse.items.length; j++) {
                var item = json.revenueResponse.items[j];
                if (item.timespanBegin == testDate) {
                	item1 = item;
                	prevDate = testDate;
                }else{
                	if( getDateTimeValueFromValue(item.timespanBegin) == testDate && prevDate == testDate){
                		item2 = item;
                		innerArray = getInnerArrayForRenderCollectedEventsWeek(item1, item2);
                        addZero = false;
                	}
                }
            }
            if (addZero) {
                innerArray.push(0);
                innerArray.push(0);
                innerArray.push(0);
            }
            outerArray.push(innerArray);
        }
        updateLeftChart(getGraphDescriptionOfLastWeek(), outerArray);
    } else if (daterange == "month") {
        for (var i = 30; i > 0; i--) {
            var date = getCurrentDateMinusDays(i);
            //var testDate = "";
            var testDate = getDateTimeValue(date.year, date.month, date.day, 0, 0, 0, false);

            var innerArray = new Array();

            var addZero = true;
            for (var j = 0; j < json.revenueResponse.items.length; j++) {
                var item = json.revenueResponse.items[j];
                if (item.timespanBegin == testDate) {
                    innerArray = getInnerArrayForRenderCollectedEvents(item, "month");
                    addZero = false;
                }
            }
            if (addZero) {
                innerArray.push(0);
                innerArray.push(0);
                innerArray.push(0);
            }
            outerArray.push(innerArray);
        }
        updateLeftChart(getGraphDescriptionOfLastMonth(), outerArray);
    }
}

function myFormatter(obj, num)
{
  if (num > 1000){
    num = (num/1000) + 'K';
  }
    return num;
}

function myFormatter2(obj, num)
{
  if (num > 1000){
    num = (num/1000) + 'K';
  }else if(num < 1 || (num+"") == "1.0"){
    num = (num*100) + '%';
  }
    return num;
}

function convertDataArray(dataArray){
	if(dataArray == null){
		return [[]];
	}
    var conArray = new Array();
    for(var i=0;i<dataArray.length;i++){
            var currentApoint = dataArray[i];
            for(var j = 0;j<currentApoint.length;j++){
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





function updateCharts(labels, conversionValues) {
	if ($('#conversion_rate').length > 0) {
		updateCharts2(labels, conversionValues);
	}else{
		var wasHere = true;
		var timer = setInterval(function () {
			 if ($('#conversion_rate').length > 0) {
				 clearInterval(timer);
				 if(wasHere){
					 updateCharts2(labels, conversionValues);
				 }
				 wasHere = false;
			 } 
		}, 20);
	}
}
function updateCharts2(labels, conversionValues) {
    RGraph.Clear(document.getElementById("conversion_rate"));

    rightLine = new RGraph.Line('conversion_rate', conversionValues);
    rightLine.Set('chart.labels', labels);
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
	if ($('#collected_events').length > 0) {
		showEmptyEventChart2();
	}else{
		var wasHere = true;
		var timer = setInterval(function () {
			 if ($('#collected_events').length > 0) {
				 clearInterval(timer);
				 if(wasHere){
					 showEmptyEventChart2();
				 }
				 wasHere = false;
			} 
		}, 20);
	}
}
function showEmptyEventChart2() {
    RGraph.Clear(document.getElementById('collected_events'));
    leftbar = new RGraph.Bar('collected_events', [
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
	if ($('#delivered_recommendations').length > 0) {
		showEmptyRecommendationChart2();
	}else{
		var wasHere = true;
		var timer = setInterval(function () {
			 if ($('#delivered_recommendations').length > 0) {
				 clearInterval(timer);
				 if(wasHere){
					 showEmptyRecommendationChart2();
				 }
				 wasHere = false;
			} 
		}, 20);	
	}
}
function showEmptyRecommendationChart2() {
    RGraph.Clear(document.getElementById('delivered_recommendations'));
    middlebar = new RGraph.Bar('delivered_recommendations', [[]]);
    middlebar.Set('chart.background.barcolor1', 'transparent');
    middlebar.Set('chart.background.barcolor2', 'transparent');
    middlebar.Set('chart.labels', ' ');
    middlebar.Set('chart.key.position', 'gutter');
    middlebar.Set('chart.grouping', 'stacked');
    middlebar.Set('chart.key.background', 'transparent');
    middlebar.Set('chart.shadow', false);
    middlebar.Set('chart.yaxispos', 'left');
    middlebar.Set('chart.strokestyle', 'rgba(0,0,0,0)');
    middlebar.Set('chart.gutter.left', 40);
    middlebar.Set('chart.scale.formatter', myFormatter);
    middlebar.Set('chart.colors', ['rgba(255, 167, 57, 0.9)', 'rgba(98, 184, 188, 0.9)', 'rgba(204, 199, 158, 0.9)']);
    middlebar.Set('chart.text.font', ['Istok Web, sans-serif']);
    middlebar.Set('chart.text.color', 'rgba(140, 150, 138, 1)');
    middlebar.Set('chart.text.size', '8');
    middlebar.Draw();
}



function updateMiddleChart(labels, dataArray) {
	if ($('#delivered_recommendations').length > 0) {
		updateMiddleChart2(labels, dataArray);
	}else{
		var wasHere = true;
		var timer = setInterval(function () {
			 if ($('#delivered_recommendations').length > 0) {
				 clearInterval(timer);
				 if(wasHere){
					 updateMiddleChart2(labels, dataArray);
				 }
				 wasHere = false;
			} 
		}, 20);
	}
}
function updateMiddleChart2(labels, dataArray) {
    RGraph.Clear(document.getElementById('delivered_recommendations'));
    middlebar = new RGraph.Line('delivered_recommendations', convertDataArray(dataArray));
    middlebar.Set('chart.background.barcolor1', 'transparent');
    middlebar.Set('chart.background.barcolor2', 'transparent');
    middlebar.Set('chart.labels', labels);
    middlebar.Set('chart.background.grid', true);
    middlebar.Set('chart.linewidth', 3);
    middlebar.Set('chart.hmargin', 5);
    middlebar.Set('chart.background.grid.autofit.align', true);
    middlebar.Set('chart.background.grid.color', 'rgba(217, 226, 216, 1)');
    middlebar.Set('chart.gutter.left', 40);
    middlebar.Set('chart.scale.formatter', myFormatter);
    middlebar.Set('chart.colors', ['rgba(81, 142, 19, 1)', 'rgba(155, 93, 184, 1)', 'rgba(18, 154, 253, 1)']);
    middlebar.Set('chart.text.font', ['Istok Web, sans-serif']);
    middlebar.Set('chart.text.color', 'rgba(140, 150, 138, 1)');
    middlebar.Set('chart.text.size', '8');
    middlebar.Draw();
}

function updateLeftChart(labels, dataArray) {
	if ($('#collected_events').length > 0) {
		updateLeftChart2(labels, dataArray);
	}else{
		var wasHere = true;
		var timer = setInterval(function () {
			 if ($('#collected_events').length > 0) {
				 clearInterval(timer);
				 if(wasHere){
					 updateLeftChart2(labels, dataArray);
				 }
				 wasHere = false;
			} 
		}, 20);
	}
}
function updateLeftChart2(labels, dataArray) {
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

var setChartsDimensions = function() {
	  
    var chartCanvas = $('canvas');
    if (chartCanvas.length){
      chartCanvas.each(function(index) {
        var targetWidth = $(this).parent().innerWidth();
        $(this).attr('width', targetWidth);
      });
	  if (typeof rightLine != 'undefined')
	  {
		rightLine.Draw();
	  }
	   if (typeof middlebar != 'undefined')
	  {
		middlebar.Draw();
	  }
	   if (typeof leftbar != 'undefined')
	  {
		leftbar.Draw();
	  }
	  
    }
  
  };
  
  var setOptionsBar = function() {
	    var radioButtons = $('.options_menu > li > .option > input[type=radio]');
	    if (radioButtons.length){
	      
	      radioButtons.each(function(index) {
	        $(this).change(function() {
	          
	          $(this).parents(".options_menu").find(" > li.current").removeClass("current");
	          $(this).parents(".options_menu").find(" > li > .option > input[type=radio]").removeAttr("checked");
	          $(this).attr('checked', 'checked');
	          $(this).closest("li").addClass("current");
	          if ( $(this).closest("li").hasClass("view_option_custom") ){
	            $(this).closest("label").animate({
	              paddingRight: "350px"
	              }, 300, function() {
	                $(this).closest("li").find(".custom_range_settings").fadeIn();
	            });
	          }else{
	            $(this).closest(".options_menu").find(".view_option_custom .custom_range_settings").hide();
	            $(this).closest(".options_menu").find(".view_option_custom label").animate({
	              paddingRight: "9px"
	              }, 300
	            );
	            // $(this).closest("form").submit();
	          }
	        });
	      });
	      
	    }
	  };