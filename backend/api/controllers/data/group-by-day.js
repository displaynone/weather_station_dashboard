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
		timediff: {
			description: 'Time difference',
			type: 'number',
		},
		average: {
			description: 'Returns average',
			type: 'boolean',
		},
		max: {
			description: 'Returns max value',
			type: 'boolean',
		},
	},


	exits: {

	},


	fn: async function ( { day, month, year, average = false, max = false, timediff } ) {

		const getAverage = ( data ) => {
			let items = {};
			data.forEach( item => {
				if ( ! items[ item.hour_of_day ] ) {
					items[ item.hour_of_day ] = [];
				}
				items[ item.hour_of_day ].push( { ... item } );
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
		};

		const getMax = ( data ) => {
			let items = {};
			data.forEach( item => {
				if ( ! items[ item.hour_of_day ] ) {
					items[ item.hour_of_day ] = [];
				}
				items[ item.hour_of_day ].push( { ... item } );
			} );
			items = Object.values( items )
				.map( item => {
					return item
						.reduce( ( itemA, itemB ) => {
							return {
								... itemA,
								temperature: Math.max( itemA.temperature, itemB.temperature ),
								humidity: Math.max( itemA.humidity, itemB.humidity ),
								pressure: Math.max( itemA.pressure, itemB.pressure ),
								heatindex: Math.max( itemA.heatindex, itemB.heatindex ),
								rain: Math.max( itemA.rain, itemB.rain ),
							};
						} );
				} );
			return items;
		};

		const startDate = new Date( year, month - 1, day ).getTime() + ( timediff * 60 *  1000 );
		const endDate = new Date( year, month - 1, day, 23, 59 ).getTime() + ( timediff * 60 * 1000 );
		const query = 'select createdAt, HOUR( FROM_UNIXTIME( createdAt / 1000 ) ) as hour_of_day, FROM_UNIXTIME( createdAt / 1000 ) date, `id`, `temperature`, `heatindex`, `humidity`, `pressure`, `rain` from `data` where `createdAt` >= $1 and `createdAt` <= $2 order by 1';
		const result = await sails.getDatastore().sendNativeQuery( query, [ startDate, endDate ] );
		if ( ! average && ! max ) {
			return result.rows;
		} else if ( average ) {
			return getAverage( result.rows );
		} else if ( max ) {
			return getMax( result.rows );
		}
	}

};
