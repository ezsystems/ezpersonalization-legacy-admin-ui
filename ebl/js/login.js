
var returnUrl = gupDecoded('returnUrl');

var failureUrl = gupDecoded('failureUrl');

var product = gupDecoded('product');

var currency = gupDecoded('currency');

var directId = gupDecoded('directId');

var lang = gupDecoded('lang');

var trustedComputer = gupDecoded('trustedComputer');


$(document).ready(function () {
    
    $('#login_dialog .go_ibs').click(function () {
    	setLoadingDiv($('#login_dialog'));
    	window.setTimeout(function() {
    		unsetLoadingDiv($('#login_dialog'));
    	}, 5000);
    });
    
    $('#login_dialog input').keypress(function(e) {
        if(e.which == 13) {
            jQuery(this).blur();
            jQuery('#login_dialog .form_submit_button').focus().click();
        }
    });
    
});




function resetPass(email) {

	yooAjax('#login_dialog', {
		 url: "/api/v4/sso/reset_password?" + loginQueryString(),
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
}


function registration(email) {

	yooAjax('#login_dialog', {
		url: "/api/v4/sso/sign_up?" + loginQueryString(),
        data: {
    		"email" : email
    	},
		success: function (json) {
			 switchState("login", true);
			 $("#login_dialog input[name='password']").val("");
			 if (json.product) {
				 var pr = (json.product.name || json.product.id);
				 
				 if (json.userExists) {
					 localMessage("positive", "login_sign_up_email_sent_product_user_exists", pr);	 
				 } else {
					 localMessage("positive", "login_sign_up_email_sent_product", pr);
				 }
			 } else {
				 if (json.userExists) {
					 localMessage("positive", "login_sign_up_email_sent_user_exists");	 
				 } else {
					 localMessage("positive", "login_sign_up_email_sent");
				 }
			 }
		},
		fault_emailFault: function(json) {
			localMessage("negative", "login_fault_email", email); return;
		},		 
		fault_userDisabledFault: function(json) {
			localMessage("negative", "login_fault_user_disabled", json.id);
		},		 
		fault_productNotBookableFault: function(json) {
			localMessage("negative", "login_fault_product_not_found", json.faultDetail.productId);
		},
		fault_productNotFoundFault: function(json) {
			localMessage("negative", "login_fault_product_not_found", json.faultDetail.productId);
		},
		fault: function(json) {
			localMessage("negative", "login_fault_unexpected", json.faultCode, JSON.stringify(json.faultDetail));
		},		
		error: function (jqXHR, textStatus, errorThrown) {
			localMessage("negative", "error_server_error", jqXHR.status);
		}
	});
}


function localMessage(type, i18n_id) {
	$('.login_message').removeClass("problem");
	$('.login_message').removeClass("positive");
    $('.login_message').addClass(type);
    $('.login_message').css("visibility", "visible");
    
    var i18n_params = Array.prototype.slice.call(arguments, 2);
    
    for (var i in i18n_params) {
    	i18n_params[i] = "<span data-param='" + i + "'>" + i18n_params[i] + "</span>";
    }
    
    $('#login_message_text').attr("data-translate", i18n_id);
	$('#login_message_text').html(i18n_params.join(""));
	
	i18n($('#login_message_text'));
}


$(document).ready(function () {
	
	//Revert to a previously saved state
	window.addEventListener('popstate', function(event) {
		var state = event.state;
		switchState(state, false);
	});
	
	switchState(window.history.state, false);
	
	if (product) {
		
		var url = "/api/v4/registration/get_product/" + encodeURIComponent(product);
		if (currency) {
			url = url + (currency ? ("/" + encodeURIComponent(currency)) : "");
		}
		
		yooAjax(null, {
			url: url,
			success: function (json) {
				if (json.notAvailable) {
					localMessage("negative", "login_fault_product_not_found", json.name || json.id);	
				} else {
					localMessage("info", "login_info_bookig_product_step_1", json.name || json.id);
				}
			},
			fault_productNotFoundFault: function(json) {
				localMessage("negative", "login_fault_product_not_found", json.faultDetail.productId);
				product = null;
			},
			fault: function(json) {
				localMessage("negative", "login_fault_unexpected", json.faultCode, JSON.stringify(json.faultDetail));
				product = null;
			},		
			error: function (jqXHR, textStatus, errorThrown) {
				localMessage("negative", "error_server_error", jqXHR.status);
				product = null;
			}
		});
	}
});


function login() {

    var email = $("#login_dialog input[name='login']").val();

	if(!validateEmail(email)) {
		localMessage("problem", "error_login_not_valid_email_address");
	} else {
		if (window.history.state == "reset_password") {
			resetPass(email);
		} else if (window.history.state == "registration") {
			registration(email);
		} else {
			$('#login_dialog form').attr("action", "/api/v4/sso/back?" + loginQueryString());
			$('#login_dialog form').submit();
		}
	}
}


function switchState(state, pushNewState) {
	
	var product = gupDecoded('product');
	
	if (!state) state = (product) ? "registration" : "login";

	$("#login_dialog .password_section").css("display", (state == "login") ? "block" : "none");
	
	$("#login_dialog .know_password_section").css("display", (state == "reset_password") ? "block" : "none");
	
	$("#login_dialog .already_registered_section").css("display", (state == "registration") ? "block" : "none");
	
	$("#login_dialog .no_account_section").css("display", (state == "registration") ? "none" : "block");
	
	
	if (state == "reset_password") {
		$("#login_dialog a.button").attr("data-translate", "login_reset_password_button");
		$("#login_dialog h3.native_login_header").attr("data-translate", "login_reset_password_header");
	} else if (state == "registration") {
		$("#login_dialog a.button").attr("data-translate", "login_registration_button");
		$("#login_dialog h3.native_login_header").attr("data-translate", "login_registration_header");
	} else {
		$("#login_dialog a.button").attr("data-translate", "login_login_button");
		$("#login_dialog h3.native_login_header").attr("data-translate", "login_old_login_header");
	}
	
	i18n($("#login_dialog h3.native_login_header"));
	i18n($("#login_dialog a.button"));
	
	if (pushNewState) history.pushState(state, "", "#" + state); 
	
	$("#products_link_section").css("visibility", (product) ? "hidden" : "visible");
}


/** See diagramm "Coma Workflow" in confluence for more information. */
function loginQueryString() {
	var params = {};
	
	var returnUrl = gupDecoded('returnUrl');
	if (returnUrl) params.returnUrl = returnUrl;

	var failureUrl = gupDecoded('failureUrl');
	if (failureUrl) params.failureUrl = failureUrl;

	if (product) params.product = product; // global variable is used
	
	if (currency) params.currency = currency; // global variable is used

	var directId = gupDecoded('directId');
	if (directId) params.directId = directId;

	var lang = gupDecoded('lang');
	if (lang) params.directId = lang;

	var trustedComputer = gupDecoded('trustedComputer');
	if (trustedComputer) params.trustedComputer = trustedComputer;
	
	var queryString = $.param( params );
	
	return queryString;
}


function sso(provider) {
	
	var queryString = loginQueryString();
		
	if (provider) {
		action = "/api/v4/sso/auth/" + encodeURIComponent(provider) + "?" + queryString;
		window.location = action;
	} else {
		action = "/api/v4/sso/auth?" + queryString;
		window.location = action;
	}
	
	return false;
}


