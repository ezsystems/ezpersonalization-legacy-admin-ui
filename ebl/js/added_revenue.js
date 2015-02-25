//
// It is a part of maininx.js. It uses global variables from there. 
//


function loadAddedRevenue() {
	
	
	
	var from_date_time = currentPeriodFromTime();
	var to_date_time = currentPeriodToTime();
	
	var mandator = mandatorDao.mandator; // mandatorDao is global
	
	$('#addedRevenue tr:not(fixed)').remove();
	$('#addedRevenue tr.overflow').hide();
	
	if (! mandator) {
		return; // something went wrong
	}
	
	$('#addedRevenue span.currency').text("(" + mandator.advancedOptions.currency + ")");
	
	setLoadingDiv('#addedRevenue');
	
	var limit = 3;

	yooAjax(null, {
		url: "/api/v4/" + encodeURIComponent(customerID) + "/statistic/added_revenue?limit="+(limit + 1)+"&from_date_time=" + from_date_time + "&to_date_time=" + to_date_time,
		success: function (json) {

			var index = 0;
			
			for (var i in json) {
				
				if (index >= limit) {
					$('#addedRevenue span.limit').text(limit);
					break;
				}
				
				var e = json[i];
				
				var date = dateFormat(e.timeConsumed) + " [" + dateDiffMinutes(e.timeRecommended, e.timeConsumed) + " minutes]";
			
				$('#addedRevenue tr:nth-child(2) td.reco_accepted').text(date);
				$('#addedRevenue tr:nth-child(2) td.item_bought').text(e.item.id + ":" + e.item.title);
				if (e.price) {
					var price = e.price.toFixed(mandator.advancedOptions.currencyFractionDigits);
					
					if (e.quantity && e.quantity > 1) {
						$('#addedRevenue tr:nth-child(2) td.item_price').text(e.quantity + " x " + price);	
					} else {
						$('#addedRevenue tr:nth-child(2) td.item_price').text(price);
					}
				}
				
				var content = $('#addedRevenue tr:nth-child(2)').html();
				$('#addedRevenue table').append("<tr>" + content + "</tr>");
				
				index++;
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


function dateFormat(date) {
  if (! (date instanceof Date)) {
	  date = new Date(date);
  }

  return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();
}