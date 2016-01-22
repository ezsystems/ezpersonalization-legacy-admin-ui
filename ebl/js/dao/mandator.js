/**
 * @typedef {object} Mandator
 * @property {MandatorBaseInformation} baseInformation
 * @property {MandatorAdvancedOptions} advancedOptions
 */

/**
 * @typedef {object} MandatorBaseInformation
 * @property {string} id
 * @property {string} website
 * @property {string} alphanumericItems
 */

/**
 * @typedef {object} MandatorAdvancedOptions
 * @property {string} adminEmail;
 * @property {string} website;
 * @property {string} timeZone;
 * @property {string} currency;
 * @property {number} currencyFractionDigits;
 * @property {boolean} trackerItemUpdate;
 * @property {number} userSessionMinutes;
 */

/**
 * @typedef {object} CustomerV3
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} company
 * @property {string} phone
 * @property {string} email
 * @property {AddressV3} address
 */

/**
 * @typedef {object} AddressV3
 * @property {string} street
 * @property {string} zip
 * @property {string} city
 * @property {string} country
 */


/** Scenario DAO service. It loads and updates single scenarios.<br><br>
 *  @member {Mandator}
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


mandatorDao.getCurrency = function() {
	if (this.mandator) {
		return this.mandator.advancedOptions.currency;
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
};


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
};


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
			
			var event = new CustomEvent('mandator_loaded', { 'detail': mandatorDao.mandator });
			document.dispatchEvent(event);
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
};


/**
 * @param {CustomerV3} customer
 */
mandatorDao.injectCustomer = function(customer) {
	if ( ! this.mandator) {
		return;
	}
	if ( ! this.mandator.customer) {
		this.mandator.customer = {};
	}

	this.mandator.customer.firstName = customer.firstName;
	this.mandator.customer.lastName  = customer.lastName;
	this.mandator.customer.company   = customer.company;
	this.mandator.customer.phone     = customer.phone;
	this.mandator.customer.email     = customer.email;

	if (customer.address) {
		if ( ! this.mandator.customer.address) {
			this.mandator.customer.address = {};
		}
		this.mandator.customer.address.street  = customer.address.street;
		this.mandator.customer.address.zip     = customer.address.zip;
		this.mandator.customer.address.city    = customer.address.city;
		this.mandator.customer.address.country = customer.address.country;
	}
};


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
};

