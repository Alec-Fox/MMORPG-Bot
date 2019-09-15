const { constructEmbed } = require('../util/utilities.js');
const { BOT_CHANNEL_ID } = require('../util/constants.js');

module.exports = {
    name: 'leave',
    description: 'Leaves the queue for a dungeon.',
    usage: 'queue',
    args: true,
    cooldown: 5,
    execute(message) {
        message.delete();
        if(message.channel.id !== BOT_CHANNEL_ID) return;
        let inQueue = false;
        for (let i = 0; i < message.client.dungeon.queue.length; i++) if (message.client.dungeon.queue[i].id === message.member.id) inQueue = true;
        if (inQueue) {
            const newQueue = message.client.dungeon.queue.filter(function(user) { return user.id !== message.member.id; });
            message.client.dungeon.queue = newQueue;
            return message.channel.send(constructEmbed(`${message.member.displayName} you have left the queue!`, '', null, null));
        }
        return message.channel.send(constructEmbed(`${message.member.displayName} you are not in the queue!`, '', null, null));
    },
};