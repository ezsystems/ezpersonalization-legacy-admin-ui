

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
	
	if (password == "") {
		magicMessage("warning", "password_not_entered");
		return;
	}
	
	if (password != password.replace(/^\s+|\s+$/g, '')) {
		magicMessage("warning", "password_no_spaces");
		return;
	}
	
	if (password != password_confirm) {
		magicMessage("warning", "password_confirm_not_match");
		return;
	}
	
	yooAjax('.change_password', {
		 url: "/api/v4/profile/change_password",
         data: {
    		"oldPassword" : password_old,
    		"newPassword" : password,
    	 },
		 success: function (json) {
			 var magic = magicMessage("positive", "password_password_changed");
			 var returnUrl = gupDecoded('returnUrl');
			 $("#password_old").val("");
			 $("#password").val("");
			 $("#password_confirm").val("");
			 if (returnUrl) {
				 magic.addLink(returnUrl, "password_redirect_back_link");
				 window.location=returnUrl;
			 } else {
				 magic.addLink("/", "password_redirect_back_link");
			 }
		 },
		 fault_invalidPasswordFault: function(json) {
			 magicMessage("negative", "password_invalid_old_password"); return;
		 }
	});
}



