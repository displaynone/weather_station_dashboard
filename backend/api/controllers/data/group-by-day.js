module.exports = {


	friendlyName: 'Data by day',


	description: 'Data grouped by day.',


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

		const startDate = new Date( year, month - 1, day ).getTime();
		const endDate = new Date( year, month - 1, day, 23, 59 ).getTime();
		const query = 'select createdAt, HOUR( FROM_UNIXTIME( createdAt / 1000 ) ) as hour_of_day, `id`, `temperature`, `heatindex`, `humidity`, `pressure`, `rain` from `data` where `createdAt` >= $1 and `createdAt` <= $2 order by 1';
		const result = await sails.getDatastore().sendNativeQuery( query, [ startDate, endDate ] );
		if ( ! average ) {
			return result.rows;
		}
		let items = {};
		result.rows
			.forEach( item => {
				if ( ! items[ item.hour_of_day ] ) {
					items[ item.hour_of_day ] = [];
				}
				items[ item.hour_of_day ].push( { ... item } );
			} );
		items = Object.values( items )
			.map( item => {

				const average = item
					.reduce( ( itemA, itemB ) => {
						sails.log({...itemA});
						sails.log({...itemB});
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
