const { decideUser } = require('../util/utilities.js');

module.exports = {
    name: 'quest',
    description: 'Display your quest or get a new one. Type .quest @ user to view their quest.',
    aliases: ['quests', 'mission'],
    usage: ' or .quest @user',
    cooldown: 5,
    execute(message) {
        message.delete();
        const specifiedMember = message.mentions.members.first();
        const userID = decideUser(message, specifiedMember);
        return message.client.players[userID].getQuest(message);
        },
};