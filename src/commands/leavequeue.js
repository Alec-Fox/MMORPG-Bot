const dungeondata = require('../data/dungeondata');
const { exportJson, constructEmbed } = require('../util/utilities.js');
module.exports = {
    name: 'leave',
    description: 'Leaves the queue for a dungeon.',
    usage: 'queue',
    args: true,
    cooldown: 5,
    execute(message) {
        message.delete();
        let inQueue = false;
        for (let i = 0; i < dungeondata.queue.length; i++) if (dungeondata.queue[i].id === message.member.id) inQueue = true;
        if (inQueue) {
            const newQueue = dungeondata.queue.filter(function(user) { return user.id !== message.member.id; });
            dungeondata.queue = newQueue;
            exportJson(dungeondata, 'dungeondata');
            return message.channel.send(constructEmbed(`${message.member.displayName} you have left the queue!`, '', null, null));
        }
        return message.channel.send(constructEmbed(`${message.member.displayName} you are not in the queue!`, '', null, null));
    },
};