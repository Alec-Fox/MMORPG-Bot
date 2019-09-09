const c = require('./constants.js');
const u = require('./utilities.js');
const botSettings = require("../botsettings.json");
const prefix = botSettings.prefix;
const playerdata = require('../Data/playerdata.json');
const Discord = require("discord.js");
const combat = require('./combat.js');
logger = require('./logger.js');

/**
 * deletes non commands from command channels
 *
 * @param {string} command - command from user
 * @param {object} msg - message from user
 */

exports.checkCommand = (command, msg) => {
    if (msg.channel.id !== c.ARENA_CHANNEL_ID || msg.author.id === c.BOT_USER_ID) { return; }
    msg.delete();

}

/**
 * Gets a random number between min and max.
 * The maximum is exclusive and the minimum is inclusive
 *
 * @param {Number} min - the minimum
 * @param {Number} max - the maximum
 */

exports.getRand = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);

    //return Math.floor(Math.random() * (max - min)) + min;
    return Math.floor(Math.random() * max)
}

/**
 * Creates player data if non exists
 *
 * @param {string} userID - user's discord ID
 */

exports.maybeCreatePlayerData = (userID) => {
    if (playerdata[userID]) { return; }
    playerdata[userID] = Object.assign({}, c.NEW_PLAYER_DATA);
    u.exportJson(playerdata, 'playerdata');
}

/**
 * calculates if the player will level up
 *
 * @param {object} msg - message from user
 */

calculateLvlUp = (msg) => {
    userID = msg.author.id;
    if (playerdata[userID].currentxp >= playerdata[userID].maxxp) {
        playerdata[userID].level++;
        playerdata[userID].maxhp++;
        playerdata[userID].currentxp = 0;
        playerdata[userID].currenthp = playerdata[userID].maxhp;
        playerdata[userID].maxxp = c.LEVEL_XP_TOTALS[`${playerdata[userID].level}`];

        msg.channel.send({
            embed: {
                color: 3021383,
                title: `${msg.author.username} **YOU ARE NOW ** 🅻🆅🅻 ${playerdata[userID].level}!`
            }
        });

        u.exportJson(playerdata, 'playerdata');

    }
}

/**
 * deletes non commands from command channels
 *
 * @param {object} msg - message from user
 * @param {number} xp - amount of xp to give the user
 */
exports.calculateDeath = (msg) => {
    userID = msg.author.id
    if (playerdata[userID].currenthp <= 0) {
        msg.channel.send({
            embed: {
                color: 3021383,
                title: `☠️☠️${msg.author.username} **YOU HAVE DIED. The monster has fleed.** ☠️☠️`
            }
        });
        playerdata[userID].currentxp = Math.floor(playerdata[userID].currentxp / 2);
        playerdata[userID].currenthp = Math.floor(playerdata[userID].maxhp / 3);
        combat.resetFight();
    }
    u.exportJson(playerdata, 'playerdata');
}

/**
 * adds xp to user
 *
 * @param {string} command - command from user
 * @param {object} msg - message from user
 */

exports.calculateXp = (msg, xp) => {
    userID = msg.author.id;
    playerdata[userID].currentxp += xp;
    u.exportJson(playerdata, 'playerdata');
    calculateLvlUp(msg);
}

/**
 * uses health-pot if the user has one
 *
 * @param {string} command - command from user
 * @param {object} msg - message from user
 */

exports.useHpPot = (command, msg) => {
    userID = msg.author.id;
    if (command !== `${prefix}pot` || msg.channel.parentID !== c.BOT_CATEGORY_ID) { return; }
    if (playerdata[userID].inventory['health-potions'] < 1) {
        msg.channel.send({
            embed: {
                color: 3021383,
                title: `${msg.author.username} you do not have any health-potions!`
            }
        });
        return;
    }
    playerdata[userID].inventory['health-potions']--;
    playerdata[userID].currenthp += 20;
    if (playerdata[userID].currenthp > playerdata[userID].maxhp) {
        playerdata[userID].currenthp = playerdata[userID].maxhp;
    }
    msg.channel.send({
        embed: {
            color: 3021383,
            title: `${msg.author.username} you have been healed by 20❤️!`
        }
    });
    u.exportJson(playerdata, 'playerdata');
}

/** sends message in #fortnite-bot with list of bot commands
 * 
 * @param {string} command 
 * @param {object} msg 
 */
exports.helpMessage = (command, msg) => {
    if (command !== `${prefix}help` || msg.channel.id !== c.BOT_CHANNEL_ID) { return; }
    msg.channel.send({
        embed: {
            color: 3021383,
            description: c.HELP_LIST
        }
    });
}

/**
 * sends stats player data to embed
 *
 * @param {string} command - command from user
 * @param {object} msg - message from user
 */

exports.sendPlayerData = (command, msg) => {
    if (command !== `${prefix}stats` || msg.channel.parentID !== c.BOT_CATEGORY_ID) { return; }
    userID = msg.author.id;
    var hp = '';
    for (i = 0; i < playerdata[userID].currenthp; i++) {
        hp += "❤️";
    }
    var xpBar = '';
    for (i = 0; i < playerdata[userID].currentxp; i++) {
        xpBar += '⬜';
    }
    remainingXp = playerdata[userID].maxxp - playerdata[userID].currentxp;
    for (i = 0; i < remainingXp; i++) {
        xpBar += '⬛';
    }
    var embed = new Discord.RichEmbed()
        .setColor(3021383)
        .setTitle(`🅻🆅🅻 ${playerdata[userID].level} - ${msg.author.username}'s Stats`)
        .setDescription(`[${playerdata[userID].currenthp}/${playerdata[userID].maxhp}]${hp}`)
        .addField(`⚔${playerdata[userID].attack}`, `**${playerdata[userID].weapon}**`, true)
        .addField(`🛡️${playerdata[userID].defense}`, `**${playerdata[userID].armor}**`, true)
        .addField(`💰${playerdata[userID].currency}`, 'GOLD', true)
        .addField("```INVENTORY: \nhealth-potions: 🍾```" + `${playerdata[userID].inventory['health-potions']}`, `XP: [${playerdata[userID].currentxp}/${playerdata[userID].maxxp}]${xpBar}`, true);

    msg.channel.send(embed);
}

