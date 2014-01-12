/**
 * Created with JetBrains PhpStorm.
 * User: maik.seyring
 * Date: 12.06.13
 * Time: 16:29
 * To change this template use File | Settings | File Templates.
 */

define(['app/api/base'], function(api){
	/**
	 * loads the editorial list for the given model
	 * @param model
	 * @returns $.XHR
	 */
	api.getEditorialList = function(refCode) {
		return api.getMandator() // load the mandator
			.then(
			function(mandator) {
				return $.ajax({
					'type': 'GET',
					'url': 'ebl/v4/' + mandator.name + '/elist/get_list/' + refCode,
					'dataType': 'json'
				});
			},
			app.tools.stdAjaxErrorHandler
		);
	};

	/**
	 * saves the list of items on the server
	 * @param list
	 * @returns {*}
	 */
	api.saveEditorialList = function(refCode, list) {
		return $.ajax({
			'type': 'POST',
			'contentType': 'application/json',
			'url': 'ebl/v4/' + app.data.mandatorName + '/elist/update_list/' + refCode,
			'data': JSON.stringify(list)
		});
	};
	/**
	 * retrieves a item from server with given Id
	 * @param id
	 * @returns {*}
	 */
	api.getItem = function(type, id) {
		return $.ajax({
			'type': 'GET',
			'url': 'ebl/v4/' + app.data.mandatorName + '/elist/get_single_item/' + type + '/' + id
		})
			.then(null, app.tools.stdAjaxErrorHandler);
	};

	/**
	 * loads the available item types for the mandator
	 * @returns {*}
	 */
	api.getItemTypes = function() {
		var deferred = $.Deferred();
		api.getMandator()
			.then(
			function(mandator) {
				var itemTypes = {};
				if(mandator.type === 'SHOP') {
					itemTypes['1'] = 'Product';

					if(mandator.level === 'EXTENDED') {
						itemTypes['2'] = 'Article';
						itemTypes['3'] = 'Image';
						itemTypes['4'] = 'Media';
						itemTypes['5'] = 'User generated';
					}
				}
				if(mandator.type === 'PUBLISHER') {
					itemTypes['1'] = 'Product';
					itemTypes['2'] = 'Article';

					if(mandator.level === 'EXTENDED') {
						itemTypes['3'] = 'Image';
						itemTypes['4'] = 'Media';
						itemTypes['5'] = 'User generated';
					}
				}
				deferred.resolve(itemTypes);
				return itemTypes;
			},
			function() {
				deferred.reject();
			}
		);
		return deferred.promise();
	};
	return api;
});