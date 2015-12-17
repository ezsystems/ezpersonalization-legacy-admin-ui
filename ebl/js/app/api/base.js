/**
 * Created with JetBrains PhpStorm.
 * User: maik.seyring
 * Date: 10.06.13
 * Time: 15:45
 * To change this template use File | Settings | File Templates.
 */

define([
	'app/tools/ajaxError',
	'jquery',
	'app/jqplugins/jquery.cookie'],
	function(stdAjaxErrorHandler, $){
	var api = {};
	/**
	 * loads the mandator
	 * @param name optional
	 * @returns {*}
	 * @author maik.seyring
	 */
	var mandator;

	api.getMandator = function(name, force) {
		//use the already fetched mandator if it exists and the reload is not forced
		if(mandator && !force && (!name || mandator.name === name)) {
			return $.Deferred().resolve(mandator).promise();
		} else {
			name = name ? name : $.cookie('customerID'); //use the provided name or the mandator name stored in 'customerID' cookie
			if(!name){ return $.Deferred().reject();}
			return $.ajax({
				'type': 'GET',
				'url': 'ebl/v3/profile/get_mandator/' + name,
				'dataType': 'json'
			})
				.then(
				function(response) {
					mandator = response.mandator; //save the mandator for future requests
					return mandator;
				},
				stdAjaxErrorHandler
			);
		}
	};

	api.getMandatorId = function(){
		return api.getMandator()
			.then(
				function(mandator){
					return mandator.name;
				}
			);
	};

	/**
	 * saves a model on the server
	 * @param model
	 * @returns {*}
	 */
	api.saveModel = function saveModel(model) {
		return $.ajax({
			type: "POST",
			beforeSend: function(x) {
				if(x && x.overrideMimeType) {
					x.overrideMimeType("application/json;charset=UTF-8");
				}
				x.setRequestHeader('no-realm', 'realm1');
			},
			mimeType: "application/json",
			contentType: "application/json;charset=UTF-8",
			dataType: "json",
			data: JSON.stringify(model),
			url: "ebl/v3/" + api.mandator + "/structure/update_model"
		});
	};

	api.getSubModel = function(){
		return  $.ajax({
			dataType: "json",
			beforeSend: function(req) {
				req.setRequestHeader('no-realm', 'realm1');
			},
			url: "ebl/v3/" + customerID + "/structure/get_submodel/"
				+ modelID + "/" + type + "/" + attributeKey
		});
	};

	//api.saveSubmodel = function saveSubmodel(subModel, subModelRef) {
	//	return $.ajax({
	//		type: "POST",
	//		beforeSend: function(x) {
	//			if(x && x.overrideMimeType) {
	//				x.overrideMimeType("application/json;charset=UTF-8");
	//			}
	//			x.setRequestHeader('no-realm', 'realm1');
	//		},
	//		mimeType: "application/json",
	//		contentType: "applicationjson;charset=UTF-8",
	//		dataType: "json",
	//		data: JSON.stringify(subModel),
	//		url: "ebl/v3/" + customerID + "/structure/update_submodel/"
	//			+ subModelRef
	//	});
	//};


	api.getAttributeValue = function getAttributeValues(attributeKey, type, customerId) {
		return $.ajax({
			'type': 'GET',
			'dataType': "json",
			'beforeSend': function(req) {
				req.setRequestHeader('no-realm', 'realm1');
			},
			'url': "ebl/v3/" + customerId + "/structure/get_attribute_values/"
				+ type + "/" + attributeKey,
			'error': stdAjaxErrorHandler
		});
	};

	/**
	 * load all available scenarios
	 * @param customerId
	 * @returns {*}
	 */
	var scenarios;
	api.getScenarios = function(customerId, force){
		if(!scenarios || force){
			return $.ajax({
				'type': 'GET',
				'dataType': "json",
				'url': "ebl/v3/" + customerId + "/structure/get_scenario_list"
			})
			.then(
				function(list){
					scenarios = list.scenarioInfoList;
					return scenarios;
				}
			);
		}
		return $.Deferred().resolve(scenarios).promise();
	};

	return api;
});


