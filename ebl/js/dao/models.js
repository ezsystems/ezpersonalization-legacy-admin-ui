


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


/**
 * save a model on the server
 * @param model - Model Object to be saved
 *
 * @author maik.seyring
 */
modelDao.updateModel = function(model, callback, errorCallback) {
	return $.ajax({
		type:        "POST",
		mimeType:    "application/json",
		contentType: "application/json;charset=UTF-8",
		dataType:    "json",
		data:        JSON.stringify(model),
		url:         "ebl/v3/" + encodeURIComponent(modelDao.customerID) + "/structure/update_model?no-realm",
		success:     function (json) {
			var model = json.model;
			for (var i in modelDao.models) {
				if (modelDao.models[i].referenceCode == json.referenceCode) {
					modelDao.models[i] = model;
				}
			}
			if (callback) {
				callback(model);
			}
		},
		error: errorCallback
	});
};


modelDao.loadAttributes = function(callBack, callBackError) {
	  return $.ajax({
		  dataType: "json",
		  url: "ebl/v3/" + customerID + "/structure/get_attribute_pks?no-realm",
		  success: function(json) {
			  if (callBack) {
				  callBack(json.attributePkList);
			  }
		  },
		  error: callBackError
	  });
};


modelDao.loadSubmodels = function(modelRefcode, callBack, callBackError) {
	
	return $.ajax({
		  dataType: "json",
		  url: "ebl/v3/" + encodeURIComponent(customerID) + "/structure/get_submodel_list/" + encodeURIComponent(modelRefcode) + "?no-realm",
		  success: function(json) {
			  if (callBack) {
				  callBack(json.submodelList);
			  }
		  },
		  error: callBackError
	});
};


/** Returns attribute by key and type */
modelDao.getAttribute = function(key, type, attributes) {
	  for (var i = 0; i < attributes.length; i++) {
		  if(key == attributes[i].key && type == attributes[i].type) {
			  return attributes[i];
		  }
	  }
	  return null;
};


modelDao.loadSubmodelsAndAttributes = function(modelRefcode, callBack, callBackError) {

	var attributes = [];
	var submodels = [];
	
	return $.when(
		  modelDao.loadAttributes(
			  function (json) {
				  attributes = json;
			  }, callBackError),
			  
		  modelDao.loadSubmodels(modelRefcode, 
			  function (json) {
		  		  submodels = json;
	  		  }, callBackError)
	).then(function() {

	  for (var j = 0; j < current_submodels.length; j++) { // append attributes, if they exist only in submodel configuration
		  var smodel = current_submodels[j];
		  
		  if ( ! modelDao.getAttribute(smodel.attributeKey, smodel.submodelType, attributes)) {
			  attributes.push({ 'key': smodel.attributeKey, 'type': smodel.submodelType });
		  }
	  } 
		
	  if (callBack) {
		  callBack(submodels, attributes);
	  }
	});
};


modelDao.updateModelWithSubmodels = function(model, submodels, callback, errorCallback) {
	
	var modelResult = [];
	var submodelResults = [];
	var errorResult = null;
	
	var tasks = [];
	
	for (var i in submodels) { // we trigger the save for all submodels
		arr.push($.ajax({
			  type: "POST",
			  mimeType: "application/json",
			  contentType: "application/json;charset=UTF-8",
			  dataType: "json",
			  data: JSON.stringify(submodels[i]),
			  url: "ebl/v3/" + encodeURIComponent(modelDao.customerID) + "/structure/update_submodel/" + encodeURIComponent(model.referenceCode) + "?no-realm",
			  success: function(json) {
				  submodelResults.push(json.submodel);
			  },
			  error: function(jqXHR, textStatus, errorThrown) {
				  errorResult = [jqXHR, textStatus, errorThrown];
			  }
		  }));
	}
	
	tasks.push(modelDao.updateModel(model, function(m) {
		modelResult = m;
	}));

	$.when.apply($, tasks).then(
		function() {
			callback(modelResult, submodelResults);
		},
		function() {
			if (errorCallback) {
				if (errorResult) {
					errorCallback(errorResult[0], errorResult[1], errorResult[2]);
				} else {
					errorCallback();
				}
			}
		}
	);
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
		  url: "ebl/v3/" + encodeURIComponent(modelDao.customerID) + "/structure/get_model_list?no-realm",
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
