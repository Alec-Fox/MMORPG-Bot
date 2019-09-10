const c = require('./constants.js');
const u = require('./utilities.js');
const botSettings = require("../botsettings.json");
const prefix = botSettings.prefix;
const playerdata = require('../Data/playerdata.json');
const mobdata = require('../Data/mobdata.json');
const m = require('./misc.js');
logger = require('./logger.js');

/**
 *Checks if player has quest active already
 *
 * @param {string} command - command from user
 * @param {object} msg - message from user
 */

checkQuestActive = (userID) =>{
    if(playerdata[userID].quest.acvtive) {return true;}
    else{
        return false;
    }
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
    playerdata[userID].quest = {"active": false, "type": "", "total": null, "progress": null};
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
 */
exports.questProgressCheck = (userID) => {

}
/**
 * Builds quest embed fields
 *
 */
buildQuestField = (userID) => {
    var embed = new Discord.RichEmbed()
    .setColor(3021383)
    .setTitle(`--------------------------------**Active Quest**--------------------------------`);


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
    if (!checkQuestActive(userID)){
        questData = chooseMob();
        totalQuest = m.getRand(5,10)
        playerdata[userID].quest = {"active": true, "type": `${questData.name}`, "total": totalQuest, "progress": 0, "reward": totalQuest};
        questEmbed = buildQuestField(userID);
        msg.channel.send(questEmbed);

    }
    else {
        questEmbed = buildQuestField(userID);
        msg.channel.send(questEmbed);

    }
}
