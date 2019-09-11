const c = require('./constants.js');
const u = require('./utilities.js');
const dungeondata = require('../Data/dungeondata.json')
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

//reset Dungeon Data after reboot
exports.resetDungeon = () => {
    dungeondata.queue = [];
    dungeondata.dungeon = [];
    var keys = Object.keys(playerdata);
    for (i = 0; i < keys.length; i++) {
        playerdata[keys[i]].dungeonActive = false;
        playerdata[keys[i]].dungeonChannel = "";
    }
    u.exportJson(playerdata, 'playerdata');
    u.exportJson(dungeondata, 'dungeondata');
}
/**
 * Calculates if the player will level up
 *
 * @param {object} msg - message from user
 */

calculateLvlUp = (msg) => {
    userID = msg.author.id;
    if (playerdata[userID].level >= 10) { return; }
    if (playerdata[userID].currentxp >= playerdata[userID].maxxp) {
        playerdata[userID].level++;
        playerdata[userID].attack++;
        playerdata[userID].currentxp = 0;
        playerdata[userID].maxxp = c.LEVEL_XP_TOTALS[`${playerdata[userID].level}`];
        playerdata[userID].maxhp++;
        playerdata[userID].currenthp = playerdata[userID].maxhp;
        msg.guild.channels.get(c.BOT_CHANNEL_ID).send({
            embed: {
                color: 3021383,
                title: `${msg.author.username} **YOU ARE NOW ** 🅻🆅🅻 ${c.LEVEL_EMOJI[playerdata[userID].level]}!`,
                image: { url: `https://i.imgur.com/BncqEFS.png` }
            }
        });

        u.exportJson(playerdata, 'playerdata');

    }
}

/**
 * Calculates player death
 *
 * @param {object} msg - message from user
 */

exports.calculateDeath = (msg) => {
    userID = msg.author.id
    if (playerdata[userID].currenthp <= 0) {
        msg.channel.send({
            embed: {
                color: 3021383,
                title: `☠️☠️${msg.author.username} **DIED. The monster fleed.** ☠️☠️`,
                image: { url: c.DEATH_IMAGE }
            }
        });
        playerdata[userID].currentxp = Math.floor(playerdata[userID].currentxp / 2);
        playerdata[userID].currenthp = Math.floor(playerdata[userID].maxhp / 3);
        combat.resetFight();
    }
    u.exportJson(playerdata, 'playerdata');
}

/**
 * Adds xp to user
 *
 * @param {object} msg - message from user
 * * @param {number} xp - xp reward
 */

exports.calculateXp = (msg, xp, player) => {
    playerdata[player].currentxp += xp;
    u.exportJson(playerdata, 'playerdata');
    calculateLvlUp(msg);
}

/**
 * Runs away from monster - reseting combat
 *
 * @param {string} command - command from user
 * @param {object} msg - message from user
 */

exports.flee = (command, msg) => {
    if (command !== `${prefix}flee` || msg.channel.id !== c.ARENA_CHANNEL_ID) { return; }
    msg.channel.send({
        embed: {
            color: 3021383,
            title: `🏃 ${msg.author.username}, you run away from the monster!`
        }
    });
    combat.resetFight();
}

/**
 * Uses health-pot if the user has one
 *
 * @param {string} command - command from user
 * @param {object} msg - message from user
 */

exports.useHpPot = (command, msg, specifiedMember) => {
    if (!specifiedMember) {
        userID = msg.author.id;
        userName = msg.author.username;
    }
    if (specifiedMember) {
        userID = specifiedMember.id;
        userName = specifiedMember.displayName;
    }

    if (command !== `${prefix}pot` || msg.channel.parentID !== c.BOT_CATEGORY_ID) { return; }
    if (playerdata[msg.author.id].inventory['health-potions'] < 1) {
        msg.channel.send({
            embed: {
                color: 3021383,
                title: `${msg.author.username} you do not have any health-potions!`
            }
        });
        return;
    }
    playerdata[msg.author.id].inventory['health-potions']--;
    playerdata[userID].currenthp += 10;
    if (playerdata[userID].currenthp > playerdata[userID].maxhp) {
        playerdata[userID].currenthp = playerdata[userID].maxhp;
    }
    msg.channel.send({
        embed: {
            color: 3021383,
            title: `${userName} you have been healed by 10❤️!`
        }
    });
    u.exportJson(playerdata, 'playerdata');
}

/** Sends message in bot commands with the help list
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
 * Sends stats player data to embed
 *
 * @param {string} command - command from user
 * @param {object} msg - message from user
 */

exports.sendPlayerData = (command, msg, specifiedMember) => {
    if (command !== `${prefix}stats` || msg.channel.parentID !== c.BOT_CATEGORY_ID) { return; }
    if (!specifiedMember) {
        userID = msg.author.id;
        userName = msg.author.username;
    }
    if (specifiedMember) {
        userID = specifiedMember.id;
        userName = specifiedMember.displayName;
    }

    var hp = '';
    for (i = 0; i < playerdata[userID].currenthp; i++) {
        hp += "❤️";
    }
    var xpBar = '';
    xpIconWhite = '⬜';
    xpIconBlack = '⬛';

    for (i = 0; i < playerdata[userID].currentxp; i++) {
        xpBar += xpIconWhite;
    }
    remainingXp = playerdata[userID].maxxp - playerdata[userID].currentxp;
    for (i = 0; i < remainingXp; i++) {
        xpBar += xpIconBlack;
    }
    var embed = new Discord.RichEmbed()
        .setColor(3021383)
        .setTitle(`🅻🆅🅻 ${c.LEVEL_EMOJI[`${playerdata[userID].level}`]}      ${userName}'s Stats`)
        .setDescription(`**HP:[${playerdata[userID].currenthp}/${playerdata[userID].maxhp}]**${hp}`)
        .addField(`⚔${playerdata[userID].attack}`, `**${playerdata[userID].weapon}**`, true)
        .addField(`🛡${playerdata[userID].defense}`, `**${playerdata[userID].armor}**`, true)
        .addField(`💰${playerdata[userID].currency}`, 'GOLD', true)
        .addField("```🅸🅽🆅🅴🅽🆃🅾🆁🆈: \nHEALTH-POTIONS: ```" + `${playerdata[userID].inventory['health-potions']}`, `**XP:[${playerdata[userID].currentxp}/${playerdata[userID].maxxp}]**\n${xpBar}`, true);

    msg.channel.send(embed);
}

/**
 * Displays leaderboards
 *
 * @param {string} command - command from user
 * @param {object} msg - message from user
 */

exports.leaderboard = async (command, msg) => {
    if (command !== `${prefix}leaderboard` || msg.channel.id !== c.BOT_CHANNEL_ID) { return; }
    var keys = Object.keys(playerdata);
    var leaderboardData = []
    client = msg.client;
    for (i = 0; i < keys.length; i++) {
        let user = await client.fetchUser(keys[i]);
        userName = user.username;
        leaderboardData.push({ "username": userName, "lvl": playerdata[keys[i]].level });
    }

    leaderboardData.sort(function (a, b) { return b.lvl - a.lvl });

    var embed = new Discord.RichEmbed()
        .setColor(3021383)
        .setTitle(`**LEADERBOARDS**`);

    for (i = 0; i < leaderboardData.length; i++) {
        embed.addField(`**${leaderboardData[i].username}**`, `🅻🆅🅻 ${c.LEVEL_EMOJI[leaderboardData[i].lvl]}`, true);
    }
    msg.channel.send(embed);
}

/**
 * Displays your achievements.
 *
 * @param {string} command - command from user
 * @param {object} msg - message from user
 */

exports.achievements = (command, msg, specifiedMember) =>{
    if (!specifiedMember) {
        userID = msg.author.id;
        userName = msg.author.username;
    }
    if (specifiedMember) {
        userID = specifiedMember.id;
        userName = specifiedMember.displayName;
    }

    if (command !== `${prefix}achievements` || msg.channel.id !== c.BOT_CHANNEL_ID) { return; }
    var achievements = playerdata[userID].achievements.split("");
    var sortedAchievements = achievements.sort();
    var achievementIcons = "";
    for(i = 0; i < sortedAchievements.length; i++){
        if(sortedAchievements[i] === "1"){
            achievementIcons += c.ACHIEVEMENTS["1"];
        }
        if(sortedAchievements[i] === "2"){
            achievementIcons += c.ACHIEVEMENTS["2"];
        }
        if(sortedAchievements[i] === "3"){
            achievementIcons += c.ACHIEVEMENTS["3"];
        }
    }
    msg.channel.send({
        embed: {
            color: 3021383,
            title: `${userName}'s Achievements: `,
            description: `${achievementIcons}`
        }
    });
    
}