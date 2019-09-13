const dungeondata = require('../data/dungeondata');
const { constructEmbed } = require('../util/utilities.js');
const { BOT_CHANNEL_ID } = require('../util/constants.js');

module.exports = {
    name: 'queue',
    description: 'Displays the queue for a dungeon.',
    usage: 'queue',
    cooldown: 5,
    async execute(message) {
        console.log(dungeondata.queue);
        message.delete();
        const client = message.client;
        const embed = constructEmbed('--------------------------**Dungeon Queue**--------------------------', '', null, null);
        for(let i = 0; i < dungeondata.queue.length; i++) {
            const user = await client.fetchUser(dungeondata.queue[i].id);
            embed.addField(`${user.username}`, '\u200B', true);
        }
        return client.channels.get(BOT_CHANNEL_ID).send(embed);
    },
};