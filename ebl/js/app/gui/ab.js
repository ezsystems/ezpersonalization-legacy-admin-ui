/**
 * Created with JetBrains PhpStorm.
 * User: maik.seyring
 * Date: 14.06.13
 * Time: 12:00
 * To change this template use File | Settings | File Templates.
 */

define([
		'app/api/ab',
		'app/models/Test',
		'jquery',
		'app/tools/ajaxError',
		'app/tools/helper'
	],function(api, Test, $, handleAJAXError, helper){
	var gui = {};

	gui.showOverlay = function(id){
		var $overlay = $(id);
		if($overlay.length){
			$('#cover').show();
			$overlay.show();
		}
		return $overlay;
	};

	gui.hideOverlay = function(close){
		$(close).closest('.ABOverlay').hide();
		$('#cover').hide();
	};

	gui.initCloseOverlay = function(){
		$('body').on('click', '.closeOverlay', function(){
			$(this).closest('.ABOverlay').hide();
			$('#cover').hide();
		});
	};

	gui.showHelp = function(){
		var $overlay = $('#abHelp');
		$overlay.find('accordion').accordion({'header': 'h3'});
		
	};
	var startDate =  Date.now() + (24*3600*1000);
	var endDate =  Date.now() + (7*24*3600*1000);
	var emptyTest = {
		'abtest' : {
			'id' : null,
			'description': '',
			'currentScenario' : '',
			'otherScenario' : '',
			'percentUser' : 10,
			'startDate' : startDate,
			'endDate' : endDate
		},
		'status' : 'NEW',
		'inputItemType' : 1,
		'outputItemTypes' : 'Set'
	};

	var $confirm = $('#confirm');
	gui.showConfirm = function(args){
		var dfrd = $.Deferred().always(function(){$confirm.hide();}),
			classes = args.classes ? args.classes : {},
			name,
			$reject,
			$accept;
		$reject = $confirm.find('.reject')
			.attr('data-translate', args.rejectStr ? args.rejectStr : 'Cancel')
			.off('click')
			.on('click', function(){dfrd.reject();})
			.addClass(typeof classes.reject === 'string' ? classes.reject : '');
		$accept = $confirm.find('.confirm')
			.attr('data-translate', args.acceptStr ? args.acceptStr : 'OK')
			.off('click')
			.on('click', function(){dfrd.resolve();})
			.addClass(typeof classes.accept === 'string' ? classes.accept : '');
		$confirm.find('.msg').attr('data-translate', args.message ? args.message : 'provide_message');
		$confirm.find('.heading').attr('data-translate', args.heading ? args.heading : 'provide_heading');
		window.localizer();
		//after we got the localized strings, we replace the place holders
		if(args.placeHolders){
			for(name in args.placeHolders){
				if(typeof args.placeHolders[name] === "string"){
					$confirm.find('#'+name).html(args.placeHolders[name]);
				}
			}
		}
		$confirm.show();
		//remove the customized classes for the buttons on click
		dfrd.always(function(){
			$reject.removeClass(typeof classes.reject === 'string' ? classes.reject : '');
			$accept.removeClass(typeof classes.accept === 'string' ? classes.accept : '');

		});
		return dfrd.promise();
	};

	function Check(){
		this.errors = [];
	}

	Check.prototype.valid = true;

	Check.prototype.addFail = function(messageId){
		this.valid = false;
		this.errors.push('ab_test_error_' + messageId);
	};

	function checkTestConfiguration($overlay, tests){
		var check = new Check();
//		return check;
		var name = $overlay.find('#testName').val(),
			start = $overlay.find('#testStartDate').datepicker('getDate'),
			startTime = start.getTime(),
			duration = $overlay.find('#testDuration').val(),
//			end = $overlay.find('#testEndDate').datepicker('getDate'),
//			endTime = end.getTime(),
			endTime = startTime + (duration * 7 * 24 * 3600 *1000) - (24 *3600 * 1000),
			currentScenario = $overlay.find('#testCurrentScenario > option:selected').data('scenario'),
			otherScenario = $overlay.find('#testOtherScenario  > option:selected').data('scenario'),
			l,
			compStartTime,
			compEndTime,
			currentTest = $overlay.data('test'),
			test,
			percentUsers = parseInt($overlay.find('#testPercentUser').val(),10),
			incompatibleScenarios = false;

		if(!name.length){
			check.addFail('no_test_name');
		}

		if(isNaN(percentUsers)|| 1 > percentUsers || percentUsers > 50){
			check.addFail('invalid_user_share');
		}

		if(Date.now()> start.valueOf()){
			check.addFail('start_date_must_be_in_future');
		}

		//start date must be before end date
//		if(start.valueOf()> end.valueOf()){
//			check.errors.push('end_date_must_be_after_start');
//		}

		// we need two scenarios
		if(!(currentScenario && otherScenario)){
			check.addFail('select_2_scenarios');
		}

		// scenarios must not be the same
		else if(currentScenario === otherScenario){
			check.addFail('select_2_different_scenarios');
		}else{
			if(currentScenario.inputItemType === null || currentScenario.inputItemType === otherScenario.inputItemType){
				//check if output item types are compatible
				l = currentScenario.outputItemTypes.length;
				while(l--){
					if($.inArray(currentScenario.outputItemTypes[l], otherScenario.outputItemTypes) === -1){
						incompatibleScenarios = true;
						break;
					}
				}
			}else{
				incompatibleScenarios = true;
			}

			if(incompatibleScenarios){
				check.valid = false;
				check.addFail('incompatible_scenarios');
			}

			// test for overlapping tests with same current scenario
			l = tests.length;
			while(l--){
				test = tests[l];
				if(currentTest.id === test.id){//don't compare with self
					continue;
				}
				compStartTime = test.startDate.getTime();
				compEndTime = test.endDate.getTime();

				if((startTime >= compStartTime && startTime <= compEndTime) ||
					(endTime >= compStartTime && endTime <= compEndTime) ||
					(startTime <= compStartTime && endTime >= compEndTime)){

					//console.log(test.getIdOfA() + ' vs ' + currentScenario.referenceCode);
					if(test.getIdOfA() === currentScenario.referenceCode){
						check.valid = false;
						check.addFail('current_scenario_already_in_use');
					}
//				if(test.otherScenario === otherScenario.referenceCode){
//					check.valid = false;
//					check.addFail('other_scenario_already_used');
//				}
				}
			}

		}


		return check;
	}

	function showErrors(errors, $overlay){
		var l = errors.length,
			$errors = $overlay.find('.errors');
			$errors.html('');

		while(l--){
			$errors.prepend('<p data-translate="' + errors[l] + '">' + errors[l]+ '</p>');
		}
		window.localizer();
	}

	function deleteTest(){
		var $this = $(this),
			$test = $this.closest('.test'),
			test = $test.data('test'),
			active = test.isActive(),
			name = test.getName();
		gui.showConfirm({
			'heading': 'ab_test_confirm_delete_heading',
			'message': active ? 'ab_test_confirm_delete_cancel_msg' : 'ab_test_confirm_delete_msg',
			'acceptStr': 'ab_test_confirm_delete_accept',
			'rejectStr': 'ab_test_confirm_delete_reject',
			'classes': {
				'accept': 'delete',
				'reject': ''
			},
			'placeHolders': {
				'testName': name
			}
		}).then(
			function(){
				return	api.deleteABTest(test.id);
			},
			function(){return false;}
		).then(
			function(){
				var tests = $('#testList').data('tests'),
					index = $.inArray(test, tests);
				if(index !== -1){
					tests.splice(index, 1);
				}
				gui.updateTestList();
			}
		);
	}

	function updateTestResultGraph(){
		var $this = $(this),
			$tr = $this.closest('tr'),
			dataA = $tr.data('dataCurrent'),
			dataB = $tr.data('dataOther'),
			dates = $this.closest('table').data('dates'),
			yLabel = getLocalString('ab_test_result_indicator_'+ $tr.data('indicator')), //TODO remove implicit dependency
			lang = getLocalString('ab_test_result_date'),
//			tooltips = dataA.concat(dataB),
			graph;

		var l = 12, tooltips = [];
		while(l--){tooltips.push(l+'');}

		window.RGraph.Clear(document.getElementById('abTestResultCanvas'));
		graph = new window.RGraph.Line('abTestResultCanvas', dataA, dataB);
		graph.Set('chart.background.barcolor1', 'transparent');
		graph.Set('chart.background.barcolor2', 'transparent');
		graph.Set('chart.labels', dates);
//		graph.Set('chart.tickmarks', 'circle');
//		graph.Set('chart.labels.above', true);
//		graph.Set('spline', true);
//		graph.Set('chart.tooltips', tooltips);
		graph.Set('chart.key.position', 'gutter');
		graph.Set('chart.grouping', 'stacked');
		graph.Set('chart.key.background', 'transparent');
		graph.Set('chart.colors', ['rgba(255, 167, 57, 0.9)', 'rgba(98, 184, 188, 0.9)', 'rgba(204, 199, 158, 0.9)']);
		graph.Set('chart.shadow', false);
		graph.Set('chart.linewidth', 3);
		graph.Set('chart.yaxispos', 'left');
		graph.Set('chart.strokestyle', 'rgba(0,0,0,0)');
		graph.Set('chart.gutter.left', 40);
		graph.Set('chart.gutter.bottom', 40);
		graph.Set('chart.scale.formatter', myFormatter);
		graph.Set('chart.text.font', ['Istok Web, sans-serif']);
		graph.Set('chart.text.color', 'rgba(140, 150, 138, 1)');
		graph.Set('chart.text.size',8);
		graph.Set('chart.title.xaxis', lang);
		graph.Set('chart.title.yaxis', yLabel);
		graph.Set('chart.title.xaxis.size', 10);
		graph.Set('chart.title.yaxis.size', 10);
//		graph.Set('chart.title.yaxis.color', '#000000');

		graph.Draw();
	}

	function prepareTestResults($overlay, test, results){
		var indicators = ['clickedRecommended','purchasedRecommended','consumeEvents','revenue'],
			significants = ['differenceTest'],
			l,
			attr,
			valA,
			valB,
			ratio,
			warningStr,
			winA = 0,
			winB = 0,
			$winner,
			$warning = $overlay.find('#ABWarning'),
			$advice = $overlay.find('#ABSuccessAdvice'),
			$significance = $overlay.find('#abTestSignificance'),
			$indicators = $overlay.find('#abTestIndicators'),
			$indiGhost = $indicators.find('.ghost'),
			$chart = $overlay.find('#abTestResultChart'),
			$tr,
			$wrapper = $overlay.find('.contentWrapper');

		//set heading

		$overlay.find('.nameOfA').html(test.getNameOfA());
		$overlay.find('.nameOfB').html(test.getNameOfB());

		//remove all content from previous result
		$indicators.find('tbody>tr').not('.ghost').remove();

		//check if test was significant
		if(results.success){
			$indicators.show();
			$warning.hide();
			$chart.show();
			$advice.show();

			$significance.find('h3').attr('data-translate', 'ab_test_result_significant');

			//build scala for graph
			var diffDays = Math.round(Math.abs((test.startDate.getTime() - test.endDate.getTime())/(24*60*60*1000)));
			var increment = diffDays < 7 ? 1 : 7;
			var date = new Date(test.startDate.getTime());
			var dates = [];
			dates.push(test.startDate.getDate() + '/' + test.startDate.getMonth() );

			for(var i = 0; i < diffDays; i = i + increment){
				date.setDate(date.getDate()+ increment);
				dates.push(date.getDate() + '/' + date.getMonth());
			}

			$indicators.data('dates', dates);
			l = indicators.length;
			while(l--){
				attr = indicators[l];
				valA = results.current[attr];
				valB = results.other[attr];
				ratio = valB/valA;
				if(ratio > 1){
					winB++;
				}else if(ratio < 1){
					winA++;
				}
				$tr = $indiGhost.clone().removeClass('ghost');
				$tr.find('.description').attr('data-translate', 'ab_test_result_description_' + attr);
				$tr.find('.valueA').text(valA.toFixed(2) + (attr === 'revenue' ? (' ' + results.current.currency.currencyCode ) : ''));
				$tr.find('.valueB').text(valB.toFixed(2) + (attr === 'revenue' ? (' ' + results.other.currency.currencyCode ) : ''));
				$tr.find('.ratio').text(isNaN(ratio) ? '-' : (ratio*100).toFixed(2) + '%');
				$winner = $tr.find('.winner');
				if(isNaN(ratio) || ratio === 1){
					$winner.attr('data-translate', 'ab_test_result_no_winner');
				}else{
					$winner.removeAttr('data-translate').text(ratio >= 1? 'B (' + test.getNameOfB() +')' : 'A (' + test.getNameOfA() +')');
				}
				$tr.find('a').data('indicator', attr);
				$tr.data('dataCurrent', results.current[attr + 'Data']);
				$tr.data('dataOther', results.other[attr + 'Data']);
				$tr.data('indicator', attr);

				$indicators.prepend($tr);

				$('#abTestResultCanvas').attr('width', '600');
			}
			if(winA > 1 && winB === 0){
				$advice.attr('data-translate', 'ab_test_result_advice_a');
			}else if(winA === 0 && winB > 0){
				$advice.attr('data-translate', 'ab_test_result_advice_b');
			}else{
				$advice.attr('data-translate', 'ab_test_result_advice_indifferent');
			}
		}else{
			$indicators.hide();
			$warning.show();
			$chart.hide();
			$advice.hide();

			$significance.find('h3').attr('data-translate', 'ab_test_result_not_significant');

			if(
				results.significance.sizeTest.result === 'PASSED' &&
				results.significance.differenceTest.result === 'PASSED' &&
				results.significance.studentTest.result !== 'PASSED'
				){
				warningStr = 'ab_test_result_warning_t_t_f';
			}else if(
				results.significance.sizeTest.result === 'PASSED' &&
				results.significance.differenceTest.result !== 'PASSED' &&
				results.significance.studentTest.result !== 'PASSED'
				){
				warningStr = 'ab_test_result_warning_t_f_f';
			}else if(
				results.significance.sizeTest.result !== 'PASSED' &&
				results.significance.differenceTest.result === 'PASSED' &&
				results.significance.studentTest.result !== 'PASSED'
				){
				warningStr = 'ab_test_result_warning_f_t_f';
			}else if(
				results.significance.sizeTest.result !== 'PASSED' &&
				results.significance.differenceTest.result !== 'PASSED' &&
				results.significance.studentTest.result !== 'PASSED'
				){
				warningStr = 'ab_test_result_warning_f_f_f';
			}

			$warning.attr('data-translate', warningStr);
			i18n($warning);
		}

//		if(results.significance.differenceTest.result === 'PASSED'){
//			$('#differenceTest').attr('data-translate', 'ab_test_result_differenceTest_PASSED');
//		}else if(results.significance.differenceTest.result === 'FAILED'){
//			$('#differenceTest').attr('data-translate', 'ab_test_result_differenceTest_FAILED');
//		}else{
//			$('#differenceTest').removeAttr('data-translate').html('');
//		}
//
//		if(results.significance.sizeTest.result !== 'PASSED'){
//			$('#sizeTest').attr('data-translate', 'ab_test_result_sizeTest_FAILED');
//		}else{
//			$('#sizeTest').removeAttr('data-translate').html('');
//		}
//
//		if(results.significance.studentTest.result === 'PASSED'){
//			$('#studentTest').attr('data-translate', 'ab_test_result_studentTest_PASSED');
//		}else if(results.significance.studentTest.result === 'FAILED'){
//			$('#studentTest').attr('data-translate', 'ab_test_result_studentTest_FAILED');
//		}else if(results.significance.studentTest.result === 'SKIPPED'){
//			$('#studentTest').attr('data-translate', 'ab_test_result_studentTest_SKIPPED');
//		}else{
//			$('#studentTest').removeAttr('data-translate').html('');
//		}

		window.localizer();
		var strings = {
			'differenceTestThreshold': results.significance.differenceTest.threshold * 100,
			'differenceTestSizeA': results.significance.differenceTest.sizeA,
			'differenceTestSizeB': results.significance.differenceTest.sizeB,
			'sizeTestThreshold': results.significance.sizeTest.threshold
		};
		for (var name in strings){
			$('#' +name).html(strings[name]);

		}
		$wrapper.show();
	}

	function showTestResults(){
		var test = $(this).closest('.test').data('test'),
			$overlay = $('#abTestResults'),
			$wrapper = $overlay.find('.contentWrapper').hide(),
			$cover = $overlay.find('.cover').show();
			$overlay.find('.warning').hide();
			$overlay.find('#abTestIndicators').hide();
			$overlay.find('#abTestResultChart').hide();

		gui.showOverlay($overlay);
		api.getABTestResults(test)
			.then(
				function(results){
					prepareTestResults($overlay, test, results);
					$overlay.find('a.showGraph').first().trigger('click');
					$cover.hide();
					$wrapper.show();
				},
				function(){
					gui.hideOverlay($overlay);
					helper.setMessagePopUp('problem', 'ab_test_result_error_unable_to_fetch_results');
				});
	}

	function showTest(){
		var test = $(this).closest('.test').data('test');
		if(test.isEditable()){
			gui.editTest(test);
		}else{
			gui.showTest(test);
		}
	}

	var $wrapper;
	gui.initTestList = function(list, selector){
		var l;
		selector = typeof selector === 'string' ? selector : '#ABTests';
		$wrapper = $(selector);
		l = list.length;

		if(l){
			$wrapper.find('#noTests').hide();
			$wrapper.find('#testList').show();
			//fill the list with existing tests
			gui.updateTestList({'tests': list});
		}else{
			$wrapper.find('#noTests').show();
			$wrapper.find('#testList').hide();
			gui.clearTestList();
		}

		$wrapper.off('click');
		$wrapper.on('click', '.delete', deleteTest);
		$wrapper.on('click', '.results a', showTestResults);
		$wrapper.on('click', '.config a', showTest);

	};

	function prepareTestInList(test){
		var $test = $wrapper.find('.ghost').clone();
		$test.addClass('test');
		$test.removeClass('ghost');
		$test.find('.name').html(test.name);
		$test.find('.scenarios').html('"' + test.getNameOfA() + '"' + ' <span data-translate="ab_test_vs"></span> ' + '"' + test.getNameOfB() + '"');
		$test.find('.status').attr('data-translate', test.getStatus('ab_test_status_'));
		$test.find('.fromTo').html(test.getFrom() + ' - ' + test.getTo());
		if(test.isFinished()){
			$test.find('.results a').attr('data-translate', 'ab_test_view_results');
		}else{
			$test.find('.results a').attr('data-translate', 'ab_test_empty_string');
		}
		$test.find('.config a').attr('data-translate', test.isEditable() ? 'ab_test_edit_test_configuration' : 'ab_test_show_test_configuration');
		$test.find('.remove').find('a.delete').html(test.isDeleteable() ? '<span class="delete">X</span>' : '<span class="delete">X</span>');

		$test.data('test', test); //add a reference to the test to the dom element
		return $test;
	}

	/**
	 * updates the view of available tests
	 * @param args map of some configuration options
	 * @param order
	 */
	gui.updateTestList = function(args){
		var tests, l, m, orderAttr,
			i = 0, //iterator
			$testList = $('#testList'),
			$table = $testList.find('.table');
		if(args && args.tests && args.tests.length){
			tests = $testList.data('tests');
			tests = $.isArray(tests) ? tests : [];
			if(args.mode === 'insert'){
				$.merge(tests, args.tests);
			}else if(args.mode === 'update'){//we update the tests we already have and add additional test, which are not jet in the array
				m = args.tests.length;
				outer:
				while(m--){
					l = tests.length;
					while(l--){
						if(tests[l].id === args.tests[m].id){
							tests[l] = args.tests[m];
							continue outer;
						}
					}
					tests.push(args.tests[m]);
				}
			}
			else{
				tests = args.tests;
			}
		}else{
			tests = $testList.data('tests');
			tests = $.isArray(tests) ? tests : [];
		}

		//define the order of the tests
		orderAttr = args && (typeof args.order ==='string') ? args.order : 'startDate';

		//sort the list of tests
		tests = tests.sort(function(a,b){
			switch (orderAttr)
			{
				case 'startDate':
					return a.startDate.getTime() - b.startDate.getTime();
				//TODO: add more sort options
				default://used for all string comparison
					return a[orderAttr].localeCompare(b[orderAttr]);
			}
		});

		//rebuild the list of tests
		$testList.data('tests', tests);
		$table.find('.test').remove();
		l = tests.length;
		if(l){
			for(;i<l;i++){
				$table.append(prepareTestInList(tests[i]));
			}
			$testList.show();
			$('#noTests').hide();
			window.localizer();
		}else{
			$testList.hide();
			$('#noTests').show();
		}
	};

	gui.clearTestList = function(){
		var $testList = $('#testList');
		$testList.find('.test').remove();
		$testList.data('tests', []);
	};
	
	gui.initTestEditorOnce = function(){
		
		var $overlay = $('#abTestEditor');
		
		function checkConfig(){

			var check = checkTestConfiguration($overlay, $('#testList').data('tests'));

			showErrors(check.errors, $overlay);

			return check.valid;
		}
		
		//add click handler for save test
		$overlay.find('.save').on('click', function(){

			var test = $overlay.data('test'),
				tests =  $('#testList').data('tests'),
				check = checkTestConfiguration($overlay, tests),
				$cover = $overlay.find('.cover').show();

			if(check.valid){
				test.update($(this).closest('form'));
				test.ready
				.then( //wait until the scenarios are loaded and update the list of tests
					function(){
						return api.saveABTest(test);
					}
				).then(
					function(test){
						gui.updateTestList(
							{
								'tests': [test],
								'mode': 'update'
							}
						);
						gui.hideOverlay($overlay);
					},
					function(){
						$cover.hide();
					}
				);
			}
			else{
				showErrors(check.errors, $overlay);
				$cover.hide();
			}

		});

		$overlay.find('.cancel').on('click', function(){
			gui.hideOverlay($overlay);
		});
		
		//add change percentage handler
		$overlay.find('#testPercentUser').on('change', function(){
			var val = parseInt($(this).val(), 10);
			if(isNaN(val) || val > 50 || val < 1){
				$overlay.find('#participantsA').text('invalid');
				$overlay.find('#participantsB').text('invalid');
			}
			else{
				$overlay.find('#participantsA').text(val/2);
				$overlay.find('#participantsB').text(val/2);
			}
			checkConfig();
		});
		
	};

	gui.initTestEditor = function(customerId, scenarios){

		var $overlay = $('#abTestEditor'),
			$name = $('#testName'),
			$startDate = $('#testStartDate'),
			$duration = $('#testDuration'),
			tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate()+1);

		function checkConfig(){

			var check = checkTestConfiguration($overlay, $('#testList').data('tests'));

			showErrors(check.errors, $overlay);

			return check.valid;
		}

		$name.on('change', checkConfig);

		//configure the date picker
		$startDate
			.datepicker({'minDate': tomorrow})
			.on('change', checkConfig);

		$duration.on('change', checkConfig);

		//add options to the scenario selects

		var l = scenarios.length,
			scenario,
			$current = $overlay.find('#testCurrentScenario'),
			$other = $overlay.find('#testOtherScenario'),
			$option = $('<option></option>');

		//remove old options
		$current.children().remove();
		$other.children().remove();

		//add empty option
//		$current.append($option.clone());
//		$other.append($option.clone());
		while(l--){
			scenario = scenarios[l];
			$option.attr('value', scenario.referenceCode)
				.text(scenario.title ? scenario.title : scenario.referenceCode);
			$current.append($option.clone().data('scenario', scenario));
			$other.append($option.clone().data('scenario', scenario));
		}

		//event handler for date changed enable/disable scenarios used/not used in the time frame
		$overlay.find('select')
			.off('change')
			.on('change', checkConfig );

		$current.on('change', function(){
			var currentScenario = $(this).find('option:selected').data('scenario');
			$other.find('option').each(function(){
				var $this = $(this),
					otherScenario = $this.data('scenario'),
					l = currentScenario.outputItemTypes.length,
					compatible = true;
				if(currentScenario.inputItemType === null || currentScenario.inputItemType === otherScenario.inputItemType){
					while(l--){
						if($.inArray(currentScenario.outputItemTypes[l], otherScenario.outputItemTypes) === -1 ||
							currentScenario.referenceCode === otherScenario.referenceCode){
							compatible = false;
							break;
						}

					}
				}else{
					compatible = false;
				}
				if(compatible){
					$this.prop('disabled', false);
				}
				else{
					$this.prop('disabled', true);
				}

			});
		});
		//add event handler for the options change
		//disable options vice versa
	};


	gui.initResultView = function(){
		$('#abTestResults').on('click', 'a.showGraph', updateTestResultGraph);
	};

	gui.editTest = function(test){

		test = test ? test : new Test(emptyTest);

		var $overlay = $('#abTestEditor');
		$overlay.find('.cover').hide();
		//insert data of test into overlay
		$overlay.data('test', test);
		$overlay.find('#testName').val(test.name);
		$overlay.find('#testStartDate').datepicker('setDate',test.startDate);
		$overlay.find('#testPercentUser').val(test.percentUser).trigger('change');
		$overlay.find('#testCurrentScenario').val(test.getIdOfA());
		$overlay.find('#testOtherScenario').val(test.getIdOfB());
		$overlay.find('#testDuration').val(test.getDuration());
		$overlay.find('#testStatus').attr('data-translate', test.getStatus('ab_test_status_'));
		window.localizer();

		gui.showOverlay($overlay);

		var check = checkTestConfiguration($overlay, $('#testList').data('tests'));

		showErrors(check.errors, $overlay);
	};

	gui.showTest = function(test){
		var $overlay = $('#abTestViewer');
		//prepare the overlay
		$overlay.find('#abTestViewerName').html(test.name);
		$overlay.find('#abTestViewerPercentUser').html(test.percentUser);
		$overlay.find('#abTestViewerCurrentScenario').html(test.getNameOfA() + ' (' + test.getIdOfA()+ ')');
		$overlay.find('#abTestViewerOtherScenario').html(test.getNameOfB() + ' (' + test.getIdOfB()+ ')');
		$overlay.find('#abTestViewerStartDate').html(test.getFrom());
		$overlay.find('#abTestViewerEndDate').html(test.getTo());
		$overlay.find('#abTestViewerStatus').attr('data-translate', test.getStatus('ab_test_status_'));

		window.localizer();

		gui.showOverlay($overlay);

	};

	gui.getTest = function(){
		var $overlay = $('#abTestEditor'),
			test = $overlay.data('test');
		if(checkTestConfiguration(test)){
			test.update($overlay.find('form'));
			return test;
		}else{
			return false;
		}
	};

	/**
	 * initializes all elements related to tabs and controls
	 */
	gui.initTabs = function(){
		//add the check whether there is already at least one test.
		$('#ABTestTab')
			.on('click', function(){
				var $this = $(this);
				if($this.hasClass('active')){
					return;
				}else if(!$('#testList').data('tests').length){
					$('#abControls').find('.helpLink').trigger('click');
				}
			});
		//init the tab behaviour
		$('.tab')
		.on('click', function(){
			var $this = $(this);
			if($this.hasClass('active')){
				return;
			}
			$this.addClass('active current')
				.siblings('.tab')
				.removeClass('active current');
			$($this.data('target'))
				.show()
				.siblings('.tabContent')
					.hide();
			$($this.data('controls'))
				.show()
				.siblings('.controls')
					.hide();
		})
			.removeClass('active')
			.first().trigger('click');
		//init the create new Test Button
		$('#createNewTest')
			.off('click')
			.on('click', function(){
			gui.editTest(new Test(emptyTest));
		});


	};

	gui.initHelp = function(){
		$('.helpLink').on('click', function(){
			var $overlay = $($(this).data('target'));
			$overlay.show();
			$overlay.find('.accordion').accordion({
			      heightStyle: "fill"
		    });
		});
	};

	gui.initTooltips = function(){
		$( document ).tooltip({
			items: ".ttp",
			content: function() {
				return $(this).data('tt_content');
			}
		});
	};
	return gui;
});