/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

	'GET /data/group-by-day': 'DataController.group-by-day',
	'GET /data/group-by-week': 'DataController.group-by-week',
	'GET /data/group-by-month': 'DataController.group-by-month',

};
