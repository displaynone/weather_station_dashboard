const moment = require( 'moment' );

module.exports = {


	friendlyName: 'Data by week',


	description: 'Data grouped by week.',


	inputs: {
		day: {
			description: 'Day of the month',
			type: 'number',
			required: true,
		},
		month: {
			description: 'Month',
			type: 'number',
			required: true,
		},
		year: {
			description: 'Year',
			type: 'number',
			required: true,
		},
		average: {
			description: 'Create average',
			type: 'boolean',
		},
	},


	exits: {

	},


	fn: async function ( { day, month, year, average } ) {
		/**
		 * Gets the timestamp using the timezone
		 *
		 * @param {Moment} date Date
		 * @return {int}
		 */
		const getTimestamp = date => {
			return date.valueOf() + ( date.utcOffset() * 60 * 1000 );
		};

		const currentDate = moment([year, month - 1, day]).local(true).hour(0).minutes(0).seconds(0);
		const startDate = currentDate.clone().weekday(1);
		const endDate = currentDate.clone().weekday(7);
		const query = 'select createdAt, WEEKDAY( FROM_UNIXTIME( createdAt / 1000 ) ) as day_of_week, `id`, `temperature`, `humidity`, `pressure` from `data` where `createdAt` >= $1 and `createdAt` <= $2 order by 1';
		const result = await sails.getDatastore().sendNativeQuery( query, [ getTimestamp( startDate ), getTimestamp( endDate ) ] );
		if ( ! average ) {
			return result.rows;
		}
		let items = {};
		result.rows
			.forEach( item => {
				if ( ! items[ item.day_of_week ] ) {
					items[ item.day_of_week ] = [];
				}
				items[ item.day_of_week ].push( { ... item } );
			} );
		items = Object.values( items )
			.map( item => {

				const average = item
					.reduce( ( itemA, itemB ) => {
						return {
							... itemA,
							temperature: itemA.temperature + itemB.temperature,
							humidity: itemA.humidity + itemB.humidity,
							pressure: itemA.pressure + itemB.pressure,
							heatindex: itemA.heatindex + itemB.heatindex,
							rain: itemA.rain + itemB.rain,
						};
					} );
				return {
					... average,
					temperature: average.temperature / item.length,
					humidity: average.humidity / item.length,
					pressure: average.pressure / item.length,
					heatindex: average.heatindex / item.length,
					rain: average.rain / item.length,
				};
			} );
		return items;
	}

};
