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
		 * Get the Monday of the week for a current date.
		 *
		 * @param {Date} date Current date
		 * @return {Date}
		 */
		const setToMonday = date => {
			let dayOfWeek = date.getDay() || 7;
			if ( dayOfWeek !== 1 ) {
				date.setHours( -24 * ( dayOfWeek - 1 ) );
			}
			return date;
		};

		/**
		 * Get the Sunday of the week for a current date.
		 *
		 * @param {Date} date Current date
		 * @return {Date}
		 */
		const setToSunday = date => {
			let dayOfWeek = date.getDay() || 7;
			if ( dayOfWeek !== 0 ) {
				date.setHours( 24 * ( 6 - ( dayOfWeek - 1 ) ) );
				sails.log( 24 * ( 6 - dayOfWeek - 1 ) );
			}
			return date;
		};

		const currentDate = new Date( year, month - 1, day );
		const startDate = setToMonday( new Date( currentDate ) ).getTime();
		const endDate = setToSunday( new Date( currentDate ) ).getTime();
		const query = 'select createdAt, DAYOFWEEK( FROM_UNIXTIME( createdAt / 1000 ) ) as day_of_week, `id`, `temperature`, `humidity`, `pressure` from `data` where `createdAt` >= $1 and `createdAt` <= $2 order by 1';
		const result = await sails.getDatastore().sendNativeQuery( query, [ startDate, endDate ] );
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
