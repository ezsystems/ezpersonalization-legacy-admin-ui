(function($){

  prepareSubmit = function() {
  if( typeof($('form .form_submit_button').live) != "undefined"){
	  $('form .form_submit_button').live('click', function(event) {
		  event.preventDefault();
		  $(this).closest("form").submit();
	  });
  }else{
	  $('form .form_submit_button').on('click', function(event) {
		  event.preventDefault();
		  $(this).closest("form").submit();
	  });
  }

  };

  $(document).ready(function () {
    prepareSubmit();
  });

})(jQuery);