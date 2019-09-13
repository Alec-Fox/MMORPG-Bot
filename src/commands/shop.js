const { constructEmbed } = require('../util/utilities.js');
const { items } = require('../data/shopdata.json');

module.exports = {
    name: 'shop',
    description: 'Displays the item shop.',
    aliases: ['store'],
    usage: '',
    cooldown: 5,
    execute(message) {
        message.delete();

        const title = '--------------------------------**ITEM SHOP**--------------------------------';
        const description = 'Type **".buy <itemname>"** to purchase items';
        const keys = Object.keys(items);
        const embedFields = [];
        for (let i = 0; i < keys.length; i++) {
            const data = (items[i].type === 'armor') ? { type: 'armor', emoji: '🛡' } : (items[i].type === 'weapon') ? { type: 'attack', emoji: '⚔ ' } : { type: 'health', emoji: '❤️ ' };
            embedFields.push({ name: items[i].name, value: `(Tier: ${items[i].tier})`, inline: true });
            embedFields.push({ name: 'Stats: ', value: data.emoji + `+ ${items[i][data.type]}`, inline: true });
            embedFields.push({ name: 'Cost:', value: '💰 ' + `${items[i].cost}`, inline: true });
        }

        const embed = constructEmbed(title, description, null, embedFields);
        return message.channel.send(embed);


    },
};