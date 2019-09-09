const c = require('./constants.js');
const m = require('./misc.js');
const build = require('./buildstatsfields.js');
const mobdata = require('../Data/mobdata.json');
const bossdata = require('../Data/bossdata.json');
const currentfight = require('../Data/currentfight.json');
const u = require('./utilities.js');
logger = require('./logger.js');


/**
 * Maybe spawns a mob -  26% chance. 
 * Maybe spawns a boss - .4% chance.
 */
exports.maybeSpawn = (bot) => {
    var num = m.getRand(1, 15);
    var prevNum;
    if (currentfight.mobSpawned === true) { return; }

    if (num > 0) {
        if (num !== prevNum) {
            exports.spawnMob(bot);
        } else {
            exports.spawnBoss(bot);
        }
        prevNum = num;
    }
};

/**
 * Spawns a Mob
 *
 * @param {object} bot - discord bot client
 */
exports.spawnMob = (bot) => {
    currentfight.mobSpawned = true;
    u.exportJson(currentfight, 'currentfight');
    spawnEmbed(bot, build.buildStatFields(chooseMob(), 'max hp'));

}

/**
 * Spawns a Boss
 *
 * @param {object} bot - discord bot client
 */

exports.spawnBoss = () => {
    currentfight.mobSpawned = true;
    u.exportJson(currentfight, 'currentfight');
    spawnEmbed(bot, build.buildStatFields(chooseBoss(), 'max hp'));

}

/**
 * Randomly chooses a tier and boss from that tier
 *
 */

chooseBoss = () => {
    var tiernum = m.getRand(1, 100)
    if (tiernum < 70) { tier = 'tier1' }
    else if (tiernum < 90) { tier = 'tier2' }
    else if (tiernum < 101) { tier = 'tier3' }
    var pick = m.getRand(0, bossdata[tier].length);
    return bossdata[tier][pick];
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
 * Spawns a Boss
 *
 * @param {object} bot - discord bot client
 * @param {object} statsField - unique stats imported from data and configured for embed
 */

spawnEmbed = (bot, statsFields) => {
    bot.channels.get(c.ARENA_CHANNEL_ID).send({
        embed: {
            color: 3021383,
            title: `🅻🆅🅻${statsFields["level"]}  **${statsFields["name"]}** `,
            description: statsFields["hp"],
            footer: {
                text: `REWARD: ${statsFields["reward"]}💰`
            },
            image: {
                url: statsFields["img"]
            },
            fields: [
                {
                    name: `⚔ **${statsFields["attack"]}**`,
                    value: '\u200B',
                    inline: true
                },
                {
                    name: `🛡 **${statsFields["armor"]}**`,
                    value: '\u200B',
                    inline: true
                }
            ]
        }
    }).then(message => {
        if (message) {
            guild = bot.guilds.get(c.GUILD_ID);
            msgId = guild.members.get(c.BOT_USER_ID).lastMessageID;
            currentfight.currentBossEmbed = msgId;
            u.exportJson(currentfight, 'currentfight');
        }
    });
}