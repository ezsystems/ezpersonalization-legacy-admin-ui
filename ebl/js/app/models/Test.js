/**
 * Created with JetBrains PhpStorm.
 * User: maik.seyring
 * Date: 27.06.13
 * Time: 15:41
 * To change this template use File | Settings | File Templates.
 */

define(['app/api/ab', 'jquery'], function(api, $){

	function pad(n){return n<10 ? '0'+n : n;}
	function isoDateString(d){
		return d.getFullYear()+'-'+
			pad(d.getMonth()+1)+'-'+
			pad(d.getDate());
	}

	function Test(test){
		this.init(test);
		//var self = this; // just for debugging
		//this.ready.then(function(){console.log(self.export())});
	}

	var oneDay = 24 * 3600 * 1000;

	Test.prototype.init = function(test){
		this.id = test.abtest.id ?  test.abtest.id : null;
		this.name = test.abtest.description;
		this.a = test.abtest.currentScenario;
		this.b = test.abtest.otherScenario;
		this.percentUser = test.abtest.percentUser;
		this.startDate = new Date(test.abtest.startDate);
		this.endDate = new Date(test.abtest.endDate);
		var weeks = Math.floor((this.endDate.getTime() - this.startDate.getTime() + oneDay) / (7 * oneDay));
		this.weeks = weeks ? weeks: 1;
		this.status = test.status;

		this.loadScenarios();
	};

	Test.prototype.loadScenarios = function(){
		var self = this;
		this.ready = $.when(
			api.getScenario(this.a)
				.then(
				function(scenario){
					if(typeof scenario === 'object'){
						self.a = scenario;
					}
					return true;
				}
			),
			api.getScenario(this.b).then(
				function(scenario){
					if(typeof scenario === 'object'){
						self.b = scenario;
					}
					return true;
				}
			)
		);
	};

	Test.prototype.isEditable = function(){
//		return this.status === 'PREPARED';

		return (this.startDate.getTime() > Date.now());
	};

	Test.prototype.isActive = function(){
		return this.status === 'RUNNING';
//		var now = new Date();
//		if(this.startDate.getTime() < now.getTime() && this.endDate.getTime() > now.getTime()){
//			return true;
//		}
//		return false;
	};

	Test.prototype.isDeleteable = function(){
		return !this.isActive();
	};

	Test.prototype.isFinished = function(){
		return this.status === 'ARCHIVED';
	};

	/**
	 * clones the current Test and increases the start time until we have a valid configuration
	 */
	Test.prototype.clone = function(){
		//TODO: implement the Test.clone method
	};

	Test.prototype.getName = function(){
		return this.name;
	};

	Test.prototype.getStatus = function(prefix){
		prefix = typeof prefix === 'string' ? prefix : '';
		return prefix + this.status;
	};

	Test.prototype.getFrom = function(){
		return this.startDate.toDateString();
	};

	Test.prototype.getTo = function(){
		return this.endDate.toDateString();
	};

	Test.prototype.getNameOfA = function(){
		var result = typeof this.a === 'string' ? this.a : this.a.title;
		
		if (! result) {
			result = this.getIdOfA();
		}
		
		return result;
	};

	Test.prototype.getIdOfA = function(){
		return typeof this.a === 'string' ? this.a : this.a.referenceCode;
	};

	Test.prototype.getNameOfB = function(){
		var result = this.b === 'string' ? this.b : this.b.title;
		
		if (! result) {
			result = this.getIdOfB();
		}
		return result;
	};

	Test.prototype.getIdOfB = function(){
		return typeof this.b === 'string' ? this.b : this.b.referenceCode;
	};

	Test.prototype.getDuration = function(){
		return this.weeks;
	};



	Test.prototype.update = function($form){
		this.name = $form.find('#testName').val();
		this.percentUser = parseInt($form.find('#testPercentUser').val(), 10);
		this.a = $form.find('#testCurrentScenario').val();
		this.b = $form.find('#testOtherScenario').val();
		this.startDate = $form.find('#testStartDate').datepicker('getDate');
		this.weeks = $form.find('#testDuration').val();
		this.endDate = new Date(this.startDate.getTime() + (this.weeks * 7 * oneDay) -oneDay);
		this.status = 'PREPARED';

		this.loadScenarios();
	};

	Test.prototype.export = function(){
		return {
			'currentScenario': this.getIdOfA(),
			'description': this.name,
			'endDate': isoDateString(this.endDate),
//			'endDate': this.endDate.getFullYear() + '-' +
//				(this.endDate.getMonth() < 9 ? '0' : '') + (this.endDate.getMonth()+1) + '-' +
//				(this.endDate.getDay() < 9 ? '0' : '') + (this.endDate.getDay()+1),
			'id': this.id,
			'otherScenario': this.getIdOfB(),
			'percentUser': this.percentUser,
			'startDate': isoDateString(this.startDate)
//			'startDate':  this.startDate.getFullYear() + '-' +
//				(this.startDate.getMonth() < 9 ? '0' : '') + (this.startDate.getMonth()+1) + '-' +
//				(this.startDate.getDay() < 9 ? '0' : '') + (this.startDate.getDay()+1)
		};
	};

	Test.prototype.getTimeArray = function(){

	};

	return Test;
});