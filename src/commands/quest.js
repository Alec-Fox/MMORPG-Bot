const { decideUser } = require('../util/utilities.js');
const { BOT_CHANNEL_ID } = require('../util/constants.js');

module.exports = {
    name: 'quest',
    description: 'Display your quest or get a new one. Type .quest @ user to view their quest.',
    aliases: ['quests', 'mission'],
    usage: ' or .quest @user',
    cooldown: 5,
    execute(message) {
        message.delete();
        if(message.channel.id !== BOT_CHANNEL_ID) return;
        const specifiedMember = message.mentions.members.first();
        const userID = decideUser(message, specifiedMember);
        return message.client.players[userID].getQuest(message);
        },
};