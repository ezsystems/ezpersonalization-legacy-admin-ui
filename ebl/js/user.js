


var URL_LOGIN = "/login.html";


var logout = function() {
	
	$.ajax({
		async: false,
		type:"POST",
		url: "/api/v3/registration/logout",
		dataType: "json",
		beforeSend: function (req) {
			req.setRequestHeader('no-realm', '1');
		},
		success: function(json) {
			// success. Redirecting to login form.
		},
		error : function(jqXHR, textStatus, errorThrown) {
			if (jqXHR.status == 401) {
				// already logged out. Redirecting to login form.
            } else {
				setMessagePopUp("problem", "error_server_error");
			}
		}
	});
	
	$.cookie('password', null);
	$.cookie('email', null);
	$.cookie('authorization', null);
	
	window.location = URL_LOGIN;
};


///////////////////////////////////////////////////////////// getCurrentUser


var getCurrentUser = function(callback) {
	var result = yooAjax(null, {
        url: "/api/v3/registration/get_me",
        success: function (data) {
        	if (callback) {
        		callback(data.loginInfo);
        	}
        },
    });
};


///////////////////////////////////////////////////////////// defaultErrorHandler


var defaultErrorHandler = function (jqXHR, textStatus, errorThrown) {
	
	if(jqXHR.status != null && jqXHR.status == 403) {
		setMessagePopUp("problem", "error_server_error_403");
			
	} else if(jqXHR.status != null && jqXHR.status == 401) {
		
		json = jqXHR.responseJSON;
		
		var code = (json.authenticationFault ? json.authenticationFault.faultCode : "UNKNOWN");
		
		if (code == "NOT_AUTHENTICATED") {
			window.location.href = URL_LOGIN;
			
		} else if (code == "TOKEN_EXPIRED") {
			setMessagePopUpLink("problem", URL_LOGIN, "error_server_error_401_" + code);
			
		} else if (code == "PASSWORD_NOT_MATCH" || code == "LOGIN_NOT_FOUND" || code == "LOGIN_DISABLED") {
			setMessagePopUp("problem", "error_server_error_401_" + code);
			
		} else {
			setMessagePopUp("problem", "error_server_error_401_UNKNOWN");
		}
		
	} else if(jqXHR.status != null && jqXHR.status == 400)
	{
		setMessagePopUp("problem", "error_server_error_400");
	}
	else if(jqXHR.status != null && jqXHR.status == 404)
	{
		setMessagePopUp("problem", "error_server_error_404");
	}
	else if(jqXHR.status != null && jqXHR.status == 409)
	{
		setMessagePopUp("problem", "error_server_error_409");
	}
	else
	{
		setMessagePopUp("problem", "error_server_error");
	}
};


