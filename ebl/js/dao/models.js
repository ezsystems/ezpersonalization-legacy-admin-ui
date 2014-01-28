


/** Model DAO service. It loads and caches all the models available for the
 *  mandator.<br><br>
 * 
 *  Include it using "include" function and call "init" like this:<pre>
 *  include(["/js/dao/models.js"]).then(function() {
 *	   return modelDao.init(customerID);
 *  })
 * </pre>
 * 
 */
var modelDao = {
	customerID: null,
	models: [],
	error: null
};
	
	
modelDao.init = function(customerID, callback) {
	
	modelDao.customerID = customerID;
	
	var result = $.when(
		modelDao.loadModels(customerID)
	).done(function(json) {
		if (callback) {
			callback();
		}
	});
	return result;
};


/** Returns a model name key for I18N engine. */
modelDao.getModelNameKey = function(refcode) {
	
	var model = modelDao.getModel(refcode);
	
	if (! model) {
		return null;
	}
	
	var additionalModelName = 'model_' + model.modelType;
	
	if (model.keyEventType != null) {
		additionalModelName = additionalModelName + '_' + model.keyEventType;
	}
	
	if (model.valueEventType != null) {
		additionalModelName = additionalModelName + '_' + model.valueEventType;
	}
	
	if (model.modelType === 'EDITOR_BASED') {
		additionalModelName = additionalModelName + '_' + (model.referenceCode === 'editor_blacklist' ? 'editor_blacklist' : 'editorial_list');
	}
	
	return additionalModelName;
};


modelDao.getModel = function(refcode) {
	for (var i in modelDao.models) {
		if (modelDao.models[i].referenceCode == refcode) {
			return modelDao.models[i];
		}
	}
	return null;
};


modelDao.getModels = function() {
	return modelDao.models;
};
	
	
modelDao.loadModels = function(customerID) {

	var result =  $.ajax({
		  dataType: "json",
		  statusCode: {
			  401: function(jqXHR, textStatus, errorThrown) {
				  $.cookie('password', null);
				  $.cookie('email', null);
				  window.parent.location = "login.html";
			  }
		  },
		  url: "ebl/v3/" + modelDao.customerID + "/structure/get_model_list?no-realm",
		  success: function(json) {
			  modelDao.models = json.modelList;
			  console.debug("Model list sucessfully loaded.");
		  },
		  
		  error: function(jqXHR, textStatus, errorThrown) {
			  modelDao.error = {
				  message: "Error loading model list.",
				  status:  jqXHR.status
			  };
		  }
	});
	
	return result;
};
