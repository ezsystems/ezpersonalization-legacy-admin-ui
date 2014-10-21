

var temporaryToken = false;


$(document).ready(function () {

	yooAjax('#password_dialog', {
		 url: "/api/v4/profile/get_me?withAuthenticationInformation",
		 success: function (json) {
			 var temporaryToken = json.authenticationInformation.temporary;
			 if (temporaryToken) {
				 $("#password_old").hide();
			 }
		 },
		 error: function (jqXHR, textStatus, errorThrown) {
			 localMessage("negative", "error_server_error", jqXHR.status);
		}
	});
	
});


function changePassword() {
	
	var password_old = $("#password_old").val();
	
	var password = $("#password").val();
	
	var password_confirm = $("#password_confirm").val();
	
	
}

