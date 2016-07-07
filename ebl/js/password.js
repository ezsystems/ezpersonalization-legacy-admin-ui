var temporaryToken = false;
var isMetRequirements = false;
var authorizationCookie = getCookie('Authorization');

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

    $('#password,#password_confirm,#password_old').keyup(function () {
        checkPassword();
    });
});


function checkPassword() {
    var regExpNumbers = /[0-9]/,
        regExpSmallLetters = /[a-z]/,
        regExpBigLetters = /[A-Z]/,
        password_old = $("#password_old").val(),
        password = $("#password").val(),
        password_confirm = $("#password_confirm").val();

    isMetRequirements = false;

    if (password_old.length < 1) {
        magicMessage("warning", "old_password_not_entered");
        return;
    }

    if (password == "") {
        magicMessage("warning", "password_not_entered");
        return;
    }

    if (password.length < 8) {
        magicMessage("warning", "password_too_short");
        return;
    }

    if (password != password.replace(/^\s+|\s+$/g, '')) {
        magicMessage("warning", "password_no_spaces");
        return;
    }

    if (!regExpNumbers.test(password)) {
        magicMessage("warning", "password_one_number");
        return false;
    }

    if (!regExpSmallLetters.test(password)) {
        magicMessage("warning", "password_lowercase");
        return false;
    }

    if (!regExpBigLetters.test(password)) {
        magicMessage("warning", "password_uppercase");
        return false;
    }

    if (password != password_confirm) {
        magicMessage("warning", "password_confirm_not_match");
        return;
    }

    isMetRequirements = true;
    magicMessage("positive", "password_met_requirements");
}

function changePassword() {
    var password_old = $("#password_old").val();
    var password = $("#password").val();
    var password_confirm = $("#password_confirm").val();

    if (isMetRequirements === true) {
        yooAjax('.change_password', {
            url: "/api/v4/profile/change_password",
            data: {
                "oldPassword": password_old,
                "newPassword": password,
            },
            success: function (json) {
                var magic = magicMessage("positive", "password_password_changed");
                var returnUrl = gupDecoded('returnUrl');

                if(authorizationCookie !== false ){
                    deleteCookieFromAllPaths(authorizationCookie);
                }

                $("#password_old").val("");
                $("#password").val("");
                $("#password_confirm").val("");
                if (returnUrl) {
                    magic.addLink(returnUrl, "password_redirect_back_link");
                    window.location = returnUrl;
                } else {
                    magic.addLink("/", "password_redirect_back_link");
                }
            },
            fault_invalidPasswordFault: function (json) {
                magicMessage("negative", "password_invalid_old_password");
                return;
            }
        });
    } else {
        addErrorMessageOnSubmit();
    }

}

function addErrorMessageOnSubmit() {
    magicMessage("error", "error_submit_form");
    setTimeout(function(){ checkPassword(); }, 2000)
}

function getCookie(name){
    var pattern = RegExp(name + "=.[^;]*");
    var matched = document.cookie.match(pattern);
    if(matched){
        var cookie = matched[0].split('=');
        return cookie[1];
    }
    return false;
}

function deleteCookieFromAllPaths(name) {
    var pathBits = location.pathname.split('/');
    var pathCurrent = ' path=';

    document.cookie = name + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT;';

    for (var i = 0; i < pathBits.length; i++) {
        pathCurrent += ((pathCurrent.substr(-1) != '/') ? '/' : '') + pathBits[i];
        document.cookie = name + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT;' + pathCurrent + ';';
    }
}




