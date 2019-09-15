const { decideUser } = require('../util/utilities.js');
module.exports = {
    name: 'stats',
    description: 'Displays player\'s stats.',
    aliases: ['inventory'],
    usage: 'or .stats @user',
    cooldown: 5,
    execute(message) {
        message.delete();
        const specifiedMember = message.mentions.members.first();
        const userID = decideUser(message, specifiedMember);
        return message.client.players[userID].stats(message);
    },
};