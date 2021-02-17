/**
 * Data.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs				:: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

	attributes: {

		//	╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦	╦╔═╗╔═╗
		//	╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
		//	╩	╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

		id: { type: 'number', autoIncrement: true },

		temperature: { type: 'number' },

		heatIndex: { type: 'number' },

		humidity: { type: 'number' },

		pressure: { type: 'number' },

		rain: { type: 'number' },

		//	╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
		//	║╣ ║║║╠╩╗║╣	║║╚═╗
		//	╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


		//	╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
		//	╠═╣╚═╗╚═╗║ ║║	║╠═╣ ║ ║║ ║║║║╚═╗
		//	╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

	},

};

