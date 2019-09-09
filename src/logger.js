const c = require('./constants.js');

/**
 * exports logs to discord server-log channel
 *
 * @param {object} bot - discord bot client
 * @param {string} text - logger text
 */

function Logger() { }
Logger.prototype.info = function (bot, text) {

    bot.channels.get(c.LOGGER_CHANNEL_ID).send(new Date().toLocaleString() + ': ' + text);
}
module.exports = new Logger();