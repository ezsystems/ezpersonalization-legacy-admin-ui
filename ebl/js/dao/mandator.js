


/** Scenario DAO service. It loads and updates single scenarios.<br><br>
 * 
 */
var mandatorDao = {
	mandator: null,
	error:null
};


mandatorDao.getId = function() {
	
	if (this.mandator) {
		return this.mandator.baseInformation.id;
	} else {
		return null;
	}
}


mandatorDao.getVersion = function() {
	
	if (this.mandator) {
		return this.mandator.baseInformation.version;
	} else {
		return null;
	}
}
	

mandatorDao.init = function(mandatorId, callback) {
	
	if (!mandatorId) {
		return;
	}
	
	var result = $.ajax({
		dataType: "json",
		url: "/api/v4/base/get_mandator/" + encodeURIComponent(mandatorId) + "?advancedOptions&itemTypeConfiguration&productInformation",
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


mandatorDao.loadRegistrationData = function(blurSelector, callback) {
	return yooAjax(blurSelector, {
		url: "/api/v4/base/get_mandator/" + encodeURIComponent(this.getId()) + "?registrationData",
		success: function(json) {
			if (callback) {
				callback(json.registrationData);
			}
		}
	});
}


/** Returns the coma code like 'IBS' or 'PACTAS', if the current mandator provides one.
 *  Otherwise return <code>null</code>. 
 */
mandatorDao.getProductComa = function() {
	if (this.mandator == null) {
		return null;
	}
	
	var product = this.mandator.product
	
	if (product == null) {
		return null;
	}
	
	var comaId = this.mandator.product.comaId;
	
	if (! comaId) {
		return null;
	}
	
	return comaId.coma;
}

