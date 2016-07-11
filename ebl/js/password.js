/**
 * @type {boolean}
 */
var temporaryToken = false;

/**
 * Returns an old password object
 *
 * @returns {string}
 */
function getOldPassword() {
    var oldPassword = $('#password_old');
    return oldPassword;
}

/**
 * Returns an new password object
 *
 * @returns {string}
 */
function getNewPassword() {
    var newPassword = $('#password');
    return newPassword;
}

/**
 * Returns an new confirm password object
 *
 * @returns {string}
 */
function getNewConfirmPassword() {
    var newConfirmPassword = $('#password_confirm');
    return newConfirmPassword;
}

/**
 * Returns an old password value
 *
 * @returns {string}
 */
function getOldPasswordValue() {
    var oldPasswordValue = getOldPassword().val();
    return oldPasswordValue;
}

/**
 * Returns an new password value
 *
 * @returns {string}
 */
function getNewPasswordValue() {
    var newPasswordValue = getNewPassword().val();
    return newPasswordValue;
}

/**
 * Returns an new confirm password value
 *
 * @returns {string}
 */
function getNewConfirmPasswordValue() {
    var newConfirmPasswordValue = getNewConfirmPassword().val();
    return newConfirmPasswordValue;
}

/**
 * Verifies if passed string is empty
 *
 * @param {string} stringValue
 * @returns {boolean}
 */
function isEmptyString(stringValue) {
    stringValue = stringValue.trim();
    var isEmpty = false;
    if (stringValue.length === 0) {
        isEmpty = true;
    }
    return isEmpty;
}

/**
 * Verifies if string is shorter than 8 characters
 *
 * @param {string} stringValue
 * @returns {boolean}
 */
function isShortString(stringValue) {
    var minimumStringLength = 8;
    var isShortString = false;
    if (stringValue.length < minimumStringLength) {
        isShortString = true;
    }
    return isShortString;
}

/**
 * Verifies if string contains any empty space
 *
 * @param {string} stringValue
 * @returns {boolean}
 */
function isStringContainsSpace(stringValue) {
    var pattern = /\s/;
    var isStringContainsSpace = false;

    if (pattern.test(stringValue)) {
        isStringContainsSpace = true;
    }
    return isStringContainsSpace;
}

/**
 * Verifies if string contains at least one number
 *
 * @param {string} stringValue
 * @returns {boolean}
 */
function isStringContainsNumbers(stringValue) {
    var pattern = /[0-9]/;
    var isStringContainsNumbers = false;
    if (pattern.test(stringValue)) {
        isStringContainsNumbers = true;
    }
    return isStringContainsNumbers;
}

/**
 * Verifies if string contains lower cases
 *
 * @param {string} stringValue
 * @returns {boolean}
 */
function isStringContainsLowerCases(stringValue) {
    var pattern = /[a-z]/;
    var isStringContainsLowerCases = false;
    if (pattern.test(stringValue)) {
        isStringContainsLowerCases = true;
    }
    return isStringContainsLowerCases;
}

/**
 * Verifies if string contains upper cases
 *
 * @param {string} stringValue
 * @returns {boolean}
 */
function isStringContainsUpperCases(stringValue) {
    var pattern = /[A-Z]/;
    var isStringContainsUpperCases = false;
    if (pattern.test(stringValue)) {
        isStringContainsUpperCases = true;
    }
    return isStringContainsUpperCases;
}

/**
 * Verifies if strings are equal
 *
 * @param {string} stringValue
 * @param {string} stringValueToCompare
 * @returns {boolean}
 */
function isStringsEqual(stringValue, stringValueToCompare) {
    var isStringsEqual = false;
    if (stringValue == stringValueToCompare) {
        isStringsEqual = true;
    }
    return isStringsEqual;
}

/**
 * Resets form fields
 */
function resetFormFields() {
    getOldPassword().val('');
    getNewPassword().val('');
    getNewConfirmPassword().val('');
}

/**
 * Validates passwords (old, new, confirmed)
 *
 * @returns {*}
 */
function validateFormFields() {
    if (isEmptyString(getOldPasswordValue())) {
        return magicMessage('warning', 'old_password_not_entered');
    }
    if (isStringContainsSpace(getNewPasswordValue())) {
        return magicMessage('warning', 'password_no_spaces');
    }
    if (isEmptyString(getNewPasswordValue())) {
        return magicMessage('warning', 'password_not_entered');
    }
    if (isShortString(getNewPasswordValue())) {
        return magicMessage('warning', 'password_too_short');
    }
    if (!isStringContainsNumbers(getNewPasswordValue())) {
        return magicMessage('warning', 'password_one_number');
    }
    if (!isStringContainsLowerCases(getNewPasswordValue())) {
        return magicMessage('warning', 'password_lowercase');
    }
    if (!isStringContainsUpperCases(getNewPasswordValue())) {
        return magicMessage('warning', 'password_uppercase');
    }
    if (!isStringsEqual(getNewPasswordValue(), getNewConfirmPasswordValue())) {
        return magicMessage('warning', 'password_confirm_not_match');
    }
    return magicMessage('positive', 'password_met_requirements');
}

/**
 * Changes password
 */
function changePassword() {
    var magicMessageType = validateFormFields().type();
    if (magicMessageType == 'positive') {
        yooAjax('.change_password', {
            url: '/api/v4/profile/change_password',
            data: {
                'oldPassword' : getOldPasswordValue(),
                'newPassword' : getNewPasswordValue(),
            },
            success: function (json) {
                resetFormFields();
                var magic = magicMessage('positive', 'password_password_changed');
                var returnUrl = gupDecoded('returnUrl');
                if ($.cookie('Authorization') !== false) {
                    $.cookie('Authorization', null);
                }
                if (returnUrl) {
                    magic.addLink(returnUrl, 'password_redirect_back_link');
                    window.location=returnUrl;
                } else {
                    magic.addLink('/', 'password_redirect_back_link');
                }
            },
            fault_invalidPasswordFault: function(json) {
                magicMessage('negative', 'password_invalid_old_password');
                return;
            }
        });
    }
}

$(document).ready(function () {

    yooAjax('#password_dialog', {
        url: '/api/v4/profile/get_me?withAuthenticationInformation',
        success: function (json) {
            var temporaryToken = json.authenticationInformation.temporary;
            if (temporaryToken) {
                $('#old_password_section').hide();
                $('#password').focus();
            } else {
                $('#old_password_section').focus();
            }
        }
    });

    $('#password, #password_confirm, #password_old').keyup(function() {
        validateFormFields();
    });

});