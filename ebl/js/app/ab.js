/**
 * Created with JetBrains PhpStorm.
 * User: maik.seyring
 * Date: 26.06.13
 * Time: 16:13
 * To change this template use File | Settings | File Templates.
 */

define(['app/api/ab', 'app/tools/helper', 'app/gui/ab', 'app/models/Test', 'jquery', 'app/jqplugins/jquery-ui'],
	function   (api, helper, gui, Test, $) {
	
		var wasload = false;
		function initABApp(){
			api.getMandator(null, true)
				.then(function(mandator){
//					console.log(mandator);
					return $.when(api.getABTestList(mandator.name), api.getScenarios(mandator.name, true), mandator.name);
				},
				function(){
					//TODO: handle mandator loading errors
				}
			)
				.then(function(list, scenarios, mandatorId){
					var l = list[0].length,
						tests = [],
						test,
						promises = [];//keeps all promises from the asynchronous loading of the Test Objects

					while(l--){
						test = new Test(list[0][l]);
						tests.push(test);
						promises.push(test.ready); //collect the promises
					}

					$.when.apply({}, promises).then( //wait for all tests to finish initialization
						function(){
							gui.initTestList(tests); //init the test list
						}
					);

					gui.initTestEditor(mandatorId, scenarios);
					if(!wasload){
						gui.initTestEditorOnce();
						wasload = true;
					}
					//init the tabs to show the Tests
//					gui.initTabs();
					gui.initHelp();
					gui.initResultView();
					gui.initTooltips();
					//
					gui.initCloseOverlay();
				},
				function(){
					//TODO: handle test and scenario loading error
				});
		}
		initABApp();

		$(document).on('mandatorChanged', initABApp);
	});
