


$(document).ready(function () {

    var editData4 =$("#resetp");

    editData4.on("click", function(event){
    	$('label[for="fpemail"]').parent().removeClass("problem");
    	$('label[for="captcha"]').parent().removeClass("problem");
    	$('.validation_message').hide();
    	captchascope = Math.round(Math.random() * 100000);
        $('#captchaimage').attr('src', '/ebl/v3/registration/create_captcha?captchascope=' + captchascope);
        $('#captcha').val("");
    	setDialogsContact('messageReset','messageBodyReset','destroy_dialog');
    	return false;
    });
    
    $('#password').keypress(function (e) {
        if (e.which == 13) {
            $(this).blur();
            login();
        }
    });

    $('.form_submit_button').click(function () {
        login();
    });
});


function setHost(fusername) {
    var dev = 'cat.dev';
    var test = 'admin.test';
   	var src = window.location.href;
   	recoHost = 'http://free.yoochoose.net/login.html';
   	if (src.indexOf(dev) != -1) {
    	recoHost = 'http://cat.development.yoochoose.com/ebl2/login.html';
    } else {
    	if(src.indexOf(test)!=-1 ){
    		recoHost = 'http://free.test.yoochoose.net/login.html';
    	} else {
    		recoHost = 'http://free.yoochoose.net/login.html';
    	}
    }
   	$("#freeusername").val(fusername);
   	$("#formff").attr("action",recoHost);
   	$("#formff").submit();
   	
}	 
	
function realLogin(email,password){
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
			window.location = "index.html";
		},
		error: error_handler
	});
}
	 
function login() {

    var email = $('#email').val();
    var password = $('#password').val();

	if(!validateEmail(email))
	{
		setMessagePopUp("problem", "error_login_not_valid_email_address");
	}
	else
	{
		var request = $.ajax({
			type: "GET",
			url: "/ebl/v3/ebl2/getSolution?mandator="+email,
			dataType: "json"
		});
		request.done(function( json ) {
				var manInfo = json.mandatorInfo;
				if(manInfo != null){
					var solution = manInfo.name;
					if(solution == 'ebl2'){
						setHost(email);
					}else{
						realLogin(email,password);
					}
				}
				else{
					realLogin(email,password);
				}
		});
		request.fail(function(jqXHR, textStatus) {
			requestOperating = false;
			alert( "Request failed: " + textStatus+" "+jqXHR.status );
		});
		
		setLoadingDiv($('.actions'));
		
		
	}
}


function start_sso(provider) {
	
	var location = window.location + "";
	
	$.ajax({
		type: "POST",
		url: "ebl/v3/registration/sso_auth_uri",

		beforeSend: function (req) {
			req.setRequestHeader('Authorization', "");
			req.setRequestHeader('no-realm', 'yes');
		},
		dataType: "json",
        data: {
        	provider: provider,
        	location: location,
        },
		success: function (response) {
			window.location = response.authenticationRequest.authenticationUri;
		},
		error: error_handler
	});
	
	return false;
}


function error_handler(jqXHR, textStatus, errorThrown) {
	if(jqXHR.status != null && jqXHR.status == 403)
	{
		setMessagePopUp("problem", "error_server_error_403");
	}
	else if(jqXHR.status != null && jqXHR.status == 401)
	{
		setMessagePopUp("problem", "error_password_or_login_not_correct");
	}
	else if(jqXHR.status != null && jqXHR.status == 400)
	{
		setMessagePopUp("problem", "error_server_error_400");
	}
	else if(jqXHR.status != null && jqXHR.status == 404)
	{
		setMessagePopUp("problem", "error_server_error_404");
	}
	else
	{
		setMessagePopUp("problem", "error_server_error");
	}
	unsetLoadingDiv($('.actions'));
}


function resetPass() {
	
	var showError = false;
	var mailProblem = false;
	var captcha = $('#captcha').val();
	var fpemail = $('#fpemail').val();
	if(fpemail == "")
	{
		$('label[for="fpemail"]').parent().addClass("problem");
		showError = true;
	}
	else
	{
		if(fpemail.length<5 || fpemail.indexOf('@') == -1 || fpemail.indexOf('.') == -1 ){
			$('label[for="fpemail"]').parent().addClass("problem");
			mailProblem = true;
		}else{
			$('label[for="fpemail"]').parent().removeClass("problem");
		}
	}
	if(captcha == "")
	{
		$('label[for="captcha"]').parent().addClass("problem");
		showError = true;
	}
	else
	{
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
		
		setLoadingDiv($('#messageBodyReset2'));
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
                		 unsetLoadingDiv($('#messageBodyReset2'));
	                	$('#validation_message').attr('data-translate', "reset_password_message_captcha_not_correct" );
	             		localizer();
	             		$('.validation_message').show();
						captchascope = Math.round(Math.random() * 100000);
						$('#captchaimage').attr('src', '/ebl/v3/registration/create_captcha?captchascope=' + captchascope);
						$('#captcha').val("");
                 }
             },
			success: function (json) {
				unsetLoadingDiv($('#messageBodyReset2'));
				$('#validation_message').attr('data-translate', "reset_password_message_email_sent" );
				localizer();
				$('.validation_message').hide();
				var layerBody = $('#messageReset').parent('body');
	    	   	var layer = $('#messageBodyReset');
	    	   	var overlay = $('#messageReset');
	    	   	closeLayerContact(layerBody, layer, overlay);
	    	   	setDialogsContact('messageOkReset','messageBodyOkReset','destroy_dialog');
				
				
			},
			error: function (jqXHR, textStatus, errorThrown) {
				var errormsg;
					if(jqXHR.status != null && jqXHR.status == 403)
					{
						errormsg = "error_server_error_403";
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						errormsg = "error_server_error_401";
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						errormsg = "error_server_error_400";
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						errormsg = "error_server_error_404";
					}
					else if(jqXHR.status != null && jqXHR.status == 409)
					{
						errormsg = "error_server_error_409";
					}
					else
					{
						errormsg = "error_server_error";
					}
					unsetLoadingDiv($('#messageBodyReset2'));
					$('#validation_message').attr('data-translate', errormsg );
					
					i18n($('#validation_message'));
					
					$('.validation_message').show();
			}
		});
	}
}


