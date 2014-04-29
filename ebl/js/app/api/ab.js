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
		var mandatorId,
			significance,
			success = false;
		return api.getMandatorId()//load the current mandator Id
			.then(function(mId){
				mandatorId = mId;
				return api.getABTestSignificance(test, mandatorId);//load the significance results
			})
			.then(function(result){
				significance = result;
//********** for debug **************//TODO ensure removal on going live
//				result.sizeTest.result = "PASSED";
//				result.differenceTest.result = 'PASSED';
//				result.studentTest.result = 'PASSED';
//********** for debug **************//
				if(result.sizeTest.result === "PASSED" &&
					result.differenceTest.result === 'PASSED' &&
					result.studentTest.result === 'PASSED'){

					success = true;
					return $.ajax({	//if all tests were successful load the test results and pass them to the next function
						'type': 'GET',
						'dataType': 'json',
						'url': baseURL + encodeURIComponent(mandatorId) + '/statistic/abtest/' + encodeURIComponent(test.id),
						'data': {'granularity': 'P1D'}
					});
				}
				return true; // the test failed and we skipped the fetching of the results

			}).then(
				function(data){
					var tmp = {
						'success' : success,
						'significance' : significance,
						'current' : null,
						'other' : null
					};
					if($.isArray(data)){ //if we fetched the results we get an array here other wise we ge the true value from the return above
						var i = 0,
							l = data.length,
							current =
								{
									'clickedRecommendedData': [],
									'clickedRecommended': 0,
									'purchasedRecommendedData': [],
									'purchasedRecommended': 0,
									'consumeEventsData': [],
									'consumeEvents': 0,
									'revenueData': [],
									'revenue': 0,
									'currency': {
										'currencyCode' : 'EUR'
									}
								},
							other =
								{
									'clickedRecommendedData': [],
									'clickedRecommended': 0,
									'purchasedRecommendedData': [],
									'purchasedRecommended': 0,
									'consumeEventsData': [],
									'consumeEvents': 0,
									'revenueData': [],
									'revenue': 0,
									'currency': {
										'currencyCode' : 'EUR'
									}
								},
							day;
						for(; i < l; i++){
							day = data[i];
							current.clickedRecommendedData.push(day.current.clickedRecommended);
							other.clickedRecommendedData.push(day.other.clickedRecommended);
							current.clickedRecommended += day.current.clickedRecommended;
							other.clickedRecommended += day.other.clickedRecommended;
							current.purchasedRecommendedData.push(day.current.purchasedRecommended);
							other.purchasedRecommendedData.push(day.other.purchasedRecommended);
							current.purchasedRecommended += day.current.purchasedRecommended;
							other.purchasedRecommended += day.other.purchasedRecommended;
							current.consumeEventsData.push(day.current.consumeEvents);
							other.consumeEventsData.push(day.other.consumeEvents);
							current.consumeEvents += day.current.consumeEvents;
							other.consumeEvents += day.other.consumeEvents;
							current.revenueData.push(day.current.revenue);
							other.revenueData.push(day.other.revenue);
							current.revenue += day.current.revenue;
							other.revenue += day.other.revenue;
						}

						tmp.current = current;
						tmp.other = other;
					}
					return tmp; //return the collection of significance and result data
				}
			);
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