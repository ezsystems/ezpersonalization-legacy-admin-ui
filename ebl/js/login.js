
var returnUrl = gupEncoded('returnUrl');


$(document).ready(function () {

    var editData4 =$("#resetp");

    editData4.on("click", function(event){
    	resetPasswordShow();
    	return false;
    });
    
    var closeResetp = function(e) { 
	    if (e.which == 1 || e.which == 27) {
	    	resetPasswordClose();
	    }
    };
    
    $(document).bind('keydown', closeResetp);
    
    $('#messageReset a.destroy_dialog').on("click", closeResetp);
    
    $('#messageReset a.send').on("click", resetPass);
    $('#messageReset a.close').on("click", closeResetp);

    $('#login_dialog .form_submit_button').click(function () {
        login();
    });
    
    $('#login_dialog .go_ibs').click(function () {
    	setLoadingDiv($('#login_dialog fieldset'));
    	window.setTimeout(function() {
    		unsetLoadingDiv($('#login_dialog fieldset'));
    	}, 5000);
    });
    
    
    $('#login_dialog input').keypress(function(e) {
        if(e.which == 13) {
            jQuery(this).blur();
            jQuery('#login_dialog .form_submit_button').focus().click();
        }
    });
    
    
    $('#messageReset input').keypress(function(e) {
        if(e.which == 13) {
            jQuery(this).blur();
            jQuery('#messageReset a.submit:visible').focus().click();
        }
    });
    
});


/** Shows password reset div. */
function resetPasswordShow() {
	$('label[for="fpemail"]').parent().removeClass("problem");
	$('label[for="captcha"]').parent().removeClass("problem");
	$('.validation_message').hide();
	captchascope = Math.round(Math.random() * 100000);
    $('#captchaimage').attr('src', '/ebl/v3/registration/create_captcha?captchascope=' + captchascope);
    $('#captcha').val("");
    
    $("#messageReset .close").hide();
    $("#messageReset li.captcha").show();
    $("#messageReset .send").show();
    
    $('#messageReset input').removeAttr('readonly');
    
    $("#messageReset").show();
}


function resetPasswordValidationMessage(i18n_key) {
	$('.validation_message').show();
	$('#validation_message').attr('data-translate', i18n_key);
	
	i18n($('#validation_message'));
}


/** Sets password reset div into "finished" mode. */
function resetPasswordFinished() {
	resetPasswordValidationMessage("reset_password_message_email_sent");
	
	$('#messageReset input').attr('readonly', true);
	
    $("#messageReset .close").show();
    $("#messageReset li.captcha").hide();
    $("#messageReset .send").hide();
}

 
/** Closed password reset div. */
function resetPasswordClose() {
	$("#messageReset").hide();
}
	

function realLogin(email,password) {
	
	setLoadingDiv($('#login_dialog fieldset'));
	
	$.ajax({
		type: "POST",
		url: "ebl/v3/registration/create_access_token",

		beforeSend: function (req) {
			req.setRequestHeader('Authorization', make_base_auth(email, password));
			req.setRequestHeader('no-realm', 'yes');
		},
		dataType: "json",
        data: {
        	set_cookie: true,
        	login: email,
			password :password
        },
		success: function (json) {
			$.cookie('email', email);
			window.location = returnUrl ? returnUrl : "index.html";
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if(jqXHR.status != null && jqXHR.status == 403){
				setMessagePopUp("problem", "error_server_error_403");
			} else if(jqXHR.status != null && jqXHR.status == 401) {
				setMessagePopUp("problem", "error_password_or_login_not_correct");
			} else if(jqXHR.status != null && jqXHR.status == 400) {
				setMessagePopUp("problem", "error_server_error_400");
			} else if(jqXHR.status != null && jqXHR.status == 404) {
				setMessagePopUp("problem", "error_server_error_404");
			} else {
				setMessagePopUp("problem", "error_server_error");
			}
		}
	}).always(function() {
		unsetLoadingDiv($('#login_dialog fieldset'));
	});
}
	 
function login() {

    var email = $('#email').val();
    var password = $('#password').val();

	if(!validateEmail(email)) {
		setMessagePopUp("problem", "error_login_not_valid_email_address");
	} else {
		realLogin(email,password);
	}
}


function resetPass() {
	
	var showError = false;
	var mailProblem = false;
	var captcha = $('#captcha').val();
	var fpemail = $('#fpemail').val();
	if(fpemail == "")  {
		$('label[for="fpemail"]').parent().addClass("problem");
		showError = true;
	} else {
		
		if(fpemail.length<5 || fpemail.indexOf('@') == -1 || fpemail.indexOf('.') == -1 ){
			$('label[for="fpemail"]').parent().addClass("problem");
			mailProblem = true;
		}else{
			$('label[for="fpemail"]').parent().removeClass("problem");
		}
	}
	if(captcha == "") {
		$('label[for="captcha"]').parent().addClass("problem");
		showError = true;
	} else {
		$('label[for="captcha"]').parent().removeClass("problem");
	}
	
	if(showError || mailProblem){
		if(mailProblem){
			$('#validation_message').attr('data-translate', "error_wrongmail" );
		}else{
			$('#validation_message').attr('data-translate', "error_fill_required_fields" );
		}
		
		i18n($('#validation_message'));
		
		$('.validation_message').show();
		
	} else {
		
		 setLoadingDiv($('#messageReset .dialog_body'));
         var url = '/ebl/v3/registration/forgot_password';
         $.ajax({
        	 type: "POST",
             dataType: "json",
             data: {
                 username: fpemail,
                 captcha: captcha,
                 captchascope: captchascope
             },
             url: url,
             statusCode: {
                 412: function (jqXHR, textStatus, errorThrown) {
	        		unsetLoadingDiv($('#messageReset .dialog_body'));
	        		
	        		resetPasswordValidationMessage("reset_password_message_captcha_not_correct" );
	        		 
					captchascope = Math.round(Math.random() * 100000);
					$('#captchaimage').attr('src', '/ebl/v3/registration/create_captcha?captchascope=' + captchascope);
					$('#captcha').val("");
                 }
             },
			 success: function (json) {
				
				 unsetLoadingDiv($('#messageReset .dialog_body'));
				
				 resetPasswordFinished();
			 },
			 error: function (jqXHR, textStatus, errorThrown) {
				
				 unsetLoadingDiv($('#messageReset .dialog_body'));
				
				 var errormsg;
				 if(jqXHR.status != null && jqXHR.status == 400) {
			 		errormsg = "error_server_error_400";
					
				 } else if(jqXHR.status != null && jqXHR.status == 404) {
					errormsg = "error_server_error_login_not_found";
					
				} else if(jqXHR.status != null && jqXHR.status == 409) {
					errormsg = "error_server_error_409";
					
				} else {
					errormsg = "error_server_error";
				}
				resetPasswordValidationMessage(errormsg);
			}
		});
	}
}


