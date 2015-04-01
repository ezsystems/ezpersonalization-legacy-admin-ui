/**
 * Created with JetBrains PhpStorm.
 * User: maik.seyring
 * Date: 13.06.13
 * Time: 10:40
 * To change this template use File | Settings | File Templates.
 */

define(['app/tools/helper'],function(helper){
	return function stdAjaxErrorHandler(jqXHR) {
		console.log(jqXHR);
		switch(jqXHR.status) {
			case 400:
				helper.setMessagePopUp("problem", "error_server_error_400");
				break;
			case 401:
				helper.setMessagePopUp("problem", "error_server_error_401");
				break;
			case 403:
				helper.setMessagePopUp("problem", "error_server_error_403");
				break;
			case 404:
				helper.setMessagePopUp("problem", "error_server_error_404");
				break;
			case 409://test case
				helper.setMessagePopUp("problem", "error_server_error_409_" + jqXHR.responseJSON.faultCode);
				break;
			default:
				helper.setMessagePopUp("problem", "error_server_error");
		}
		return jqXHR;
	};
});