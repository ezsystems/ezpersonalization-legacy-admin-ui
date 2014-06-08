var code = gup('code');
var username = decodeURIComponent(gup('username'));
var lang = gup('lang');

function error_handler(jqXHR, textStatus, errorThrown) {
	if(jqXHR.status != null && jqXHR.status == 403)
	{
		setAnnotation("error_server_error_403");
	}
	else if(jqXHR.status != null && jqXHR.status == 401)
	{
		setAnnotation( "error_password_or_login_not_correct");
	}
	else if(jqXHR.status != null && jqXHR.status == 400)
	{
		setAnnotation( "error_server_error_400");
	}
	else if(jqXHR.status != null && jqXHR.status == 404)
	{
		setAnnotation("error_server_error_404");
	}
	else
	{
		setAnnotation( "error_server_error");
	}
	unsetWaitPopUp();
}

function setAnnotation(msg){
	$('#validation_message2').attr('data-translate',msg);
	localizer();
	$('.validation_message').show();
}

$(document).ready(function () {


	$('a.login').click(function () {

		var newPassword = $('#password').val();
		var passwordConfirm = $('#password_confirm').val();
		if(newPassword == null || newPassword.length < 8 ){
			$('#password').parent().addClass('problem');
			setAnnotation("edit_contact_data_password_length");
		}else if(newPassword != passwordConfirm){
			$('#password').parent().removeClass('problem');
			$('#password_confirm').parent().addClass('problem');
			setAnnotation("edit_contact_data_confirmation_does_not_match");
		} else {
			$('#password').parent().removeClass('problem');
			$('#password_confirm').parent().removeClass('problem');
			$('.validation_message').hide();
			setWaitPopUp();
			var url = $('form').attr('action');
			$.ajax({
				type: "POST",
				dataType: "json",
				data: {
					username: username,
					code: code
				},
				url: url,
				statusCode: {
					400: function (jqXHR, textStatus, errorThrown) {
						unsetWaitPopUp();
						setAnnotation("reset_password_message_invalid_forgotten_password_code");
					},
				},
				success: function (json) {

					//The code was correct and the passwort can be changed.
					$.ajax({
						type: "POST",
						beforeSend: function (req) {
							req.setRequestHeader('Authorization', make_base_auth(username, code));
							req.setRequestHeader('no-realm', 'realm1');
						},
						mimeType: "application/json",
						contentType: "application/x-www-form-urlencoded",
						dataType: "json",
						data: {
							password: newPassword
						},
						url: "ebl/v3/profile/change_password",
						success: function (json) {

							$.ajax({
								type: "POST",
								url: "/ebl/v3/registration/create_access_token",

								beforeSend: function (req) {
									req.setRequestHeader('Authorization', make_base_auth(email, password));
									req.setRequestHeader('no-realm', 'yes');
								},
								dataType: "json",
								data: {
									set_cookie: true,
									login: username,
									password :newPassword
								},
								success: function (json) {
									$.cookie('email', email);
									unsetWaitPopUp();
									setAnnotation("reset_password_message_password_set");
									$('#validation_message2').css( "color", "green");
									$('#message_text').delay(3000).queue(function() {
										window.location = "main.html";
									});
								},
								error: error_handler
							});
							//on success




						},
						error: error_handler
					});
				},
				error: function (jqXHR, textStatus, errorThrown) {
					unsetWaitPopUp();
					setAnnotation("error_server_error");
				}
			});
		}
	});
});