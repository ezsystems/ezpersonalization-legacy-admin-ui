var currentbg = "#ebeff4";
$(document).ready(function () {
	$("#Inline").spectrum({
	    showInput: true,
	    showAlpha: true,
	    color: currentbg,
	    move: function(color) {
	        var bgcolorPrev = color.toRgbString(); 
	        $('.recUnit').css("background-color",bgcolorPrev);
	    },
	    change: function(color) {
	    	var bgcolorPrev = color.toRgbString(); 
	    	currentbg = bgcolorPrev;
	    },
	    hide: function(color) {
	    	$('.recUnit').css("background-color",currentbg);
	    }
		
	});
});
