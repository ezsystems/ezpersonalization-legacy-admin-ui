
/**
 * @typedef {object} StandardFilterSet
 * @property {number} maximalItemAge
 * @property {number} minimalItemPrice
 * @property {boolean} excludeItemsWithoutPrice
 * @property {string} excludeCheaperItems
 * @property {boolean} excludeContextItems
 */

/** Scenario DAO service. It loads and updates single scenarios.<br><br>
 * 
 */
var scenarioDao = {
	customerID: null,
	scenario: null,

	/** @member {StandardFilterSet} */
	standardFilterSet: null,
	profileFilterSet: null,
	error:null
};
	
	
scenarioDao.init = function(customerID, refcode, withFilters) {
	scenarioDao.customerID = customerID;
	
	var result;
	
	if (withFilters) { 
		result =  $.when(
			scenarioDao.loadScenarioOnly(refcode),
			scenarioDao.loadFilterStandard(refcode),
			scenarioDao.loadFilterProfile(refcode)
		);
	} else {
		result =  $.when(
			scenarioDao.loadScenarioOnly(refcode)
		);
	} 
	
	return result;
};


scenarioDao.reload  = function() {
	return scenarioDao.init(customerID, scenario.referenceCode, filterStandard != null);
};


scenarioDao.loadScenarioOnly = function(refcode) {
	
	if (!refcode) {
		var scenario = {};
		scenario.title = null;
		scenario.referenceCode = null;
		scenario.inputItemType = 0;
		scenario.description = null;
		scenario.outputItemTypes = [];
		
		scenarioDao.scenario = scenario;
		
		return;
	}
	
	var m = encodeURIComponent(scenarioDao.customerID);
	var r = encodeURIComponent(refcode ? refcode : "");
	
	var result =  $.ajax({
		url: "ebl/v3/" + m + "/structure/get_scenario/" + r + "?no-realm",
		
		dataType: "json",
		success: function(json) {
			console.debug("Scenario configuration for [" + reference_code + "] sucessfully loaded.");
			  
			scenarioDao.scenario = json.scenario;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			scenarioDao.error = {
				message: "Error loading scenario [" + customerID + "." + refcode + "]",
				status:  jqXHR.status
			};
		}
	});
	
	return result;
};



scenarioDao.loadFilterStandard = function(refcode) {
	
	var m = encodeURIComponent(scenarioDao.customerID);
	var r = encodeURIComponent(refcode ? refcode : "");
	
	var result = $.ajax({
		dataType: "json",
		url: "/api/v3/" + m + "/structure/get_filter_set/standard" + (r ? "/" + r : "")  + "?no-realm",
		success: function(json){
			console.debug("Standard filter configuration for [" + reference_code + "] sucessfully loaded.");
			
			scenarioDao.standardFilterSet = json.standardFilterSet;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			scenarioDao.error = {
			    message: "Error loading filters for scenario [" + customerID + "." + refcode + "]",
				status:  jqXHR.status
			};
		}
	});	
	
	return result;
};


scenarioDao.loadFilterProfile = function(refcode) {
	
	var m = encodeURIComponent(scenarioDao.customerID);
	var r = encodeURIComponent(refcode ? refcode : "");
	
	var result = $.ajax({
			dataType: "json",
			beforeSend: function (req) {
			req.setRequestHeader('no-realm', '1');
		},
		url: "/api/v3/" + m + "/structure/get_filter_set/profile" + (r ? "/" + r : "") + "?no-realm",
		success: function(json){
			console.debug("Profile filter configuration for [" + reference_code + "] sucessfully loaded.");
			
			scenarioDao.profileFilterSet = json.profileFilterSet;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			scenarioDao.error = {
			    message: "Error loading filters for scenario [" + customerID + "." + refcode + "]",
				status:  jqXHR.status
			};
		}
	});
	
	return result;
};