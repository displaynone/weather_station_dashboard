const moment = require( 'moment' );

module.exports = {


	friendlyName: 'Data by period',


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
		offset: {
			description: 'Number of days',
			type: 'number',
			required: true,
		},
		average: {
			description: 'Create average',
			type: 'boolean',
		},
		lastdays: {
			description: 'Current day is the last day',
			type: 'boolean',
		},
	},


	exits: {

	},


	fn: async function ( { day, month, year, average, lastdays, offset } ) {
		/**
		 * Gets the timestamp using the timezone
		 *
		 * @param {Moment} date Date
		 * @return {int}
		 */
		const getTimestamp = date => {
			return date.valueOf() + ( date.utcOffset() * 60 * 1000 );
		};

		// const currentDate = moment([year, month - 1, day]).hour(23).minutes(59).seconds(59);
		const currentDate = moment( new Date( year, month-1, day, 23, 59, 59 ) );
		const startDate = lastdays
			? currentDate.clone().subtract( offset, 'days' )
			: currentDate.clone().weekday(1);
		const endDate = lastdays
			? currentDate.clone()
			: currentDate.clone().weekday(7);
		const query = 'select createdAt, `id`, `temperature`, `humidity`, `pressure` from `data` where `createdAt` >= $1 and `createdAt` <= $2 order by 1';
		const rawResult = await sails.getDatastore().sendNativeQuery( query, [ getTimestamp( startDate ), getTimestamp( endDate ) ] );
		const result = rawResult.rows.map( item => {
			const date = new Date( item.createdAt );
			item[ 'day_of_week' ] = date.getDay();
			item[ 'day_of_month' ] = date.getDate();
			return item;
		} );
		if ( ! average ) {
			return result;
		}
		let items = {};

		rawResult.rows
			.forEach( item => {
				const index = parseInt( new Date( item.createdAt ).toISOString().split( 'T' )[ 0 ].replace( /-/g, '' ) );
				if ( ! items[ index ] ) {
					items[ index ] = [];
				}
				items[ index ].push( { ... item } );
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
	}

};
