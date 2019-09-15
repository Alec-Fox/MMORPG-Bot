const { decideUser } = require('../util/utilities.js');
const { BOT_CHANNEL_ID } = require('../util/constants.js');

module.exports = {
    name: 'achievements',
    description: 'Displays user\'s accolades',
    aliases: ['medals'],
    usage: '',
    cooldown: 5,
    async execute(message) {
        message.delete();
        if(message.channel.id !== BOT_CHANNEL_ID) return;
        const specifiedMember = message.mentions.members.first();
        const userID = decideUser(message, specifiedMember);
        return message.client.players[userID].medals(message);
    },
};