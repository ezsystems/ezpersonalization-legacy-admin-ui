
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
			 magicMessage("positive", "reset_password_message_email_sent");
		 },
		 fault_emailFault: function(json) {
			 magicMessage("negative", "login_fault_email", email); return;
		 },
		 fault_loginNotFoundFault: function(json) {
			 magicMessage("negative", "login_fault_login_not_found", email); return;
		 },
		 fault_userDisabledFault: function(json) {
			 magicMessage("negative", "login_fault_user_disabled", email); return;
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
					 magicMessage("positive", "login_sign_up_email_sent_product_user_exists", pr);
				 } else {
					 magicMessage("positive", "login_sign_up_email_sent_product", pr);
				 }
			 } else {
				 if (json.userExists) {
					 magicMessage("positive", "login_sign_up_email_sent_user_exists");
				 } else {
					 magicMessage("positive", "login_sign_up_email_sent");
				 }
			 }
		},
		fault_emailFault: function(json) {
			magicMessage("negative", "login_fault_email", email); return;
		},
		fault_userDisabledFault: function(json) {
			magicMessage("negative", "login_fault_user_disabled", json.id);
		},
		fault_productNotBookableFault: function(json) {
			magicMessage("negative", "login_fault_product_not_found", json.faultDetail.productId);
		},
		fault_productNotFoundFault: function(json) {
			magicMessage("negative", "login_fault_product_not_found", json.faultDetail.productId);
		}
	});
}

$(document).ready(function () {

	//Revert to a previously saved state
	window.addEventListener('popstate', function(event) {
		var state = event.state;
		switchState(state, false);
	});

	var login = gupDecoded('login');

	if (login) {
		$('input[name="login"]').val(login);
	}

	switchState(window.history.state || "login", false);

	var faultCode = gupDecoded('faultCode');
	var faultReason = gupDecoded('faultReason');
	var faultMessage = gupDecoded('faultMessage');

	if (faultCode == "CANCELLED") {
		// fine. Just continue.
	} else if (faultCode == "DENIED") {

		if (faultReason == "PASSWORD_NOT_MATCH") {
			magicMessage("error", "login_fault_password_not_match", login);

		} else if (faultReason == "LOGIN_DISABLED") {
			magicMessage("error", "login_fault_login_disabled", login);

		} else if (faultReason == "LOGIN_NOT_FOUND") {
			magicMessage("error", "login_fault_login_not_found", login);

		} else {
			magicMessage("error", "login_fault_sso_denied");
		}

		switchState("login", false);

		return;
	} else if (faultCode) {
		magicMessage("error", "fault_unexpected", faultCode + (faultReason ? " | " + faultReason : "") , faultMessage || window.location);
		return;
	}

	if (product) {
		var url = "/api/v4/registration/get_product/" + encodeURIComponent(product);
		if (currency) {
			url = url + (currency ? ("/" + encodeURIComponent(currency)) : "");
		}

		var changeLangListener = function(newLang) {
			$('#product_iframe iframe').attr('src', "https://www.yoochoose.com/product-iframe/" +
					encodeURIComponent(newLang) + "/" + encodeURIComponent(product));
		};

		addChangeLangListener(changeLangListener);

		yooAjax(null, {
			url: url,
			success: function (json) {
				if (json.notAvailable) {
					magicMessage("negative", "login_fault_product_not_found", json.name || json.id);
				} else {
					if (json.comaId && json.comaId.coma == "IBS") {
						var magic = magicMessage("warning", "login_info_bookig_product_force_ibs", json.name || json.id);
						magic.addLink(ssoLink("ibs"), "login_info_bookig_product_force_ibs_link");

					} else {
						magicMessage("info", "login_info_bookig_product_step_1", json.name || json.id);
					}

					changeLangListener(in_to_language);

					$('#product_iframe').show();
					$('footer').css("margin-top", "0");
				}
			},
			fault_productNotFoundFault: function(json) {
				var magic = magicMessage("negative", "login_fault_product_not_found", json.faultDetail.productId);
				magic.addLink("https://www.yoochoose.com/product-iframe/" + encodeURIComponent(in_to_language) + "/product_not_found_link",
						"login_select_product_link");
				product = null;
			}
		});
	}
});


function login() {

	var product = gupDecoded('product');

    var email = $("#login_dialog input[name='login']").val();

	if(!validateEmail(email)) {
		magicMessage("problem", "error_login_not_valid_email_address");
	} else {
		if (window.history.state == "reset_password") {
			resetPass(email);
		} else if (window.history.state == "registration" ||  ! window.history.state && product) {
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

	if (pushNewState) {
		history.pushState(state, "", "#" + state);
	} else {
		history.replaceState(state, "", "#" + state);
	}

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
	if (lang) params.lang = lang;

	var trustedComputer = gupDecoded('trustedComputer');
	if (trustedComputer) params.trustedComputer = trustedComputer;

	var queryString = $.param( params );

	return queryString;
}


function sso(provider) {

	var action = ssoLink(provider);
	window.location = action;

	return false;
}


function ssoLink(provider) {

	var queryString = loginQueryString();

	if (provider) {
		action = "/api/v4/sso/auth/" + encodeURIComponent(provider) + "?" + queryString;
	} else {
		action = "/api/v4/sso/auth?" + queryString;
	}

	return action;
}


