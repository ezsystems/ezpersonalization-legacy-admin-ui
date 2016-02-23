/**
 * Created with JetBrains PhpStorm.
 * User: maik.seyring
 * Date: 10.06.13
 * Time: 15:46
 * To change this template use File | Settings | File Templates.
 */

define(['app/api/base',
	'jquery',
	'app/tools/ajaxError'],
	function(api, $, handleAjaxErrors){

	var baseURL = '/ebl/v4/';
	api.getABTest = function(id){
		return api.getMandatorId().then(
			function(mandatorId){
				return $.ajax({
					'type': 'GET',
					'url': baseURL +  mandatorId + '/abtest/get_abtest/' + id
				});
			});
	};

	api.getABTestList = function(mandatorId){
		return $.ajax({
			'type': 'GET',
			'url': baseURL + mandatorId + '/abtest/get_abtest_list'
		});
	};

	api.saveABTest = function(test){
		return api.getMandatorId()
			.then(function(mandatorId){
				if(test.id){ //test has a id and will be updated
					return $.ajax({
						'type': 'POST',
						'dataType': 'json',
						'contentType': 'application/json',
						'url': baseURL + encodeURIComponent(mandatorId) + '/abtest/update_abtest',
						'data': JSON.stringify(test.export())
					});
				}else{ //new test without id
					delete test.id;
					return $.ajax({
						'type': 'POST',
						'dataType': 'json',
						'contentType': 'application/json; charset=UTF-8',
						'url': baseURL + encodeURIComponent(mandatorId) + '/abtest/create_abtest',
						'data': JSON.stringify(test.export())
					});
				}
			}).then(
				function(testPack){
					test.init(testPack);
					return test;
				},
				handleAjaxErrors
			);
	};

	api.deleteABTest = function(id){
		return api.getMandatorId()
			.then(function(mandatorId){
				return $.ajax({
					'type': 'POST',
					'contentType': 'application/json; charset=UTF-8',
					'url': baseURL + mandatorId + '/abtest/delete_abtest',
					'data': JSON.stringify(id)
					})
					.fail(
						function(jqXHR){
							console.log(jqXHR);
							handleAjaxErrors(jqXHR);
					});
			});

	};

	api.getABTestSignificance = function(test, mandatorId){
		return $.ajax({
			'type': 'GET',
			'dataType': 'json',
			'url': baseURL + encodeURIComponent(mandatorId) + '/abtest/significance_test/' + encodeURIComponent(test.id),
			'data': {'granularity': 'P1D'}
		});
	};

	api.getABTestResults = function(test){
		var mandatorId;
		return api.getMandatorId()//load the current mandator Id
			.then(function(mId){
                mandatorId = mId;
				window.open('/abtest/#/'+ mandatorId + '/' + test.id +'/revenue/all');
			});
	};

	api.getScenario = function(id){
		return this.getMandator()
			.then(
				function(mandator){
					return api.getScenarios(mandator.name);
				}
			)
			.then(
				function(scenarios){
					var l = scenarios.length,
						scenario;
					while(l--){
						scenario = scenarios[l];
						if(scenario.referenceCode === id){
							return scenario;
						}
					}
					//we have no scenario for the specified id
					return id;
				}
			);

	};
	return api;
});