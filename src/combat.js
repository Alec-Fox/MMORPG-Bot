const u = require('./utilities.js');
const m = require('./misc.js');
const c = require('./constants.js');
const currentfight = require('../Data/currentfight.json');
const playerdata = require('../Data/playerdata.json');
const botSettings = require("../botsettings.json");
const build = require('./buildstatsfields.js');
const prefix = botSettings.prefix;
const combat = require('./combat.js');

/**
 * resets fight
 */
exports.resetFight = () => {
    currentfight.mobSpawned = false;
    currentfight.currentBoss = null;
    currentfight.currentBossEmbed = null;
    u.exportJson(currentfight, 'currentfight');

}

/**
 * Deletes and resends embed with updated HP
 *
 * @param {object} msg - message from user
 */

updateBossCurrentHp = (msg) => {
    guild = msg.guild;
    userID = msg.author.id;
    msg.channel.fetchMessage(currentfight.currentBossEmbed).then(msg2 => {
        if (msg2) {
            msg2.delete();
            var hp = '';
            for (i = 0; i < playerdata[userID].currenthp; i++) {
                hp += "❤️";
            }
            msg.channel.send({
                embed: {
                    color: 3021383,
                    title: `${msg.author.username}: ⚔${playerdata[userID].attack} - [${playerdata[userID].currenthp}/${playerdata[userID].maxhp}]${hp}`
                }
            });
            updateEmbed(guild, build.buildStatFields(currentfight.currentBoss, 'current hp'))
            if (currentfight.currentBoss['current hp'] <= 0) {
                reward = currentfight.currentBoss.reward;
                xp = currentfight.currentBoss.level;
                calculateReward(msg, reward, xp);
            }
        }

    });
}

/**
 * Deletes and resends embed with updated HP
 *
 * @param {object} msg - message from user
 *  @param {number} reward - amount of gold from defeating monster
 *  @param {number} xp - amount of xp from defeating monster
 */

calculateReward = (msg, reward, xp) => {
    userID = msg.author.id;
    playerdata[userID].currency += reward;
    u.exportJson(playerdata, 'playerdata');
    m.calculateXp(msg, xp);
    combat.resetFight();
}

/**
 * Attacks monsters - dealing damage to both parties respective of their attack bonus
 *
 * @param {string} command - command from user
 * @param {object} msg - message from user
 */

exports.attack = (command, msg) => {
    if (command !== `${prefix}attack` || msg.channel.id !== c.ARENA_CHANNEL_ID) { return; }
    if (!currentfight.currentBoss) {
        msg.channel.send({
            embed: {
                color: 3021383,
                title: 'Nothing to fight!'
            }
        });
        return;
    }
    userID = msg.author.id;

    currentfight.currentBoss['current hp'] -= playerdata[userID].attack;
    playerdata[userID].currenthp -= currentfight.currentBoss.attack;
    u.exportJson(currentfight, 'currentfight');
    u.exportJson(playerdata, 'playerdata');
    updateBossCurrentHp(msg);
    m.calculateDeath(msg);


}

/**
 * Updates embed with current monster hp
 *
 * @param {object} guild - discord guild
 * @param {object} statsField - unique stats imported from data and configured for embed
 */

updateEmbed = (guild, statsFields) => {
    guild.channels.get(c.ARENA_CHANNEL_ID).send({
        embed: {
            color: 3021383,
            title: `🅻🆅🅻${statsFields["level"]}  **${statsFields["name"]}** `,
            description: statsFields["hp"],
            footer: {
                text: `Reward: ${statsFields["reward"]} 💰`
            },
            image: {
                url: statsFields["img"]
            },
            fields: [
                {
                    name: `⚔ **${statsFields["attack"]}**`,
                    value: '-',
                    inline: true
                },
                {
                    name: `🛡️ **${statsFields["armor"]}**`,
                    value: '-',
                    inline: true
                }
            ]
        }
    }).then(message => {
        if (message) {
            msgId = guild.members.get(c.BOT_USER_ID).lastMessageID;
            currentfight.currentBossEmbed = msgId;
            u.exportJson(currentfight, 'currentfight');
        }
    });
}
