



$(document).ready(function () {

	// loading pop-ups into DOM
	
	$("footer").append("<div id='contactup'></div>");
	
	$("#contactup").load("../includes/contactup.html");
	
    $("#contact").on("click", function(event){
    	showContactPopup("messageContact");
    	return false;
    });
    
    $("#corporate").on("click", function(event){
    	showContactPopup("messageCorporate");
    	return false;
    });
    
    $("#privacy").on("click", function(event){
    	showContactPopup("messagePrivacy");
    	return false;
    });
    
    var closeButtons = $('.dialog_body .destroy_dialog');
    
    closeButtons.on("click", function(event){
    	$(".overlay").hide();
    });
    
    $(document).bind('keydown', function(e) { 
	    if (e.which == 27) {
	    	$(".overlay").hide();
	    }
    });
});


showContactPopup = function (overlayId) {
	$("#" + overlayId).show();
    $('#' + overlayId + ' a.destroy_dialog').on("click", function(event){
    	$(".overlay").hide();
    });
};
