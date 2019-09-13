const { constructEmbed, exportJson } = require('../util/utilities.js');
const { items } = require('../data/shopdata.json');
const playerdata = require('../data/playerdata.json');

module.exports = {
    name: 'buy',
    description: 'Purchases an item the shop.',
    aliases: ['purchase'],
    usage: '[item name]',
    cooldown: 1,
    args: true,
    execute(message, args) {
        message.delete();
        const userID = message.member.id;
        const keys = Object.keys(items);
        const itemSelection = args[0];
        const itemList = [];
        for (let i = 0; i < keys.length; i++) {
            itemList.push(items[i].name);
            if (itemSelection === items[i].name && checkCurrency(userID, items[i].cost)) {
                playerdata[userID].currency -= items[i].cost;
                exportJson(playerdata, 'playerdata');
                equipItems(userID, items[i]);
                return message.channel.send({
                    embed: {
                        color: 3021383,
                        thumbnail: { url: `${items[i].img}` },
                        title: `${message.member.displayName}, you purchased: ${items[i].name}!`,
                    },
                });
            }
            if (itemSelection === items[i].name && !checkCurrency(userID, items[i].cost)) {
                const title = `${message.member.displayName}, you are too broke to afford: ${items[i].name}`;
                const embed = constructEmbed(title, '', null, null);
                return message.channel.send(embed);
            }
        }
        if (!itemList.includes(itemSelection)) return message.channel.send(constructEmbed(`${message.member.displayName}, that item doesnt exist. Type !shop to view available items.`, '', null, null));
    },
};

const checkCurrency = (userID, cost) => {
    if (playerdata[userID].currency >= cost) return true;
    return false;
};

const equipItems = (userID, item) => {
    if (item.type === 'armor') {
        playerdata[userID].defense = 0 + item.armor;
        playerdata[userID].armor = item.name;
        playerdata[userID].basehp = 15 + item.armor;
    }
    if (item.type === 'weapon') {
        playerdata[userID].attack = 1 + item.attack;
        playerdata[userID].weapon = item.name;
    }
    if (item.type === 'consumable') {
        playerdata[userID].inventory['health-potions'] += 1;
    }
    exportJson(playerdata, 'playerdata');
};