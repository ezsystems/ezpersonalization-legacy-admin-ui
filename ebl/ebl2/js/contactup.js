var captchascope;
$(document).ready(function () {
   
    var editData =$("#contact");
    editData.on("click", function(event){
    	setDialogsContact('messageContact','messageBodyContact','destroy_dialog');
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
    	 });
    });
    var editData3 =$("#privacy");
    editData3.on("click", function(event){
    	setDialogsContact('messagePrivacy','messageBodyPrivacy','destroy_dialog');
    	
    });
    var editData4 =$("#resetp");
    if(editData4 != 'undefined'){
	    editData4.on("click", function(event){
	    	$('label[for="fpemail"]').parent().removeClass("problem");
	    	$('label[for="captcha"]').parent().removeClass("problem");
	    	$('.validation_message').hide();
	    	captchascope = Math.round(Math.random() * 100000);
	        $('#captchaimage').attr('src', '/ebl/v3/registration/create_captcha?captchascope=' + captchascope);
	        $('#captcha').val("");
	    	setDialogsContact('messageReset','messageBodyReset','destroy_dialog');
	    	
	    });
    }
   
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