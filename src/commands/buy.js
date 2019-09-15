const { constructEmbed } = require('../util/utilities.js');
const { items } = require('../data/shopdata.json');

module.exports = {
    name: 'buy',
    description: 'Purchases an item the shop.',
    aliases: ['purchase'],
    usage: '[item name] or [buy] [item name] [qty]',
    cooldown: 1,
    args: true,
    execute(message, args) {
        message.delete();
        const userID = message.member.id;
        const keys = Object.keys(items);
        const itemSelection = args[0];
        let qty = Number(args[1]);
        if(!qty) qty = 1;
        if (!Number.isInteger(qty) || qty < 0) return message.reply('that\'s not a valid command, use .buy [item name] [qty]!');
        const itemList = [];
        for (let i = 0; i < keys.length; i++) {
            itemList.push(items[i].name);
            if (itemSelection === items[i].name && message.client.players[userID].canAfford(items[i].cost, qty)) {
                message.client.players[userID].equip(message, items[i], qty);
                return message.channel.send({
                    embed: {
                        color: 3021383,
                        thumbnail: { url: `${items[i].img}` },
                        title: `${message.member.displayName}, you purchased: ${items[i].name}! (qty: ${qty})`,
                    },
                });
            }
            if (itemSelection === items[i].name && !message.client.players[userID].canAfford(items[i].cost)) {
                const embed = constructEmbed(`${message.member.displayName}, you are too broke to afford: ${items[i].name}`, '', null, null);
                return message.channel.send(embed);
            }
        }
        if (!itemList.includes(itemSelection)) return message.channel.send(constructEmbed(`${message.member.displayName}, that item doesnt exist. Type !shop to view available items.`, '', null, null));
    },
};