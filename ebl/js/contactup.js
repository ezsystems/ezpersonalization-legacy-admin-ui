



$(document).ready(function () {

	// loading pop-ups into DOM
	
	$("footer").append("<div id='contactup'></div>");
	
	$("#contactup").load("../includes/contactup.html", function() {
	
	    $("#contact").on("click", function(event){
	    	$("#messageContact").show();
	    	return false;
	    });
	    
	    $("#corporate").on("click", function(event){
	    	$("#messageCorporate").show();
	    	return false;
	    });
	    
	    $("#privacy").on("click", function(event){
	    	$("#messagePrivacy").show();
	    	return false;
	    });
	    
	    $('#messageContact a.destroy_dialog').on("click", function(event){
	    	$("#messageContact").hide();
	    });
	    
	    $('#messageCorporate a.destroy_dialog').on("click", function(event){
	    	$("#messageCorporate").hide();
	    });
	    
	    $('#messagePrivacy a.destroy_dialog').on("click", function(event){
	    	$("#messagePrivacy").hide();
	    });
	    
	    var closeAll = function() {
	    	$("#messageContact").hide();
	    	$("#messageCorporate").hide();
	    	$("#messagePrivacy").hide();
	    };
	    
	    $(document).bind('keydown', function(e) { 
		    if (e.which == 27) {
		    	closeAll();
		    }
	    });
	});
});
