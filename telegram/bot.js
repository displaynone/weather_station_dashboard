require( 'dotenv' ).config();
const { Telegraf } = require( 'telegraf' );
const axios = require('axios').default;

const bot = new Telegraf( process.env.BOT_TOKEN );
const allowedUsers = process.env.ALLOWED_USERS.split( ',' );

/**
 * Returns if the user is allowed
 *
 * @param {Context} ctx Telegraf context
 * @returns {boolean}
 */
const isUserAllowed = ( ctx ) => {
	return allowedUsers.includes( String( ctx.message.from.id ) );
};

/**
 * Sends a message to all the allowed users
 *
 * @param {string} message Message to send
 */
const sendMessage = ( message ) => {
	allowedUsers.forEach( id =>	bot.telegram.sendMessage( id, message ) );
};

/**
 * Returns if the server is getting data from the weather station
 *
 * @param {Response} response Axios response
 * @returns {boolean}
 */
const isReceivingData = ( response ) => {
	const today = new Date();
	const lastEntry = response.data.pop();
	return today.getTime() - new Date( lastEntry.createdAt ).getTime() < 2 * 60 * 60 * 1000;
};

process.once( 'SIGINT', () => bot.stop( 'SIGINT' ) );
process.once( 'SIGTERM', () => bot.stop( 'SIGTERM' ) );

bot.start( ( ctx ) => ctx.reply( 'Welcome' ) );
bot.command( 'online', async() => {
	const today = new Date();
	const url = `${ process.env.API_SERVER }/data/group-by-day?day=${ today.getDate() }&month=${ today.getMonth() + 1 }&year=${ today.getFullYear() }&Now=true&timediff=${ today.getTimezoneOffset() }`;
	axios.get( url )
		.then( ( response ) => {
			if ( isReceivingData( response ) ) {
				sendMessage( '✅' );
			} else {
				sendMessage( '❌' );
			}
		} );
} );

bot.hears( 'hi', ( ctx ) => {
	if ( ! isUserAllowed( ctx ) ) {
		return;
	}
	ctx.reply( 'Hey there' );
} );

bot.launch();

setInterval( () => {
	const today = new Date();
	const url = `${ process.env.API_SERVER }/data/group-by-day?day=${ today.getDate() }&month=${ today.getMonth() + 1 }&year=${ today.getFullYear() }&Now=true&timediff=${ today.getTimezoneOffset() }`;
	axios.get( url )
		.then( ( response ) => {
			if ( ! isReceivingData( response ) ) {
				sendMessage( `Parece que hay un error, el último dato fue en ${ today }` );
			}
		} )
		.catch( ( error ) => {
			sendMessage( `¡Error gordo!:\n${ error.message }` );
		} );
}, 60 * 60 * 1000 );
