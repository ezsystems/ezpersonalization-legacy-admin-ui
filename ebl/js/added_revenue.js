//
// It is a part of maininx.js. It uses global variables from there. 
//


function loadAddedRevenue() {
	
	setLoadingDiv('#addedRevenue');
	
	var from_date_time = currentPeriodFromTime();
	var to_date_time = currentPeriodToTime();

	yooAjax(null, {
		url: "/api/v4/" + encodeURIComponent(customerID) + "/statistic/added_revenue?from_date_time=" + from_date_time + "&to_date_time=" + to_date_time,
		success: function (json) {
			
			for (var i in json) {
				var e = json[i];
			
				$('#addedRevenue tr:nth-child(2) td.reco_accepted').text(e.timeRecommended + "->" + e.timeConsumed);
				$('#addedRevenue tr:nth-child(2) td.item_bought').text(e.item.id + ":" + e.item.title);
				if (e.price) {
					if (e.quantity && e.quantity > 1) {
						$('#addedRevenue tr:nth-child(2) td.item_price').text(e.quantity + "x" + e.price + e.currency);	
					} else {
						$('#addedRevenue tr:nth-child(2) td.item_price').text(e.price + e.currency);
					}
				}
				
				
				var content = $('#addedRevenue tr:nth-child(2)').html();
				$('#addedRevenue').append("<tr>" + content + "</tr>");
			}

		}
	}).always(function() {
		unsetLoadingDiv('#addedRevenue');		
	});

}