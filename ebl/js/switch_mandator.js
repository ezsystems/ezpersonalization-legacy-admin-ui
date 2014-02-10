
/** INCLUDE ME AS
 * 
 *  $.getScript("/js/switch_mandator.js");
 */




/** Opens a dialog for switching the mandator 
 * 
 *  @param canBeClosed 
 *  	if true, the dialog can be closed without selecting a mandator.
 *      Default value - true.
 * */
var showSwitchMandatorPopup = function(canBeClosed) {
	
	canBeClosed = (typeof canBeClosed !== 'undefined') ? canBeClosed : true;
	
	$('#switch_mandator_popup').show();
	
	var closeButton = $('#switch_mandator_popup .destroy_dialog');
	if (canBeClosed) {
		closeButton.show();
	} else {
		closeButton.hide();
	}
};


var showNoAvailableMandatorPopup = function() {
	$('#no_mandator_available').show();
};


var initSwitchMandator = function() {
	
	// Mandator switch click event
	$('.switch > a').click(showSwitchMandatorPopup);
	
	var closeSwitchMandatorPopup = function(e) {
	    if (e.which == 1 || e.which == 27) { // left click or Esc
	    	if ($('#switch_mandator_popup .destroy_dialog').is(':visible')) {
	    		$('#switch_mandator_popup').hide();
	    	}
	    }
	};
	
	$('#switch_mandator_popup .destroy_dialog').on("click", closeSwitchMandatorPopup);
	
	$(document).bind('keydown', closeSwitchMandatorPopup);

	$("#saveMandatorChange").on("click", function (event) {
		if($('#choose_mandant').val() != "") {
			
			customerID = $('#choose_mandant').val(); // setting global variable.
			
			$.cookie('customerID', customerID, { expires: 365 });
			
			$.when(
				mandatorDao.init(customerID),
				ajaxScenarioList()
		    ).done(function() {
				var mandatorInfo = getAccesibleMandator(customerID);
				
				initialLoadData();
				setMandantData(mandatorInfo);
				
				$('.available_view_options').children('li').removeClass('current');
				$('.available_view_options').children('li').first().addClass('current');
				
				var event = new Event('mandatorChanged');
				document.dispatchEvent(event);
				
				$('#switch_mandator_popup').hide();
		    });

		} else {
			setMessagePopUp("problem", "error_no_customer_select");
		}
	});
};


$(document).ready(function () {
	// calling initialization function
	initSwitchMandator();
});
