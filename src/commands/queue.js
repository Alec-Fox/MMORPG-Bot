const { constructEmbed } = require('../util/utilities.js');

module.exports = {
    name: 'queue',
    description: 'Displays the queue for a dungeon.',
    usage: 'queue',
    cooldown: 5,
    async execute(message) {
        message.delete();
        const client = message.client;
        const embed = constructEmbed('--------------------------**Dungeon Queue**--------------------------', '', null, null);
        for(let i = 0; i < message.client.dungeon.queue.length; i++) {
            const user = await client.fetchUser(message.client.dungeon.queue[i].id);
            embed.addField(`${user.username}`, '\u200B', true);
        }
        return message.channel.send(embed);
    },
};