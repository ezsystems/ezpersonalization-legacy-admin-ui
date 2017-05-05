/**
 * This test engine works together with the rest_test.html file.
 * Individual steps, which need user interactio, like the entry of codes send in a e-mail
 * are provided throu forms in the html document.
 *
 *   The results of the single tests are inserted into the html document.
 *
 *   Beside the check of the correct response codes, also the responded content is checked
 *
 *   For debugging purpose are the responded and the for the request used objects stored in
 *   test.debug. When a test failes you can find the compared objects under the tests name and
 *   you can inspect them manualy.
 */

(function(){
	/**
	 * initialize
	 */
	$(document).ready(function(){
		var $logs = $('#logs'),
			$results = $('#results'),
			$testCases = $('.testCase'),
			$currentCase,
			testCounter = 0,
			captchaScope,
			mandatorId,
			requestStr;
//		console.log($testCases);
		window.test = {
			'captchaScope' : 0,
			'currentTest': 0,
			'ajaxreq': 1,
			'testCases' : [
				'admin_credentials',
				'user_registration_1',
				'user_create_access_token',
//				prepare_customer_update,
//				'user_registration_2',
				change_password,
				faultAutoLogin,
				successAutoLogin,
//				prepare_customer_update,
				update_customer,
				check_scenarios,
				new_scenario,
				update_scenario,
				handle_models,
				configure_model,
				update_profile_filter_set,
				update_standard_filter_set,
				update_submodel,
				check_statistics,
				prepare_forgot_password,
				'forgot_password',
				'reset_password',
				'final_message'
			],
			'requestStr' : 'ebl/v3/',
			'mandatorRequestStr' : null,
			'data' : {'staticPassword' : 'staticPassword1',
				'customer' : null},
			'log' : function log(obj, category){
				var type = typeof obj;
				if(type === 'string'){
					var $entry = $('<div>'+ obj +'</div>');
					if(typeof category === 'string'){
						$entry.addClass(category);
					}
					$currentCase.append($entry);
				}else if(obj instanceof jQuery){
					$currentCase.append(obj);
				}else{
					$currentCase.append('<p>wrong use of log mechanism</p>');
				}
			},
			// provides a simple way to log wether a test was successfull or
			// failed
			'assert' : function(result, msg1, msg2){
				if(result){
					$currentCase.append('<div class="success">' + msg1 + '</div>');
				}else{
					$currentCase.append('<div class="failure">' + (msg2 ? msg2 : msg1) + '</div>');
				}
			},
			'createCaptchaScope' : function createCaptchaScope(){
				this.captchaScope = Math.round(Math.random() * 100000);
				return this.captchaScope;
			},
			'next': function next(){
				var currentTest = this.currentTest;
				if(currentTest >= this.testCases.length){
					return;
				}
				this.currentTest++;
				$currentCase = $('<div class="caselog">');
				$currentCase.append($('<button class="removeCase">remove</button>').on('click', removeParent));
				$logs.prepend($currentCase);
				var type = typeof this.testCases[currentTest];
				if( type === 'function'){
					$testCases.hide().filter('#automatic_test').show();
					this.testCases[currentTest]();
				}else if(type === 'string'){
					$testCases.hide().filter('#' + this.testCases[currentTest]).show();
				}else if(type == 'object'){
					this.testCases[currentTest].func.apply(null, obj.args);
				}else{
					alert('invalid scenario configutation');
				}
			}
		};
		// add the event handler for tester interaction
		$('#admin_login').find('button').on('click', function(e){e.preventDefault(); test.next();});
		$('#user_registration_1').find('button').on('click', new_customer);
//		$('#customer_update_form button').on('click', update_customer);
		$('#user_create_access_token').find('button').on('click', userLogin);
		$('#forgot_password').find('button').on('click', forgot_password);
		$('#reset_password').find('button').on('click', reset_password);
		captchaScope = test.createCaptchaScope();
		$('#captcha_image').attr('src', '/ebl/v3/registration/create_captcha?captchascope=' + captchaScope );
		$('#toggle_debug').on('click', function(){
			$('#debug_content').toggle();
		});
		$('#clear_log').on('click', function(){
			$('#logs').html('');
		});

		// start the testing
		$('#teststart').on('click', function(){
			test.next();
		});

		test.next();
	});



	/**
	 * Click handler for new customer form
	 *
	 * @param e clickEvent
	 */
	function new_customer(e){
		e.preventDefault();
		test.templateScenariosPromise = prepare_scenario_check();
		//after the template data has loaded, we create the the customer
		test.templateScenariosPromise.always(create_customer);
 	}

	/**
	 * fetches the data specified in the template to be used
	 * to compare the new customer later with the template data
	 *
	 * @returns prommise which provides an array of scenarios when resolved
	 */
	function prepare_scenario_check(){
		var template = $('#user_registration_1').find('select[name = "template"]').val();
		if(template === ''){
			template = $('#user_registration_1').find('select[name = "scenario"]').val();
		}
		//login as admin
		test.log('Login as Admin');
		var $form = $('form#admin_login');
		var data = {
				'login': $form.find('input[name="login"]').val(),
				'password': $form.find('input[name="password"]').val(),
				'no-realm': 'on',
				'set_cookie': 'on'
			};
		return ajaxrequest({
			type: "POST",
			url: "ebl/v3/registration/create_access_token",
			beforeSend: function (req) {
				req.setRequestHeader('no-realm', 'yes');
			},
			dataType: "json",
			data: data
		}).pipe(
			function() {
				test.log('Login as Admin success');
				//get the scenarios of the used template
				return ajaxrequest({ // get scenario list
					type: "GET",
					dataType: "json",
					url: "ebl/v3/template_" + template + '/structure/get_scenario_list'});
		},function(){
			test.log('Login as Admin failed', 'error');
			return $.Deferred().reject();
		}).pipe(
			function (json) {
				test.log('fetching scenarios of template user');
				var l = json.scenarioInfoList.length,
				deferreds = [];
				//for all scenarios defined in the template we make an ajax call
				while(l--){
					deferreds.push(
						ajaxrequest({ // get a scenario
							type: "GET",
							dataType: "json",
							url: "ebl/v3/template_" + template + '/structure/get_scenario/' + json.scenarioInfoList[l].referenceCode,
						}).pipe(
								//we extract the scenario object from the response and hand it over to the callback
							function (json) {return json.scenario;},
							errorhandler
						)
					);
				}
				//we have fired all the ajax-calls so we can logout as admin to not disturbe the future processing
				//TODO make sure we proceed after the logout was successfull (add another level to prevent interaction with scenario array
				ajaxrequest({
					type: "POST",
					dataType: "json",
					url: "ebl/v3/registration/logout",
					success: function () {
						test.log('Admin Logout Success');
					},
					error: errorhandler
				});
				//we aggregate all the prommises from the ajax calles,
				//which we have stored in teh deferreds array with the when function
				//when returns a prommise, which is resolved just in case all ajax requests succeed
				return $.when.apply(null, deferreds);//the callbacks get the responses from all deferreds in the array
		}).pipe(
			//the success function is calles with all filtered (see above) responses from the ajax calls
			function(){
				var arr = [],
				l= arguments.length;
				while(l--){
					arr.push(arguments[l]);
				}
				return arr;	//return an array of all the scenarios in case the outermost prommise is resolved
		});
	}

	function create_customer (e) {
//		e.preventDefault(); //prevent auto submit of form
		test.log('Create Customer Start');
		var $form = $('#user_registration_1'),
			username = encodeURI($form.find('input[name = "email"]').val()),
			email = encodeURI($form.find('input[name = "email"]').val()),
			template = $form.find('select[name = "template"]').val(),
			solution = $form.find('select[name="solution"]').val(),
			weburl = $form.find('input[name = "weburl"]').val(),
			captcha = $form.find('input[name = "captcha"]').val(),
			captchascope =$form.find('input [name="captchascope"]').val(test.captchaScope).val();

		ajaxrequest({
			type: "POST",
			dataType: "json",
			data: {
				username: username,
				email: username,
				solution: solution,
				weburl: weburl,
				captcha: captcha,
				captchascope: test.captchaScope,
				template: template
			},
			url: '/ebl/v3/registration/register_new_customer',
			statusCode: {
				412: function (jqXHR, textStatus, errorThrown) {
					test.log("registration_step_1_message_captcha_not_correct");
					captchascope = test.createCaptchaScope();
					$('#captcha_image').attr('src', '/ebl/v3/registration/create_captcha?captchascope=' + captchascope);
					$('#captcha').val("");
				},
				409: function (jqXHR, textStatus, errorThrown) {
					test.log("registration_step_1_message_login_name_already_used");
				}
			},
			success: function (json) {
				$('#login_form input[name="login"]').val(json.newCustomerResponse.login.name);
				test.log("Customer Registration successfull");
				test.data.customer = json.newCustomerResponse;
				mandatorId = json.newCustomerResponse.mandator.name;
				test.mandatorRequestStr = "ebl/v3/" + json.newCustomerResponse.mandator.name;
				test.next();
			},
			error: errorhandler
		});
	}

	/**
	 * handles the submit event for user login form
	 */
	function userLogin(e){
		e.preventDefault();
		var $form = $('#user_create_access_token form');
		test.data.login = $form.find('input[name = "login"]').val();
		test.data.password = $form.find('input[name = "password"]').val();
		create_access_token(test.data.login, test.data.password)
		.pipe(function(){
			return ajaxrequest({
				type: 'GET',
				url: 'ebl/v3/registration/get_accesible_mandator_list',
				dataType: 'json'
			});
		})
		.pipe(function(json){
			if(json.mandatorInfoList.length){
				test.mandatorRequestStr = '/ebl/v3/' + json.mandatorInfoList[0].name;
			}
			test.next();
		});
	}

	function faultAutoLogin(){
		test.log('Login Failure Start');
		create_access_token(test.data.login, test.data.password)
		.then(function(){
			test.log('Login with old password succeded', 'error');
		},function(){
				test.log('Login with old password failed');
				test.next();
		});

	}

	function successAutoLogin(){
		test.log('Login Success Start');
		create_access_token(test.data.login, test.data.staticPassword).
		then(function(){
			test.log('Login with new password Succeeded');
			test.next();
		},function(){
			test.log('Login with new password failed', 'error');
		});

	}

	function create_access_token(login, password) {
		test.log('Create Access Token start');
		return ajaxrequest({
			type: "POST",
			url: "ebl/v3/registration/create_access_token",
			beforeSend: function (req) {
				req.setRequestHeader('no-realm', 'yes');
			},
			dataType: "json",
			data: {
				'login': login,
				'password': password,
				'no-realm': 'on',
				'set_cookie': 'on'
			},
			success: function(json) {
				test.log('Create Access Token success');
				test.data.accessToken = json.accessToken;
			},
			error: function(jqXHR, textStatus, errorThrown){
				test.log('Create Access Token failed');
				errorhandler(jqXHR, textStatus, errorThrown);
			}
		});
	}

	function get_access_token() {
		test.log('Get Access Token started');
		ajaxrequest({
			type: "GET",
			url: "ebl/v3/registration/get_access_token",
			beforeSend: function (req) {
				req.setRequestHeader('no-realm', 'yes');
			},
			dataType: "json",
			success: function (json) {
				var customer = test.data.customer;
				test.log('get me request success');
				test.assert(customer.login.name === json.loginInfo.name, 'name matches', 'name varies');
				test.assert(customer.login.accessibleMandators === json.loginInfo.accessibleMandators, 'accessibleMandators matches', 'accessibleMandators varies');
				test.assert(customer.login.root === json.loginInfo.root, 'root matches', 'root varies');
				test.assert(customer.login.provider === json.loginInfo.provider, 'provider matches', 'provider varies');
			},
			error: function(jqXHR, textStatus, errorThrown){
				test.log('get me failed');
				errorhandler(jqXHR, textStatus, errorThrown);
			}
		});
	}

	function change_password(){
		test.log($('<h3>Change Password started</h3>'));
		ajaxrequest({
			type: "POST",
			url: "ebl/v3/profile/change_password",
			beforeSend: function (req) {
				req.setRequestHeader('no-realm', 'yes');
			},
            mimeType: "application/json",
            contentType: "application/json",
			dataType: "json",
			data: JSON.stringify(test.data.staticPassword),
			success: function (json) {
				test.log('Change Password success');
				test.next();
			},
			error: function(jqXHR, textStatus, errorThrown){
				test.log('Change password failed');
				errorhandler(jqXHR, textStatus, errorThrown);
			}
		});
	}

	function get_me() {
		test.log('get me started');
		return ajaxrequest({
			type: "GET",
			url: "ebl/v3/registration/get_me",
			beforeSend: function (req) {
				req.setRequestHeader('no-realm', 'yes');
			},
			dataType: "json",
			success: function (json) {
				var customer = test.data.customer;
				test.log('get me request success');
				test.assert(customer.login.name === json.loginInfo.name, 'name matches', 'name varies');
				test.assert(customer.login.accessibleMandators === json.loginInfo.accessibleMandators, 'accessibleMandators matches', 'accessibleMandators varies');
				test.assert(customer.login.root === json.loginInfo.root, 'root matches', 'root varies');
				test.assert(customer.login.provider === json.loginInfo.provider, 'provider matches', 'provider varies');
			},
			error: function(jqXHR, textStatus, errorThrown){
				test.log('get me failed');
				errorhandler(jqXHR, textStatus, errorThrown);
			}
		});
	}

	function get_accesible_mandator_list() {
		test.log('get accessible mandator list started');
		ajaxrequest({
			type: "GET",
			url: "ebl/v3/registration/get_accesible_mandator_list",
			beforeSend: function (req) {
				req.setRequestHeader('no-realm', 'yes');
			},
			dataType: "json",
			success: function (json) {
				test.log('get accesible mandator list request success');
				test.assert(test.data.customer.login.accessibleMandators === json.mandatorInfoList.length, 'Mandator count matches', 'Mandator count varies');
			},
			error: function(jqXHR){
				test.log('get accessible mandator list failed');
				errorhandler(jqXHR);
			}
		});
	}


	function get_mandator_statistics() {
		test.log('get statistics started');
		ajaxrequest({
			type: "GET",
			url: "ebl/v3/profile/get_mandator_statistic/" + test.data.customer.mandator.name,
			beforeSend: function (req) {
				req.setRequestHeader('no-realm', 'yes');
			},
			dataType: "json",
			success: function (json) {
				test.log('get statistics success');
			},
			error: function(jqXHR, textStatus, errorThrown){
				test.log('get statistics failed');
				errorhandler(jqXHR, textStatus, errorThrown);
			}
		});
	}

	function prepare_forgot_password() {
		//fill the form
		test.log('preparing forgot password dialog');
		var $form = $('#forgot_password form'),
		captchascope = test.createCaptchaScope();
		$form.find('[name="username"]').val(test.data.login);
		$form.find('#captchaimage').attr('src', '/ebl/v3/registration/create_captcha?captchascope=' + captchascope);
		$form.find('[name="captchascope"]').val(captchascope);
		$form.find('[name="captcha"]').val("");
		//logout
		test.log("trying to terminate current session");
		ajaxrequest({
			type: "POST",
			dataType: "json",
			url: "ebl/v3/registration/logout",
		}).pipe(function () {
				test.log('Logged out as current user');
				return get_me();
			}, errorhandler)
		.pipe(function(){
				test.log('session termination failed');
			},
			function(){
				test.log('session termination succeeded');
				test.next();
		});

	}

	function forgot_password(e){
		//
		e.preventDefault();
		test.log('Forgot Password start');
		var $form = $('#forgot_password form');
		ajaxrequest({
			type: "POST",
			dataType: "json",
			data: $form.serialize(),
			url: '/ebl/v3/registration/forgot_password',
			statusCode: {
				412: function (jqXHR, textStatus, errorThrown) {
					test.log("forgot_password_message_captcha_not_correct");
					var captchascope = test.createCaptchaScope();
					$form.find('#captchaimage').attr('src', '/ebl/v3/registration/create_captcha?captchascope=' + captchascope);
					$form.find('[name="captchascope"]').val(captchascope);
					$form.find('[name="captcha"]').val("");
				}
			},
			success: function (json) {
				test.log("Forgot Password mail was send successful");
	//			$('#reset_password form input[name="username"]').val(test.data.login);
				test.next();
			},
			error: errorhandler
		});
		$('#reset_password form input[name="username"]').val(test.data.login);
	}

	function reset_password(e){
		e.preventDefault();
		test.log('Reset Password start');
		var $form = $('#reset_password form');

		ajaxrequest({		//reset password with code
			type: "POST",
			dataType: "json",
			data: {
				username: $form.find('input[name="username"]').val(), //test.data.login,
				code: $form.find('input[name="code"]').val()
			},
			url: '/ebl/v3/registration/reset_password',
			statusCode: {
				400: function (jqXHR, textStatus, errorThrown) {
					test.log("invalid forgotten password code");
				}
			}
		}).pipe(
			//on success set the new password
			function (json) {
				var $form = $('#reset_password form'),
				username = $form.find('input[name="username"]').val(),//test.data.login,
				code = $form.find('input[name="code"]').val(),
				password = $form.find('input[name="password"]').val();
				test.data.login = username;
				test.data.userPassword = password;
				return ajaxrequest({
					type: "POST",
					beforeSend: function (req) {
						req.setRequestHeader('Authorization', make_base_auth(username, code));
						req.setRequestHeader('no-realm', 'realm1');
					},
					mimeType: "application/json",
					contentType: "application/json",
					dataType: "json",
					data: JSON.stringify(password),
					url: "ebl/v3/profile/change_password"
				});
			},
			function(){
				return $.Deferred().reject();
			})
		.pipe(
			function (json) {
				test.log('password change succeeded');
				test.log('trying to login with new password');
				return ajaxrequest({
					type: "POST",
					url: "ebl/v3/registration/create_access_token",
					beforeSend: function (req) {
						req.setRequestHeader('no-realm', 'yes');
					},
					dataType: "json",
					data: {
						'login': test.data.login,
						'password': test.data.userPassword,
						'no-realm': 'on',
						'set_cookie': 'on'
					}
				});
			}, function () {
				test.log('password not changed');
				return $.Deferred().reject();
			}
		).then(
			function(){
				test.log('Logged in with new password');
				test.next();
			},
			function(){
			test.log('Failed to login with new password');
			});
	}


	function prepare_customer_update(){
		var $form = $('#customer_update form');

	}

	function update_customer(){
		test.log('Start Customer Update');
		ajaxrequest({
			type: "GET",
			dataType: "json",
			url: '/ebl/v3/profile/get_profile_pack/' + test.data.customer.mandator.name,
			statusCode: {},
			error: errorhandler
		}).pipe(function(json){
			var c = json.profilePack.customer,
			data = {
				'address': {
					'city': 'Some City',
					'country': 'A C08ntry "',
					'street': 'new Street 45 �&',
					'zip': '234-/(34%'
				},
				'company': 'Company Nam�',
				'email': c.email,
				'firstName': 'FirstName)',
				'gender': null,
				'id': c.id,
				'lastName': 'Last-Name',
				'phone': '3245-345/3425 345'
			};
			return ajaxrequest({
				type: "POST",
				dataType: "json",
				contentType: 'application/json',
				data: JSON.stringify(data),
				url: '/ebl/v3/profile/update_customer',
				statusCode: {},
				success: function (json) {
					debug('update_customer', data, json.customer);
					test.log(debugButton('update_customer'));
					test.assert(equals(json.customer, data), 'Customer data matches', 'Customer data varies');
					test.next();
				},
				error: errorhandler
			});
		});
	}

	function check_scenarios(){
		test.userScenariosPromise = get_user_scenarios();
		$.when(test.templateScenariosPromise, test.userScenariosPromise)
		.then(
			function(a, b){
				debug('check_scenarios', a, b);
				test.log(debugButton('check_scenarios'));
				test.assert(
					equals(a, b),
					'scenarios match with template',
					'scenarios diverse from template');
				test.next();
			},
			function(){
				test.log('Check of template scenarios not possible');
				test.next();
			}
		);
	}

	/**
	 * loads _ALL_ scenarios of the current logged in user
	 * and store it to test.actualScenarios
	 */
	function get_user_scenarios(){
		return ajaxrequest({ // get scenario list
			type: "GET",
			dataType: "json",
			url: test.mandatorRequestStr + '/structure/get_scenario_list',
			statusCode: {},
		})
		.pipe(
			function(json){
//				console.log(json);
				var deferreds = [],
				list = json.scenarioInfoList,
				l = list.length;
				if(!l){
					test.log('no scenarios fetched or no access');
					return false;
				}
				while(l--){
					deferreds.push(
						ajaxrequest({ // get scenario
							type: "GET",
							dataType: "json",
							url: test.mandatorRequestStr + '/structure/get_scenario/' + list[l].referenceCode,
							statusCode: {},
							success: function (json) { return json.scenario;},
							error: errorhandler
						})
							);
				}
				return $.when.apply($, deferreds);
			}, errorhandler)
		.pipe(function(){
			var l = arguments.length,
			arr = [];
			while(l--){
				arr.push(arguments[l][0].scenario);
			}
			return arr;
		});
	}



	// fetches a predefined scenario and tries to create it
	function new_scenario(){
		test.log($('<h3>new_scenario</h3>'));
		var scenario,
		models;
		$.when(
			// get a scenario from the library
			ajaxrequest({
				type: "GET",
				dataType: "json",
				data: {},
				url: test.mandatorRequestStr + '/structure/get_library_scenario_list',
				statusCode: {},
				success: function (json) {
					scenario = json.libraryScenarioInfoList[0];
					test.log("Scenario loaded successful");
				},
				error: errorhandler
			}),

			// get models from the library
			ajaxrequest({
				type: "GET",
				dataType: "json",
				data: {},
				url: test.mandatorRequestStr + '/structure/get_model_list',
				statusCode: {},
				success: function (json) {
					models = json.modelList;
					test.data.modelList = json.modelList;
					test.log("Models loaded successfull");
				},
				error: errorhandler
			})
		)
		.then(function(){
			var time = +new Date();
			var scenario = {
					"referenceCode" : "my_test_scenario" + time ,
					"title" : "Test Scenario",
					"description" : "test description for my test scenario",
					"avaliable" : "NOT_AVAILABLE",
					"inputItemType" : 1,
					"outputItemTypes" : [ 1 ],
					"stages" : {
						"0" : {
							"useCategoryPath" : 0,
							"xingModels" : []
						},
						"1" : {
							"useCategoryPath" : 1,
							"xingModels" : []
						},
						"2" : {
							"useCategoryPath" : 2,
							"xingModels" : []
						}
					},
					"enabled" : "ENABLED"
				},
			l = models.length,
			s = 3,
			max = 1, //maximum number of models per stage
			context;

			// add some models (all existing models are used and added to the
			// three stages of the scenario
			while(l--){
				context = models[l].profileContextSupported ? "PROFILE" : "ITEM";
//				console.log(s);
//				console.log(scenario);
				scenario.stages[--s + ""].xingModels.push({
					"contextFlag" : context,
					"useSubmodels" : false,
					"weight" : 100,
					"modelReferenceCode" : models[l].referenceCode
				});
				if(!s){
					s = 3;
					max--;
				}
				if(!max){
					break;
				}
			}
			// store the scenario
//			console.log(scenario);
			test.data.new_scenario = scenario;
//			console.log(test.data.new_scenario);
			// create the adapted scenario
			ajaxrequest({
				type: "POST",
				dataType: "json",
				contentType: 'application/json',
				data: JSON.stringify(scenario),
				url: test.mandatorRequestStr + '/structure/create_scenario',
				statusCode: {},
				success: function (json) {
					test.log("Create Scenario successfull");
					debug('new_scenario', scenario, json.scenario);
					test.log(debugButton('new_scenario'));
					test.assert(equals(json.scenario, scenario), 'new scenario match', 'new scenario missmatch');
					test.next();
				},
				error: errorhandler
			});
		},
		function(){
			test.log('Create Scenario preconditions failed');
		});
	}

	function update_scenario(){
		test.log($('<h3>update_scenario</h3>'));
		var scenario;
		// load the scenario
		ajaxrequest({
			type: "GET",
			dataType: "json",
			data: {},
			url: test.mandatorRequestStr + '/structure/get_scenario/' + test.data.new_scenario.referenceCode,
			statusCode: {},
			success: function (json) {
				test.log("Scenario fetched successfuly");
				scenario = json.scenario;
				// adaptthe scenario
				scenario.title += ' adapted';
				scenario.description += ' adapted';

				// update the adapted scenario
				ajaxrequest({
					type: "POST",
					dataType: "json",
					contentType: 'application/json',
					data: JSON.stringify(scenario),
					url: test.mandatorRequestStr + '/structure/update_scenario',
					statusCode: {},
					success: function (json) {
						test.log("Update Scenario successfull");
						debug('update_scenario', scenario, json.scenario);
						test.log(debugButton('update_scenario'));
						test.assert(equals(json.scenario, scenario),
								'scenario update check passed',
								'scenario update check failed' );
						test.data.new_scenario = scenario;
						test.next();
					},
					error: errorhandler
				});
			},
			error: errorhandler
		});
	}

	function handle_models(){
		test.log($('<h3>handle_models</h3>'));
		var scenario = test.data.new_scenario;
		scenario.stages['0'].xingModels = [{
			"contextFlag" : test.data.modelList[1].profileContextSupported ? "PROFILE" : "ITEM",
			"useSubmodels" : false,
			"weight": 75,
			"modelReferenceCode": test.data.modelList[1].referenceCode
		}];
		ajaxrequest({
			type: "POST",
			dataType: "json",
			contentType: 'application/json',
			data: JSON.stringify(scenario),
			url: test.mandatorRequestStr + '/structure/update_scenario',
			statusCode: {},
			success: function (json) {
				test.log("Update Scenario successfull");
				debug('handle_models', scenario, json.scenario);
				test.log(debugButton('handle_models'));
				test.assert(equals(json.scenario, scenario),
					'scenario update check passed',
					'scenario update check failed' );
				test.next();
			},
			error: errorhandler
		});
	}

	function configure_model(){
		test.log('Starting to configure models of scenario');
		var scenario = test.data.new_scenario;
		scenario.stages['0'].useCategoryPath = 2;
//		scenario.stages['0'].xingModels[0].weight = 100;
		ajaxrequest({
			type: "POST",
			dataType: "json",
			contentType: 'application/json',
			data: {'scenario' : '{"scenario":'+JSON.stringify(scenario)+'}'},
			url: test.mandatorRequestStr + '/structure/update_scenario',
			statusCode: {},
			success: function (json) {
				test.log("Update Scenario successfull");
				debug('configure_model', scenario, json.scenario);
				test.log(debugButton('configure_model'));
				test.assert(equals(json.scenario, scenario),
						'model configuration check passed',
						'model configuration check failed' );
				test.next();
			},
			error: errorhandler
		});
	}

	function update_profile_filter_set(){
		profileSet = {
			'excludeAlreadyPurchased': true,
			'excludeRepeatedRecommendations': null,
			'excludeBlacklist': true
		};
//		console.log('{"profileFilterSet":' + JSON.stringify(profileSet)+ '}');
		// set the new filters
		ajaxrequest({
			type: "POST",
			dataType: "json",
			data: {
				'profileFilterSet' : '{"profileFilterSet":' + JSON.stringify(profileSet)+ '}'
				},
			url : test.mandatorRequestStr + '/structure/update_filter_set/profile/'  + test.data.new_scenario.referenceCode,
			statusCode: {},
			success: function (json) {
				test.log("Update Scenario successfull");
				debug('profile_filter', json.profileFilterSet, profileSet);
				test.log(debugButton('profile_filter'));
				test.assert(equals(json.profileFilterSet, profileSet),
					'update profile filter set check passed',
					'update profile filter set check failed');
				test.next();
			},
			error: errorhandler
		});
	}

	function update_standard_filter_set(){
		// standard set of filters
		stdSet = {
			'excludeCheaperItems': "YES",
			'excludeContextItems': true,
			'excludeEditorBlacklistResults': true,
			'excludeFutureItems': false,
			'excludeOutdatedItems': false,
			'excludeTopSellingResults': false,
			'maximalItemAge': null,
			'sameCategoryFilter': "INACTIVE"
		};
		// set the new filters
		ajaxrequest({
			type: "POST",
				dataType: "json",
				data: {
					'standardFilterSet' : '{"standardFilterSet":' + JSON.stringify(stdSet)+ '}'
					},
				url: test.mandatorRequestStr + '/structure/update_filter_set/standard/' + test.data.new_scenario.referenceCode,
				statusCode: {},
				success: function (json) {
					test.log("Update Scenario successfull");
					debug('std_filter', json.standardFilterSet, stdSet);
					test.log(debugButton('std_filter'));
					test.assert(equals(json.standardFilterSet, stdSet),
							'update stdandard filter set check passed',
							'update standard profile filter set check failed' );
					test.next();
				},
			error: errorhandler
		});
	}

	function update_submodel(){
		test.log('Submodel Test');
		ajaxrequest({
			type: 'GET',
			dataType: 'json',
			url: test.mandatorRequestStr + '/structure/get_attribute_keys'
		}).pipe(
			function(json){
//				if(!json.stringList.length){
//					test.log('no attribute keys defined to build a submodel', 'warning');
//					return $.Deferred().reject();
//				}
				//find a model which supports submodels
				var l = test.data.modelList.length,
					model = null;
				while(l--){
					if(test.data.modelList[l].submodelsSupported){
						model = test.data.modelList[l];
						break;
					}
				}
				if(!model){	//we have no model which supports submodels
					test.log('No Submodels supported by the users models', 'warning');
					test.next();
					return $.Deferred().reject();
				}
				test.data.submodel = {attributeKey: 'test',//json.stringList[0],
						attributeValues: [
						                  {attributeValue: 'one', group: 1},
						                  {attributeValue: 'two', group: 1},
						                  {attributeValue: 'three', group: 1},
						                  {attributeValue: 'four', group: 2},
						                  {attributeValue: 'fife', group: 2},
						                  {attributeValue: 'six', group: 3}],
						submodelType: 'NOMINAL'
				};
				return ajaxrequest({
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json',
					url: test.mandatorRequestStr + '/structure/update_submodel/' + model.referenceCode,
					data: JSON.stringify(test.data.submodel)
				});
			}
		).pipe(
			function(json){
				debug('submodel', json.submodel, test.data.submodel);
				test.log(debugButton('submodel'));
				test.assert(equals(json.submodel, test.data.submodel), 'submodel matches', 'submodel matches not');
				test.next();
			},
			function(){
				test.log('update submodel failed', 'warning');
				test.next();
			});
	}

	function check_statistics(){
		var start = new Date(Date.now() - 5184000*1000);
		var now = new Date();
		var timeData = {
				from_date_time: "" + start.getUTCFullYear() + '-' + start.getUTCMonth() + '-' +  start.getUTCDate() + 'T00:00:00',
				to_date_time: "" + now.getUTCFullYear() + '-' + now.getUTCMonth() + '-' +  now.getUTCDate() + 'T00:00:00',
				granularity: 'PT6H'
				};
		ajaxrequest({
			type: "GET",
			dataType: "json",
			data: timeData,
			url: test.mandatorRequestStr + '/revenue/events'
		}).pipe(
			function(){
				test.log('Get revenue events success');
				return ajaxrequest({
					type: "GET",
					dataType: "json",
					url: test.mandatorRequestStr + '/revenue/last_seven_days',
					error: errorhandler
				});
			},
			function(){
				test.log('Get revenue events failed', 'error');
				return ajaxrequest({
					type: "GET",
					dataType: "json",
					url: test.mandatorRequestStr + '/revenue/last_seven_days',
					error: errorhandler
				});
			}
		).pipe(
			function(){
				test.log('Get revenue last_seven_days success');
				return ajaxrequest({
					type: "GET",
					dataType: "json",
					data: timeData,
					url: test.mandatorRequestStr + '/revenue/summary'
				});
			},
			function(){
				test.log('Get revenue last_seven_days failed', 'error');
				return ajaxrequest({
					type: "GET",
					dataType: "json",
					data: timeData,
					url: test.mandatorRequestStr + '/revenue/summary'
				});
			}
		).pipe(
			function(){
				test.log('Get revenue summary success');
				return ajaxrequest({
					type: "GET",
					dataType: "text",
					data: timeData,
					url: test.mandatorRequestStr + '/revenue/statistic.xlsx',
				});
			},
			function(){
				test.log('Get revenue summary failed', 'error');
				return ajaxrequest({
					type: "GET",
					dataType: "text",
					data: timeData,
					url: test.mandatorRequestStr + '/revenue/statistic.xlsx',
				});
			}
		).pipe(
			function(){
				test.log('Get revenue statistic.xslx success');
				test.next();
			},
			function(){
				test.log('Get revenue statistic.xslx failed', 'error');
				test.next();
			}
		);
	}

//	function change_email(){
//		test.log('Changing email');
//		ajaxrequest({
//			type: "GET",
//			dataType: "json",
////			data: formData,
//			url: '/ebl/v3/profile/get_profile_pack/test.data.customer.mandator.name',
//			statusCode: {},
//			success: function (json) {
//				var time = +new Date();
//				json.profilePack.customer.email = time + "@yoochoose.com";
//				ajaxrequest({
//					type: 'POST',
//					dataType: 'json',
//					data: {'customer': '{"customer" : ' + JSON.stringify(json.profilePack.customer) + '}'},
//					url: '/ebl/v3/profile/update_customer',
//					statusCode: {},
//					success: function (json) {
//						test.log("email changed");
//						test.next();
//					},
//					error: function(){console.log('error in mailupdate');}   //errorhandler
//				});
//				//test.next();
//			},
//			error: errorhandler
//		});
//	}

	function finishTest(){
		test.log('Finalizig the tests and logging out');
		ajaxrequest({
			type: "POST",
			dataType: "json",
			url: "ebl/v3/registration/logout",
			success: function () {
				test.log('Logout success');
				text.log('all tests finished');
			},
			error: errorhandler
		});
	}

	function equals(obj1, obj2){
		return _equals(obj1, obj2) && _equals(obj2, obj1) ? true : false;
	}
//
//	function _equals(obj1, obj2){
//		var i, type1, type2, attr1, attr2, l1, l2;
//		obj1 = $.extend(true, {}, obj1);
//		obj2 = $.extend(true, {}, obj2);
//		for(i in obj1){
//			if(!obj1.hasOwnProperty(i)){
//				continue;
//			}
//			attr1 = obj1[i];
//			attr2 = obj2[i];
//			type1 = typeof attr1;
//			type2 = typeof attr2;
//			if(type1 == "function"){
//				continue;
//			}
//			if(type1 === type2){
//				if(attr1 instanceof Array && attr2 instanceof Array){
//					l1 = attr1.length;
//					l2 = attr2.length;
//					if(l1 !== l2) return false;
//					outer:
//					while(l1--){
//						l2 = attr2.length;
//						while(l2--){
//							if(equals(attr1[l1], attr2[l2])){
//								attr2.splice(l2,1);
//								continue outer;
//							}
//							if(!l2){
//								return false;
//							}
//						}
//					}
//				}else if(type1 === 'object'){
//					if (equals(attr1, attr2)){
//						continue;
//					}else{
//						return false;
//					}
//				}else{
//					if(attr1 === attr2){
//						continue;
//					}else{
//						return false;
//					}
//				}
//			}else{
//				return false;
//			}
//		}
//		return true;
//	}

	function _equals(obj1, obj2){
		var i, type1, type2, attr1, attr2;
		if(obj1 instanceof Array){
			return arrayCompare(obj1, obj2);
		}
		if(typeof obj1 === 'object' && typeof obj2 === 'object'){
			for(i in obj1){
				if(!obj1.hasOwnProperty(i)){
					continue;
				}
				attr1 = obj1[i];
				attr2 = obj2[i];
				type1 = typeof attr1;
				type2 = typeof attr2;
				if(type1 == "function"){
					continue;
				}
				if(type1 === type2){
					if(attr1 instanceof Array && attr2 instanceof Array){
						if(arrayCompare(attr1, attr2)){
							continue;
						}
						else{
							return false;
						}
					}else if(type1 === 'object'){
						if (_equals(attr1, attr2)){
							continue;
						}else{
							return false;
						}
					}else{
						if(attr1 === attr2){
							continue;
						}else{
							return false;
						}
					}
				}else{
					return false;
				}
			}
		}else if(obj1 !== obj2){
			return false;
		}
		return true;
	}

	function arrayCompare(arr1, arr2){
		if(!(arr1 instanceof Array && arr2 instanceof Array)){
			return false;
		}
		var l1 = arr1.length;
		var l2 = arr2.length;
		if(l1 !== l2) return false;
		var map = [];
		outer:
		while(l1--){
			l2 = arr2.length;
			while(l2--){
				if(!map[l2] && _equals(arr1[l1], arr2[l2])){
					map[l2] = true;
					continue outer;
				}
				if(!l2){
					return false;
				}
			}
		}
		return true;
	}

	window.equals = equals;
	window._equals = _equals;

	function rejectDeferred(){
		return $.Deferred().reject();
	}

	function deepsort(obj){
		var i;
		if(obj instanceof Array){
			i = obj.length;
			while(i--){
				if(typeof obj[i] === "object"){
					obj[i] = deepsort(obj[i]);
				}
			}
//			console.log(obj)
			obj = obj.sort();
//			console.log(obj);
			return obj;
		}else if(typeof obj === 'object'){
			for(i in obj){
				if(obj.hasOwnProperty(i)){
					obj[i] = deepsort(obj[i]);
				}
			}
		}
		return obj;
	}

/**
 * stores objects for later debugging
 *
 * @param 1st string -- name of scope
 * @param *st object -- objects to be saved in the scope
 */
	function debug(){
		var arr = [],
		l = arguments.length;
		if(l >1){
			if(!test.debug){
				test.debug = {};
			}
			while(--l){
				arr.push(arguments[l]);
			}
			test.debug[arguments[0]] = arr;
		}
	}

/**
 * Helper function for logging post requests
 *
 */
	function ajaxrequest(params){
		var reqId = test.ajaxreq++,
		startDate = new Date(),
		deferred, $logEntry;
		$logEntry =$('<div id="request' + reqId + '" class="request"></div>')
			.append('<div class="callId inline">Request '+ reqId +'</div>')
			.append('<div class="target inline">'+ params.url +'</div>')
			.append('<div class="result inline">pending</div>');
		if(params.type == "POST" && params.data){
			$logEntry.append($('<button>post data</button>').on('click', function(){
				debugJson(params.data);
			}));
		}
		test.log($logEntry);
		deferred = $.ajax(params);
		deferred.done(function(data, code, jqXHR){
			$logEntry.addClass('success')
				.find('.result')
					.html('done: ' + code);
		});
		deferred.done(function(data){
			$logEntry.append($('<button>response data</button>').on('click', function(){
				if(params.dataType === 'json'){
					debugJson(data);
				}else{
					debugString(data);
				}
			}));
		});
		deferred.fail(function(jqXHR, error, exception){
			$logEntry.addClass('error')
				.find('.result')
					.html('fail: ' + error)
					.end()
				.append('<div class="inline">status: ' + jqXHR.status + ' ' + jqXHR.statusText +'</div>');
//				console.log(jqXHR);
		});
		deferred.always(function(){
			var endDate = new Date(),
			durration = endDate.getTime() - startDate.getTime();
			$logEntry.append('<div class="inline">time: '+ durration +'ms</div>');
		});
		return deferred;
	}
/**
 * returns a button to be added to the dom with a individual callback
 */
	function debugButton(name){
		return $('<button>Debug</button>').on('click', function(){
			showDebug(name);
		});
	}

/**
 * removes the parent of a button from the DOM
 */
	function removeParent(){
		var $this = $(this);
		$this.parent().remove();
	}

/**
 * Shows a number of objects in a comprehensive way, which are stored in teh debug property of test.
 *
 * @param name string name of the attribute with the two objects to be compared
 */
	function showDebug(name){
		//fill the debug div
		var $debug = $('#debug_content'),
		l, arr, i = 0;
		$debug.html('');
		if(test.debug && test.debug[name].length){
			arr = test.debug[name];
			l = arr.length;
			while(i < l){
				$debug.append($('<div class="varDump">').html('<pre>' + dump(arr[i]) + '</pre>'));
				i++;
			}
		}
		$debug.show();
	}

/**
 * shows a single Json object in the debug area
 */
	function debugJson(data){
		var i;
		console.log(data);
		if(typeof data == 'string'){
			data =  $.parseJSON(data);
			console.log(data);
		}
		for(i in data){
			if(typeof data[i] == 'string'){
				try{
					data[i] = $.parseJSON(data[i]);
					console.log(data);
				}
				catch(e){
					console.log('not a valid json String');
					console.log(data[i]);
				}
			}
		}
		$('#debug_content')
			.html('<pre>' + dump(data) + '</pre>')
			.show();
	}

	function debugString(data){
		$('#debug_content')
			.html('<pre>' + data + '</pre>')
			.show();
	}
/**
 * Function : dump()
 * Arguments: The data - array,hash(associative array),object
 *    The level - OPTIONAL
 * Returns  : The textual representation of the array.
 * This function was inspired by the print_r function of PHP.
 * This will accept some data as the argument and return a
 * text that will be a more readable version of the
 * array/hash/object that is given.
 * Docs: http://www.openjs.com/scripts/others/dump_function_php_print_r.php
 */
//	function dump2(arr,level) {
//		var dumped_text = "";
//		if(!level) level = 0;
//
//		//The padding given at the beginning of the line.
//		var level_padding = "";
//		for(var j=0;j<level+1;j++) level_padding += "    ";
//
//		if(typeof(arr) == 'object') { //Array/Hashes/Objects
//			for(var item in arr) {
//				var value = arr[item];
//
//				if(typeof(value) == 'object') { //If it is an array,
//					dumped_text += level_padding + "'" + item + "' []\n";
//					dumped_text += dump(value,level+1);
//				} else {
//					dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
//				}
//			}
//		} else { //Stings/Chars/Numbers etc.
//			dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
//		}
//		return dumped_text;
//	}
	//creates formated JSON to be shown on screen
	function dump(arr,level) {
		var dumped_text = "";
		if(!level) level = 0;
		var level_padding = "";
		for(var j=0;j<level+1;j++) level_padding += "    ";
		if(typeof(arr) === 'object') {
			if(arr instanceof Array){
				dumped_text += '\n' + level_padding + '[\n';
				for(var item in arr) {
					var value = arr[item];
					if(value === null){
						dumped_text += level_padding + 'null' + ',\n';
					}else if(typeof(value) === 'object') {
						dumped_text += dump(value,level+1) + ",\n";
					} else if(typeof value === 'function'){
						continue;
					}else{
						if(typeof value === 'number'){
							dumped_text += level_padding +  + value + ',\n';
						}else{
							dumped_text += level_padding + '"' + value + '",\n';
						}
					}
				}
				if(arr.length) {
					dumped_text = dumped_text.slice(0, -2);
				}
				dumped_text += '\n' + level_padding + ']';
			} else{
				dumped_text += '\n' +  level_padding + '{\n';
				for(item in arr) {
					value = arr[item];
					if(value === null){
						dumped_text += level_padding + '"' + item + '":null,\n';
					}else if(typeof(value) === 'object') {
						dumped_text += level_padding + '"' + item + '":';
						dumped_text += dump(value,level+1) + ",\n";
					} else {
						if(typeof value == 'number'){
							dumped_text += level_padding + '"' + item + '":' + value + ',\n';
						}else{
							dumped_text += level_padding + '"' + item + '":"' + value + '",\n';
						}
					}
				}
				for(item in arr){
					if(arr.hasOwnProperty(item)){
						dumped_text = dumped_text.slice(0, -2);
						break;
					}
				}
				dumped_text += '\n' + level_padding + '}';
			}
		} else {
			dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
		}
		return dumped_text;
	}
/**
 * handler to log errors from server
 */
	function errorhandler(jqXHR) {
		if(jqXHR.status !== null && jqXHR.status == 403)
		{
			test.log("error_server_error_403");
		}
		else if(jqXHR.status !== null && jqXHR.status == 401)
		{
			test.log("error_password_or_login_not_correct");
		}
		else if(jqXHR.status !== null && jqXHR.status == 400)
		{
			test.log("error_server_error_400");
		}
		else if(jqXHR.status !== null && jqXHR.status == 404)
		{
			test.log("error_server_error_404");
		}
		else
		{
			test.log("error_server_error");
		}
	}

})();