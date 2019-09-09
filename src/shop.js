const c = require('./constants.js');
const m = require('./misc.js');
const u = require('./utilities.js');
const playerdata = require('../Data/playerdata.json');
const shopdata = require('../Data/shopdata.json');
const botSettings = require("../botsettings.json");
const prefix = botSettings.prefix;
const Discord = require("discord.js");
logger = require('./logger.js');

/**
 * checks if player has enough currency for purchase
 *
 * @param {object} msg - message from user
 * @param {number} cost - value of item
 */

checkCurrency = (msg, cost) => {
    userID = msg.author.id;
    if (playerdata[userID].currency >= cost) {
        return true;
    }
    msg.channel.send({
        embed: {
            color: 3021383,
            title: `${msg.author.username}, you are too broke to afford: ${shopdata.items[i].name}!`
        }
    });
    return false;
}

/**
 * sends an embed with the shop data
 *
 * @param {object} msg - message from user
 * @param {object} item - item buying equiped
 */

equipItems = (msg, item) => {
    userID = msg.author.id;
    if (shopdata.items[i].type === "armor" && playerdata[userID].defense < item.armor) {
        playerdata[userID].defense += item.armor;
        playerdata[userID].armor = item.name;
        playerdata[userID].maxhp = 15 + item.armor;
    }
    if (shopdata.items[i].type === "weapon" && playerdata[userID].attack < item.attack) {
        playerdata[userID].attack += item.attack;
        playerdata[userID].weapon = item.name;
    }
    if (shopdata.items[i].type === "consumable") {
        playerdata[userID].inventory['health-potions'] += 1;
    }
    u.exportJson(playerdata, 'playerdata');
}

/**
 * purchases item
 *@param {string} command - user command
 * @param {object} msg - message from user
 * @param {object} msgArray - array of user's message
 */

exports.purchaseItem = (command, msg, msgArray) => {
    userID = msg.author.id;
    if (command !== `${prefix}buy` || msg.channel.id !== c.BOT_CHANNEL_ID) { return; }
    var keys = Object.keys(shopdata.items)
    for (i = 0; i < keys.length; i++) {
        if (msgArray[1] === shopdata.items[i].name) {
            if (checkCurrency(msg, shopdata.items[i].cost)) {
                playerdata[userID].currency -= shopdata.items[i].cost;
                u.exportJson(playerdata, 'playerdata');
                equipItems(msg, shopdata.items[i]);
                msg.channel.send({
                    embed: {
                        color: 3021383,
                        title: `${msg.author.username}, you purchased: ${shopdata.items[i].name}!`
                    }
                });
            }
        }
    }

}

/**
* sends an embed with the shop data
*
* @param {string} command - command from user
* @param {object} msg - message from user
*/

exports.shopEmbed = (command, msg) => {
    if (command !== `${prefix}shop` || msg.channel.id !== c.BOT_CHANNEL_ID) { return; }
    m.maybeCreatePlayerData(msg.author.id);

    var embed = new Discord.RichEmbed()
        .setColor(3021383)
        .setTitle(`--------------------------------**ITEM SHOP**--------------------------------`)
        .setDescription('Type **"!buy <itemname>"** to purchase items');
    var keys = Object.keys(shopdata.items)

    for (i = 0; i < keys.length; i++) {
        if (shopdata.items[i].type === "armor") {
            type = "armor";
            emoji = "🛡️ ";
        } else if (shopdata.items[i].type === "weapon") {

            type = "attack";
            emoji = "⚔ ";
        } else if (shopdata.items[i].type === "consumable") {

            type = "health";
            emoji = "❤️ ";
        }
        embed.addField(shopdata.items[i].name, `(Tier: ${shopdata.items[i].tier})`, true);
        embed.addField("Stats:", emoji + `${shopdata.items[i][type]}`, true);
        embed.addField("Cost:", "💰 " + `${shopdata.items[i].cost}`, true);
    }
    msg.guild.channels.get(c.BOT_CHANNEL_ID).send(embed);
}