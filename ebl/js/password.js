




$(document).ready(function () {

	yooAjax('#password_dialog', {
		 url: "/api/v4/profile/get_me",
         data: {
     		"email" : email
     	 },
		 success: function (json) {
			 switchState("login", true);
			 $("#login_dialog input[name='password']").val("");
			 localMessage("positive", "reset_password_message_email_sent");
		 },
		 fault_emailFault: function(json) {
			 localMessage("negative", "login_fault_email", email); return;
		 },
		 fault_loginNotFoundFault: function(json) {
			 localMessage("negative", "login_fault_login_not_found", email); return;
		 },
		 fault_userDisabledFault: function(json) {
			 localMessage("negative", "login_fault_user_disabled", email); return;
		 },
		 fault: function(json) {
			 localMessage("negative", "login_fault_unexpected", json.faultCode, JSON.stringify(json.faultDetail));
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

