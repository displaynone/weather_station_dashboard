module.exports = {


	friendlyName: 'Data by month',


	description: 'Data grouped by month.',


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
		const currentDate = new Date( year, month - 1, day );
		const startDate = new Date( currentDate.getFullYear(), currentDate.getMonth(), 1).getTime();
		const endDate = new Date( currentDate.getFullYear(), currentDate.getMonth()+1, 0).getTime();
		const query = 'select createdAt, DAY( FROM_UNIXTIME( createdAt / 1000 ) ) as day_of_month, `id`, `temperature`, `humidity`, `pressure`, `heatindex`, `rain` from `data` where `createdAt` >= $1 and `createdAt` <= $2 order by 1';
		const result = await sails.getDatastore().sendNativeQuery( query, [ startDate, endDate ] );
		if ( ! average ) {
			return result.rows;
		}
		let items = {};
		result.rows
			.forEach( item => {
				if ( ! items[ item.day_of_month ] ) {
					items[ item.day_of_month ] = [];
				}
				items[ item.day_of_month ].push( { ... item } );
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
