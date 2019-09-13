const dungeondata = require('../data/dungeondata');
const playerdata = require('../data/playerdata');
const { exportJson, constructEmbed } = require('../util/utilities.js');
module.exports = {
    name: 'join',
    description: 'Joins the queue for a dungeon.',
    usage: 'queue',
    args: true,
    cooldown: 5,
    execute(message) {
        message.delete();
        const userID = message.member.id;
        let inQueue = false;
        for (let i = 0; i < dungeondata.queue.length; i++) if (dungeondata.queue[i].id === message.member.id) inQueue = true;
        if (!playerdata[userID].dungeonActive && !inQueue) {
            dungeondata.queue.push({ id: `${message.member.id}` });
            exportJson(dungeondata, 'dungeondata');
            return message.channel.send(constructEmbed(`${message.member.displayName} you have joined the queue!`, '', null, null));
        }
        return message.channel.send(constructEmbed(`${message.member.displayName} you are already in a queue or in a dungeon!`, '', null, null));
    },
};