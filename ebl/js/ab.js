/**
 * Created with JetBrains PhpStorm.
 * User: maik.seyring
 * Date: 21.05.13
 * Time: 12:06
 */

/**
 * Entry point for require.js to load all modules related to A/B Testing
 */



requirejs.config({
	//By default load any module IDs from js/lib
	baseUrl: 'js/lib',
	//except, if the module ID starts with "app",
	//load it from the js/app directory. paths
	//config is relative to the baseUrl, and
	//never includes a ".js" extension since
	//the paths config could be for a directory.
	paths: {
		'app': '../app'
	},
	map:{
//		'app/*': { 'jquery': 'nc-jquery' }
		'*': { 'jquery': 'nc-jquery' },
		'nc-jquery': { 'jquery': 'jquery' }
	}
});

define('nc-jquery', ['jquery'], function (jq) {
	return jq.noConflict( true );
});

requirejs([
//	'jquery',
	'app/jqplugins/jquery.cookie',
	'app/jqplugins/jquery-ui',
	'app/ab'
]);

