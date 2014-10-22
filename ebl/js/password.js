

var temporaryToken = false;


$(document).ready(function () {

	yooAjax('#password_dialog', {
		 url: "/api/v4/profile/get_me?withAuthenticationInformation",
		 success: function (json) {
			 var temporaryToken = json.authenticationInformation.temporary;
			 if (temporaryToken) {
				 $("#old_password_section").hide();
				 $("#password").focus();
			 } else {
				 $("#old_password_section").focus();
			 }
		 },
	});
});




function changePassword() {
	
	var password_old = $("#password_old").val();
	
	var password = $("#password").val();
	
	var password_confirm = $("#password_confirm").val();
}



