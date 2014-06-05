	
	var template = gup('template');
	var email    = unescape(gup('email'));
	var lang     = gup('lang');
	var customerID = gup("freeusername");
	var numberOfReloads = 0;
	
	
	function login() {

	    var email = $('#emaill').val();
	    var password = $('#password').val();

		if(!validateEmail(email))
		{
			setMessagePopUp("problem", "error_login_not_valid_email_address");
		}
		else
		{
			setWaitPopUp();
			
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
	            	login: email,
					password :password
	            },
				success: function (json) {
					$.cookie('email', email);
					window.location = "main.html";
				},
				error: error_handler
			});
		}
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
		unsetWaitPopUp();
	}
	
$(document).ready(function () {
	
	
	if( $('#emaill').val() == '' && customerID !=null && customerID !='' ){
		customerID = decodeURIComponent(customerID);
		$('#emaill').val(customerID);
	}
	
    $('#password').keypress(function (e) {
        if (e.which == 13) {
            $(this).blur();
            login();
        }
    });

    $('.form_submit_button').click(function () {
        login();
    });
    
    var generateCaptcha = false;
    numberOfReloads = $.cookie('numberOfReloads');
    if(numberOfReloads == null){
    	$.cookie('numberOfReloads',1);
    	numberOfReloads = $.cookie('numberOfReloads');
    	if(numberOfReloads == null){
    		generateCaptcha = true;
    	}
    }else{
    	$.cookie('numberOfReloads',parseInt(numberOfReloads)+1);
    	if(numberOfReloads > 3){
    		generateCaptcha = true;
    	}
    }
    
    
    var captchascope = Math.round(Math.random() * 100000);

    if(generateCaptcha){
    	 $('#captchaimage').attr('src', '/ebl/v3/registration/create_captcha?captchascope=' + captchascope);
    }else{
    	$('#captcha_actions').hide();
    	$('#captcha_input').hide();
    	captchascope = -1;
    }
   

	var emaildecode = decodeURIComponent(email);
	$('#email').val(emaildecode);
	if(lang != "")
	{
		$.cookie('language', lang, { expires: 365 });
		localizer();
	}
	
	function saveForm()
	{
	
		var showError = false;
		var mailProblem = false;
		
		
		var mailValue = $('#email').val();
		if(mailValue == ""){
			$('#email').parent().addClass("problem");
			showError = true;
		}else{
			if(mailValue.length<5 || mailValue.indexOf('@') == -1 || mailValue.indexOf('.') == -1 ){
				$('#email').parent().addClass("problem");
				mailProblem = true;
			}else{
				$('#email').parent().removeClass("problem");
			}
		}	
		
		if(!$('#privacyf').is(':checked')){
			$('label[for="privacyf"]').parent().addClass("problem");
			showError = true;
		}else{
			$('label[for="privacyf"]').parent().removeClass("problem");
		}
		if(!$('#ownership_confirmation').is(':checked')){
			$('label[for="ownership_confirmation"]').parent().addClass("problem");
			showError = true;
		}else{
			$('label[for="ownership_confirmation"]').parent().removeClass("problem");
		}
		if(showError){
			 setMessagePopUp("problem", "error_required_fields");
		}else if(mailProblem){
			setMessagePopUp("problem", "error_wrongmail");
			showError = true;
		}
		return !showError;
	}
	
	function registrationPr(){
		if (saveForm()) {

            var username = encodeURI($('#email').val());
            var templateParam = template;
            var solution = 'ebl2';
            var weburl = '';
            var captcha = $('#captcha').val();
            var isEbl2 = 'ebl2';
			var fname = $('#fname').val(); 
			var lname = $('#lname').val(); 
			setWaitPopUp();
            var url = $('#regform').attr('action');
            $.ajax({
                type: "POST",
                dataType: "json",
                data: {
                    username: username,
                    email: username,
                    solution: solution,
                    weburl: weburl,
                    captcha: captcha,
                    captchascope: captchascope,
                    template: templateParam,
					locale: in_to_language,
					ebl2: isEbl2,
					fname: fname,
					lname: lname
                },
                url: url,
                statusCode: {
                    412: function (jqXHR, textStatus, errorThrown) {
                        setMessagePopUp("problem", "registration_step_1_message_captcha_not_correct");
						captchascope = Math.round(Math.random() * 100000);
						$('#captchaimage').attr('src', '/ebl/v3/registration/create_captcha?captchascope=' + captchascope);
						$('#captcha').val("");
                    },
                    409: function (jqXHR, textStatus, errorThrown) {
                        setMessagePopUp("problem", "registration_step_1_message_login_name_already_used");
                    }
                },
                success: function (json) {
					unsetWaitPopUp();
					setDialogsContact("messageFinish","messageBodyFinish",'destroy_dialog');
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    if(jqXHR.status != null && jqXHR.status == 403)
					{
						setMessagePopUp("problem", "error_server_error_403");
					}
					else if(jqXHR.status != null && jqXHR.status == 401)
					{
						setMessagePopUp("problem", "error_server_error_401");
					}
					else if(jqXHR.status != null && jqXHR.status == 400)
					{
						setMessagePopUp("problem", "error_server_error_400");
					}
					else if(jqXHR.status != null && jqXHR.status == 404)
					{
						setMessagePopUp("problem", "error_server_error_404");
					}
					else if(jqXHR.status != null && jqXHR.status == 503)
					{
						setMessagePopUp("problem", "error_server_error_503");
					}
					else
					{
						setMessagePopUp("problem", "error_server_error");
					}
                    unsetWaitPopUp();
                }
            });
        } 
	}
	
    $('a.button').click(function () {
    	registrationPr();
    });
    
    $('#captcha').keypress(function (e) {
        if (e.which == 13) {
            $(this).blur();
            registrationPr();
        }
    });
	
	$('.reload_captcha').click(function() {
		captchascope = Math.round(Math.random() * 100000);
		$('#captchaimage').attr('src', '/ebl/v3/registration/create_captcha?captchascope=' + captchascope);
		$('#captcha').val("");
	});
	console.log($(window).width());
	if($(window).width()<1245){
		
		$('#userDataEntry').css('width',($(window).width()-10)+'px');
		$('#licenceDataEntry').css('width',($(window).width()-10)+'px');
	}

});