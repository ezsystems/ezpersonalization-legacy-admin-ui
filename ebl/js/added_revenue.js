//
// It is a part of maininx.js. It uses global variables from there. 
//


function loadAddedRevenue() {
	
	var from_date_time = currentPeriodFromTime();
	var to_date_time = currentPeriodToTime();
	
	var mandator = mandatorDao.mandator; // mandatorDao is global
	
	$('#addedRevenue tr:not(.fixed)').slice(1).remove();
	$('#addedRevenue tr.overflow').hide();
	$('#addedRevenue tr.nothing').hide();
	
	if (! mandator) {
		return; // something went wrong
	}
	
	$('#addedRevenue span.currency').text(mandator.advancedOptions.currency);
	
	setLoadingDiv('#addedRevenue');
	
	var limit = 100;

	yooAjax(null, {
		url: "/api/v4/" + encodeURIComponent(customerID) + "/statistic/added_revenue?limit="+(limit + 1)+"&from_date_time=" + from_date_time + "&to_date_time=" + to_date_time,
		success: function (json) {

			var index = 0;
			
			for (var i in json) {
				
				if (index >= limit) {
					$('#addedRevenue tr.overflow').show();
					$('#addedRevenue span.limit').text(limit);
					break;
				}
				
				var e = json[i];
				
				var date = dateTimeFormat(e.timeConsumed) + " [" + dateDiffMinutes(e.timeRecommended, e.timeConsumed) + " minutes]";
			
				$('#addedRevenue tr:nth-child(2) td.reco_accepted').text(date);
				if (e.item.title) {
					$('#addedRevenue tr:nth-child(2) td.item_bought').text(e.item.title + " ["+e.item.id+"]");	
				} else {
					$('#addedRevenue tr:nth-child(2) td.item_bought').text(e.item.id);
				}
				
				if (e.price) {
					var price = e.price.toFixed(mandator.advancedOptions.currencyFractionDigits);
					
					if (e.quantity && e.quantity > 1) {
						$('#addedRevenue tr:nth-child(2) td.item_price').text(e.quantity + " x " + price);	
					} else {
						$('#addedRevenue tr:nth-child(2) td.item_price').text(price);
					}
				}
				
				var content = $('#addedRevenue tr:nth-child(2)').html();
				$('#addedRevenue table').append("<tr>" + content + "</tr>").show();
				
				index++;
			}
			
			if (index == 0) {
				$('#addedRevenue tr.nothing').show();
				$('section.scenarios a.create_csv').hide();
				$('#addedRevenue span.period').text(dateTimeFormat(from_date_time) + " - " + dateTimeFormat(to_date_time));
			} else {
				$('section.scenarios a.create_csv').show();
				$('section.scenarios a.create_csv').attr('href',"/api/v4/" + encodeURIComponent(customerID) + "/statistic/added_revenue.xlsx?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time);
			}
			
			i18n($('#addedRevenue'));
		}
	}).always(function() {
		unsetLoadingDiv('#addedRevenue');		
	});
	

}


function dateDiffMinutes(a, b) {
	  if (! (a instanceof Date)) {
		  a = new Date(a);
	  }
	  if (! (b instanceof Date)) {
		  b = new Date(b);
	  }
	  var r = (b - a) / 1000 / 60;
	  
	  if (r > 0) {
		  return Math.ceil(r);
	  } else {
		  return Math.floor(r);
	  }
}

