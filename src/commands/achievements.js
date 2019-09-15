const { decideUser } = require('../util/utilities.js');
module.exports = {
    name: 'achievements',
    description: 'Displays user\'s accolades',
    aliases: ['medals'],
    usage: '',
    cooldown: 5,
    async execute(message) {
        message.delete();
        const specifiedMember = message.mentions.members.first();
        const userID = decideUser(message, specifiedMember);
        return message.client.players[userID].medals(message);
    },
};