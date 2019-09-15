const { constructEmbed } = require('../util/utilities.js');
const { BOT_CHANNEL_ID } = require('../util/constants.js');

module.exports = {
    name: 'join',
    description: 'Joins the queue for a dungeon.',
    usage: 'queue',
    args: true,
    cooldown: 5,
    execute(message) {
        message.delete();
        if(message.channel.id !== BOT_CHANNEL_ID) return;
        const userID = message.member.id;
        let inQueue = false;
        for (let i = 0; i < message.client.dungeon.queue.length; i++) if (message.client.dungeon.queue[i].id === message.member.id) inQueue = true;
        if (!message.client.players[userID].dungeonActive && !inQueue) {
            message.client.dungeon.queue.push({ id: `${message.member.id}` });
            return message.channel.send(constructEmbed(`${message.member.displayName} you have joined the queue!`, '', null, null));
        }
        return message.channel.send(constructEmbed(`${message.member.displayName} you are already in a queue or in a dungeon!`, '', null, null));
    },
};