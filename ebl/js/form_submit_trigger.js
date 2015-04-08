(function($){

	function prepareSubmit() {
		$('body').on('click', 'form .form_submit_button', function(event) {
			event.preventDefault();
			$(this).closest("form").submit();
	    });
	}

	$(document).ready(function () {
		prepareSubmit();
	});

})(jQuery);