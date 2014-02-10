


/** Scenario DAO service. It loads and updates single scenarios.<br><br>
 * 
 */
var mandatorDao = {
	mandator: null,
	error:null
};
	


mandatorDao.init = function(mandatorId, callback) {
	
	var result = $.ajax({
		dataType: "json",
		url: "/api/v4/base/get_mandator/" + encodeURIComponent(mandatorId) + "?advancedOptions&itemTypeConfiguration&no-realm",
		success: function(json) {
			mandatorDao.mandator = json;
			if (callback) {
				callback(json);
			}
		},
		error : function(jqXHR, textStatus, errorThrown) {
			mandatorDao.error = {
				message: "Error loading mandator [" + mandatorId + "]",
				status:  jqXHR.status
			};
        }
	});
	return result;
};

