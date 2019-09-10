const c = require('./constants.js');
const u = require('./utilities.js');
const botSettings = require("../botsettings.json");
const prefix = botSettings.prefix;
const playerdata = require('../Data/playerdata.json');
const mobdata = require('../Data/mobdata.json');
const m = require('./misc.js');
const Discord = require("discord.js");
logger = require('./logger.js');

/**
 *Checks if player has quest active already
 *
 * @param {string} userID- msg.author.id
 */

checkQuestActive = (userID) => {
    if (playerdata[userID].quest.active) { return true; }
    else {
        return false;
    }
}

/**
 * Resets Quest
 * @param {object} msg - message from user
 */

resetQuest = (userID) => {
    playerdata[userID].quest = { "active": false, "type": "", "total": null, "progress": null };
    u.exportJson(playerdata, 'playerdata');
}

/**
 * Abandons Quest
 *
 * @param {string} command - command from user
 * @param {object} msg - message from user
 */

exports.abandonQuest = (command, msg) => {
    if (command !== `${prefix}abandon` || msg.channel.id !== c.BOT_CHANNEL_ID) { return; }
    userID = msg.author.id;
    resetQuest(userID);
    msg.channel.send({
        embed: {
            color: 3021383,
            title: `${msg.author.username}, you abandoned your quest!`
        }
    });
}


/**
 * Randomly chooses a tier and mob from that tier
 *
 */

chooseMob = () => {
    var tiernum = m.getRand(1, 100)
    if (tiernum < 70) {
        tier = 'tier1'
    } else if (tiernum < 90) { tier = 'tier2' }
    else if (tiernum < 101) { tier = 'tier3' }
    var pick = m.getRand(0, mobdata[tier].length);
    return mobdata[tier][pick];
}

/**
 * Creates Quest if they dont have one.
 *
 * @param {string} userID - msg.author.id
 * @param {string} currentMonster - current monster in combat
 */

exports.questProgressCheck = (msg, currentMonster) => {
    userID = msg.author.id;
    if (playerdata[userID].quest.type === currentMonster) {
        playerdata[userID].quest.progress++;
        u.exportJson(playerdata, 'playerdata');

        if (playerdata[userID].quest.progress >= playerdata[userID].quest.total) {
            reward = playerdata[userID].quest.reward
            playerdata[userID].currency += reward;
            u.exportJson(playerdata, 'playerdata');
            msg.channel.send({
                embed: {
                    color: 3021383,
                    title: `${msg.author.username}, you completed your quest and received: 💰${reward}`
                }
            });
            resetQuest(userID);
        }
    }
}

/**
 * Builds quest embed fields
 ** @param {string} userID - msg.author.id
 */
generateQuest = (userID) => {
    questData = chooseMob();
    totalQuest = m.getRand(1, 10);
    playerdata[userID].quest = { "active": true, "type": `${questData.name}`, "total": totalQuest, "progress": 0, "reward": totalQuest, "img": questData.image};
    u.exportJson(playerdata, 'playerdata');
}

/**
 * Builds quest embed fields
 ** @param {string} userID - msg.author.id
 */
buildQuestField = (userID) => {
    var embed = new Discord.RichEmbed()
        .setColor(3021383)
        .setTitle(`--------------------------------**Active Quest**--------------------------------`)
        .setThumbnail(`${playerdata[userID].quest.img}`) ;
    embed.addField(`Bounty: ${playerdata[userID].quest.type}`, `Progress: [${playerdata[userID].quest.progress}/ ${playerdata[userID].quest.total}]`);
    embed.addField(`Reward: 💰${playerdata[userID].quest.reward}`, '**--------------------------------------------------------------------------------**');

    return embed;
}

/**
 * creates Quest if they dont have one.
 *
 * @param {string} command - command from user
 * @param {object} msg - message from user
 */

exports.maybeCreateQuest = (command, msg) => {
    if (command !== `${prefix}quest` || msg.channel.id !== c.BOT_CHANNEL_ID) { return; }
    userID = msg.author.id;
    if (!checkQuestActive(userID)) {
        generateQuest(userID);
        questEmbed = buildQuestField(userID);
        msg.channel.send(questEmbed);

    }
    else {
        questEmbed = buildQuestField(userID);
        msg.channel.send(questEmbed);

    }
}
