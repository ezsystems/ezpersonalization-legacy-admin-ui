


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
};


mandatorDao.getVersion = function() {
	
	if (this.mandator) {
		return this.mandator.baseInformation.version;
	} else {
		return null;
	}
};


mandatorDao.getDefaultItemTypeId = function() {
	if (this.mandator == null) {
		return null;
	}
	
	var result = this.mandator.baseInformation.defaultType;
	
	return result;
};


mandatorDao.isAlphanumericItems = function() {
	if (this.mandator == null) {
		return null;
	}
	
	var result = (this.mandator.baseInformation != "NUMERIC");
	
	return result;
};


mandatorDao.getItemTypes = function() {
	if (this.mandator == null) {
		return null;
	}
	
	var result = this.mandator.itemTypeConfiguration.types;
	
	if (!result || result.length == 0) {
		result.push({id : 1, description : 'Product'});
		
		if (mandator.baseInformation.version == 'EXTENDED') {
			result.push({id : 2, description : 'Article'});
			result.push({id : 3, description : 'Image'});
			result.push({id : 4, description : 'Media'});
			result.push({id : 5, description : 'User generated'});
		}
	}
	
	return result;
}


mandatorDao.getItemTypeDescription = function(id) {
	if (this.mandator == null) {
		return null;
	}
	
	var result = null;
	
	this.getItemTypes().forEach(function(itemType) {
	    if (itemType.id == id) {
	    	result = itemType.description;
	    }
	});
	
	return result;
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

