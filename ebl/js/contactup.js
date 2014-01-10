


var captchascope;
$(document).ready(function () {

	// loading pop-ups into DOM
	
	$("footer").append("<div id='contactup'></div>");
	
	$("#contactup").load("../includes/contactup.html");
	
    var editData =$("#contact");
    editData.on("click", function(event){
    	setDialogsContact('messageContact','messageBodyContact','destroy_dialog');
    	return false;
    });
    var editData2 =$("#corporate");
    editData2.on("click", function(event){
    	setDialogsContact('messageCorporate','messageBodyCorporate','destroy_dialog');
    	var editData4=$("#copyrightsLink");
    	editData4.off('click').on("click", function(event){
    	   	var layerBody = $('#messageCorporate').parent('body');
    	   	var layer = $('#messageBodyCorporate');
    	   	var overlay = $('#messageCorporate');
    	   	closeLayerContact(layerBody, layer, overlay);
    	   	setDialogsContact('messageCopyrights','messageBodyCopyrights','destroy_dialog');
    	   	return false;
    	});
    	return false;
    });
    var editData3 =$("#privacy");
    editData3.on("click", function(event){
    	setDialogsContact('messagePrivacy','messageBodyPrivacy','destroy_dialog');
    	return false;
    });
});

var openLayerContact = function(overlay, layer, layerBody) {
	layer.remove();
	$(layer).appendTo(overlay);
	overlay.show();
	layerBody.css({'overflow':'auto'});
	layer.fadeIn('slow', function(){
		var scrollTop = $(window).scrollTop();
		layer.css({'top':scrollTop + 'px'});
	});
};
    	  
    	  
var layerSizingContact = function(overlay){
	var fullWidth = $('body').outerWidth(true);
	var fullHeight = $('body').outerHeight(true);
	overlay.css({'height':fullHeight + 'px', 'width':fullWidth + 'px'});
};


function setDialogsContact(overlayId,dialogBodyId,closeButtonId ) {
    
    var overlay = $('#'+overlayId);
    var layer = $('#'+dialogBodyId);
    var closeButtonOk = $('#'+closeButtonId);
    var layerBody = $('#'+overlayId).parent('body');
    var closeButton = $('.dialog_body .destroy_dialog');
    
    openLayerContact(overlay, layer, layerBody);
    layerSizingContact(overlay);
    
    
    closeButton.click(function() {
    	closeLayerContact(layerBody, layer, overlay);
    });
    
    closeButtonOk.click(function() {
    	closeLayerContact(layerBody, layer, overlay);
    });
    
    $(document).bind('keydown', function(e) { 
      if (e.which == 27) {
    	  closeLayerContact(layerBody, layer, overlay);
      }
    });
	
  }

var closeLayerContact = function(layerBody, layer, overlay){
    layerBody.css({'overflow':'auto'});
    layer.fadeOut('fast');
    overlay.hide();
  };