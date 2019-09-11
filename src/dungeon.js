const c = require('./constants.js');
const u = require('./utilities.js');
const m = require('./misc.js');
const botSettings = require("../botsettings.json");
const prefix = botSettings.prefix;
const playerdata = require('../Data/playerdata.json');
const Discord = require("discord.js");
const dungeondata = require('../Data/dungeondata.json')
const mobdata = require('../Data/mobdata.json');
const bossdata = require('../Data/bossdata.json');
const q = require('./quest.js')
logger = require('./logger.js');

/**
* Creates the dungeon entrance with everyone in queue
*
* @param {string} command - command from user
* @param {object} msg - message from user
*/

exports.createDungeonInstance = (command, msg) => {
    if (command !== `${prefix}start-dungeon` || msg.channel.id !== c.BOT_CHANNEL_ID) { return; }
    var inQueue = false;
    for (i = 0; i < dungeondata.queue.length; i++) {
        if (dungeondata.queue[i].id === msg.author.id)
            inQueue = true;
    }

    if (inQueue && !playerdata[msg.author.id].dungeonActive) {
        const overwrites = [{
            denied: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
            id: c.GUILD_ID
        }];
        const dungNumber = m.getRand(1, 999);
        msg.guild.createChannel(`Dungeon ${dungNumber}`, { type: "text", parent: msg.guild.channels.get(c.BOT_CATEGORY_ID) }, overwrites)
            .then((channel) => {
                addDungeonToData(channel, dungNumber);
                for (i = 0; i < dungeondata.dungeon[dungeondata.dungeon.length - 1].players.length; i++) {
                    playerId = dungeondata.dungeon[dungeondata.dungeon.length - 1].players[i].id;
                    channel.overwritePermissions(playerId, { VIEW_CHANNEL: true, SEND_MESSAGES: true })
                    playerdata[playerId].dungeonActive = true;
                    playerdata[playerId].dungeonChannel = channel.id;
                    u.exportJson(playerdata, 'playerdata');
                }
                channel.send({
                    embed: {
                        color: 3021383,
                        title: `Let the Fight Begin!`,
                        image: ``
                    }
                })
                msg.channel.send({
                    embed: {
                        color: 3021383,
                        title: `Enter Dungeon ${dungNumber} with your party ${msg.author.username}!`,
                        image: ``
                    }
                });
                spawnFirstDungeonMonster(channel, buildStatFields2(dungeondata.dungeon[dungeondata.dungeon.length - 1].currentMob1, 'max hp'));
            });
    }
    else {
        msg.channel.send({
            embed: {
                color: 3021383,
                title: `${msg.author.username} you are not in a queue or already in a dungeon! join a queue to start a dungeon!`
            }
        });
    }
}
/**
 * Creates an object formatted for embed mob/boss use
 *
 * @param {object} data - stats from data for mobs/bosses
 * @param {string} currentHp - designation to build with current hp or max hp
 */

buildStatFields2 = (data, currentHp) => {
    var statsFields = new Object();
    var hp = '';
    for (i = 0; i < data[currentHp]; i++) {
        hp += "❤️";
    }
    defeatedImage = 'https://i.imgur.com/5e3tLwn.png';
    const lvl = c.LEVEL_EMOJI[`${data.level}`];
    statsFields['hp'] = hp;
    statsFields['attack'] = data.attack;
    statsFields['armor'] = data.defense;
    statsFields['reward'] = data.reward;
    statsFields['name'] = data.name;
    statsFields['level'] = lvl;
    if (hp <= 0) {
        statsFields['img'] = defeatedImage;
    } else { statsFields['img'] = data.image; };
    return statsFields;
}

/**
 * updates the monsters current hp after attacking
 *
 * @param {object} msg - message from user
 * @param {number} index - index for the dungeon instance for the user
 */

updateBossCurrentHp2 = (msg, index) => {
    guild = msg.guild;
    userID = msg.author.id;
    msg.channel.fetchMessage(dungeondata.dungeon[index].lastMessageId).then(msg2 => {
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
            updateEmbed2(guild, buildStatFields2(dungeondata.dungeon[index].currentFight, 'current hp'), index);
            if (dungeondata.dungeon[index].currentFight['current hp'] <= 0) {
                reward = dungeondata.dungeon[index].currentFight.reward;
                xp = dungeondata.dungeon[index].currentFight.level;
                dungeondata.dungeon[index].progress++;
                u.exportJson(dungeondata, 'dungeondata');
                calculateReward2(msg, reward, xp, index);
                maybeContinueDungeon(msg, index);
            }
        }

    });
}

/**
 * spawns another monster from the dungeon or exits the dungeon if its compelete
 *
 * @param {object} msg - message from user
 * @param {number} index - index for the dungeon instance for the user
 */

maybeContinueDungeon = async (msg, index) => {
    guild = msg.guild
    client = msg.client
    if (dungeondata.dungeon[index].progress < 4) {
        dungeondata.dungeon[index].currentFight = dungeondata.dungeon[index][`currentMob${dungeondata.dungeon[index].progress}`];
        dungeondata.dungeon[index].currentFight['current hp'] = dungeondata.dungeon[index].currentFight['max hp'];
        u.exportJson(dungeondata, 'dungeondata');
        msg.channel.send({
            embed: {
                color: 3021383,
                title: `***Another mob approaches!***`
            }
        });
        console.log(dungeondata.dungeon[index].currentFight);
        updateEmbed2(guild, buildStatFields2(dungeondata.dungeon[index].currentFight, 'current hp'), index);
    } else {
        var embed = new Discord.RichEmbed()
            .setColor(3021383)
            .setTitle(`--------------------------------**Victorious**--------------------------------`)
            .setDescription(`***These brave heroes have scrubbed the dungeon clean!***`)

        for (i = 0; i < dungeondata.dungeon[index].players.length; i++) {
            let user = await client.fetchUser(dungeondata.dungeon[index].players[i].id);
            embed.addField(`${user.username}`, `\u200B`, true);
            playerdata[user.id].dungeonActive = false;
            playerdata[user.id].dungeonChannel = "";
            u.exportJson(playerdata, 'playerdata');
        }
        msg.guild.channels.get(c.BOT_CHANNEL_ID).send(embed);
        msg.guild.channels.get(dungeondata.dungeon[index].dungeonID).delete()
    }
}
/**
 * Creates an object formatted for embed mob/boss use
 *
 * @param {object} msg - message from user
 * @param {number} reward - amount of gold for killing monster
 * @param {number} xp - amount of xp for killing monster
 * @param {number} index - index for the dungeon instance for the user
 */

calculateReward2 = (msg, reward, xp, index) => {
    userID = msg.author.id;
    playerdata[userID].currency += reward;
    u.exportJson(playerdata, 'playerdata');
    m.calculateXp(msg, xp);
    currentMonster = dungeondata.dungeon[index].currentFight.name;
    q.questProgressCheck(msg, currentMonster);
}

/**
 * Creates an object formatted for embed mob/boss use
 *
 * @param {object} channel- channel creation of new dungeon channel
 * @param {object} statsField - special formated object for monster embed
 */

spawnFirstDungeonMonster = (channel, statsFields) => {
    channel.send({
        embed: {
            color: 3021383,
            title: `🅻🆅🅻${statsFields["level"]}  **${statsFields["name"]}** `,
            description: `[${dungeondata.dungeon[dungeondata.dungeon.length - 1].currentMob1["max hp"]}/${dungeondata.dungeon[dungeondata.dungeon.length - 1].currentMob1["max hp"]}]${statsFields["hp"]}`,
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
    }).then((message) => { dungeondata.dungeon[dungeondata.dungeon.length - 1].lastMessageId = message.id; u.exportJson(dungeondata, 'dungeondata'); });
}

/**
 * Creates an object formatted for embed mob/boss use\
 * 
 * @param {string} command - command from user
 * @param {object} msg - message from user
 * 
 */

exports.attack2 = (command, msg) => {
    userID = msg.author.id;
    if (command !== `${prefix}attack` || msg.channel.id !== playerdata[userID].dungeonChannel) { return; }
    const dungeonInstance = dungeondata.dungeon.findIndex(({ dungeonID }) => dungeonID === playerdata[userID].dungeonChannel);

    dungeondata.dungeon[dungeonInstance].currentFight['current hp'] -= playerdata[userID].attack;
    playerdata[userID].currenthp -= dungeondata.dungeon[dungeonInstance].currentFight.attack;
    u.exportJson(playerdata, 'playerdata');
    u.exportJson(dungeondata, 'dungeondata');

    updateBossCurrentHp2(msg, dungeonInstance);
    m.calculateDeath(msg);
}

/**
 * Creates an object formatted for embed mob/boss use
 *
 * @param {object} guild- discord guild
 * @param {object} statsField - special formated object for monster embed
 * @param {number} index - index of the dungeon instance
 * 
 */

updateEmbed2 = (guild, statsFields, index) => {
    guild.channels.get(dungeondata.dungeon[index].dungeonID).send({
        embed: {
            color: 3021383,
            title: `🅻🆅🅻${statsFields["level"]}  **${statsFields["name"]}** `,
            description: `[${dungeondata.dungeon[index].currentFight['current hp']}/${dungeondata.dungeon[index].currentFight["max hp"]}]${statsFields["hp"]}`,
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
            dungeondata.dungeon[index].lastMessageId = message.id;
            u.exportJson(dungeondata, 'dungeondata');
        }
    });
}


/**
* adds dungeon instance data to file
*
* @param {object} channel - channel created for dungeon
* @param {number} dungNumber - number identifier for the dung
*/

addDungeonToData = (channel, dungNumber) => {
    var newDungeonData = {
        "dungeonID": "",
        "dungeonNumber": "",
        "players": "",
        "currentMob1": "",
        "currentMob2": "",
        "currentMob3": "",
        "progress": 1,
        "lastMessageId": "",
        "currentFight": ""
    }
    newDungeonData.dungeonID = channel.id;
    newDungeonData.players = dungeondata.queue;
    newDungeonData.dungeonNumber = dungNumber;
    dungeonMob1 = chooseMob2();
    dungeonMob2 = chooseMob2();
    dungeonBoss = chooseBoss2();
    newDungeonData.currentMob1 = dungeonMob1;
    newDungeonData.currentMob2 = dungeonMob2;
    newDungeonData.currentMob3 = dungeonBoss;
    newDungeonData.currentFight = dungeonMob1;
    dungeondata.dungeon.push(newDungeonData);
    dungeondata.queue = [];
    u.exportJson(dungeondata, 'dungeondata');
}

//chooses a random boss from the boss pool

chooseBoss2 = () => {
    var tiernum = m.getRand(1, 100)
    if (tiernum < 70) { tier = 'tier1' }
    else if (tiernum < 90) { tier = 'tier2' }
    else if (tiernum < 101) { tier = 'tier3' }
    var pick = m.getRand(0, bossdata[tier].length);
    return bossdata[tier][pick];
}

//chooses random mobs from the mob pool

chooseMob2 = () => {
    var tiernum = m.getRand(1, 100)
    if (tiernum < 70) { tier = 'tier1' }
    else if (tiernum < 90) { tier = 'tier2' }
    else if (tiernum < 101) { tier = 'tier3' }
    var pick = m.getRand(0, mobdata[tier].length);
    return mobdata[tier][pick];
}

/**
* leaves the dungeon instance
*
* @param {string} command - command from user
* @param {object} msg - message from user
*/

exports.leaveDungeonInstance = async (command, msg) => {
    userID = msg.author.id;
    if (command !== `${prefix}leave-dungeon` || msg.channel.id !== playerdata[userID].dungeonChannel || typeof (dungeondata.dungeon.findIndex(({ dungeonID }) => dungeonID === playerdata[userID].dungeonChannel)) === "undefined") { return; }
    const dungeonInstance = dungeondata.dungeon.findIndex(({ dungeonID }) => dungeonID === playerdata[userID].dungeonChannel);
    var newPlayers = dungeondata.dungeon[dungeonInstance].players.filter(function (user) { return user.id !== `${msg.author.id}` });
    dungeondata.dungeon[dungeonInstance].players = newPlayers;
    let channel = await msg.client.channels.get(playerdata[userID].dungeonChannel);
    channel.overwritePermissions(userID, { VIEW_CHANNEL: false, SEND_MESSAGES: false });
    u.exportJson(dungeondata, 'dungeondata');

    msg.guild.channels.get(c.BOT_CHANNEL_ID).send({
        embed: {
            color: 3021383,
            title: `${msg.author.username} you have abandoned the dungeon!`
        }
    });
    if (newPlayers.length < 1) {
        let dungChannel = await msg.guild.channels.get(playerdata[userID].dungeonChannel)
        dungChannel.delete();

    }
    playerdata[userID].dungeonChannel = "";
    playerdata[userID].dungeonActive = false;
    u.exportJson(playerdata, 'playerdata');




}

/**
* joins the queue for a dungeon
*
* @param {string} command - command from user
* @param {object} msg - message from user
*/

exports.joinDungeonQueue = (command, msg) => {
    if (command !== `${prefix}join-queue` || msg.channel.id !== c.BOT_CHANNEL_ID) { return; }
    var inQueue = false;
    for (i = 0; i < dungeondata.queue.length; i++) {
        if (dungeondata.queue[i].id === msg.author.id)
            inQueue = true;
    }
    if (playerdata[userID].dungeonActive === false && !inQueue) {
        dungeondata.queue.push({ "id": `${msg.author.id}` });
        u.exportJson(dungeondata, 'dungeondata');
        msg.channel.send({
            embed: {
                color: 3021383,
                title: `${msg.author.username} you are now in the next Dungeon Queue!`
            }
        });
    } else {
        msg.channel.send({
            embed: {
                color: 3021383,
                title: `${msg.author.username} you are already in a queue or in a dungeon!`
            }
        });
    }
}

/**
* leaves the queue for a dungeon
*
* @param {string} command - command from user
* @param {object} msg - message from user
*/

exports.leaveDungeonQueue = (command, msg) => {
    if (command !== `${prefix}leave-queue` || msg.channel.id !== c.BOT_CHANNEL_ID) { return; }
    var inQueue = false;
    for (i = 0; i < dungeondata.queue.length; i++) {
        if (dungeondata.queue[i].id === msg.author.id)
            inQueue = true;
    }
    if (inQueue) {
        var newQueue = dungeondata.queue.filter(function (user) { return user.id !== `${msg.author.id}` });
        dungeondata.queue = newQueue;
        u.exportJson(dungeondata, 'dungeondata');
        msg.channel.send({
            embed: {
                color: 3021383,
                title: `${msg.author.username} you left the queue!`
            }
        });
    }
    else {
        msg.channel.send({
            embed: {
                color: 3021383,
                title: `${msg.author.username} you are not in a queue.`
            }
        });
    }
}

/**
* displays everyone inside the dungeon queue
*
* @param {string} command - command from user
* @param {object} msg - message from user
* @param {object} bot - the client
*/

exports.displayDungeonQueue = async (command, msg, bot) => {
    if (command !== `${prefix}queue` || msg.channel.id !== c.BOT_CHANNEL_ID) { return; }
    var embed = new Discord.RichEmbed()
        .setColor(3021383)
        .setTitle(`--------------------------------**Dungeon Queue**--------------------------------`)

    for (i = 0; i < dungeondata.queue.length; i++) {
        let user = await bot.fetchUser(dungeondata.queue[i].id);
        embed.addField(`${user.username}`, `\u200B`, true);

    }
    msg.guild.channels.get(c.BOT_CHANNEL_ID).send(embed);
}