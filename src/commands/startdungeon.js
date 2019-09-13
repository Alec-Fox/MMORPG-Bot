const dungeondata = require('../data/dungeondata');
const playerdata = require('../data/playerdata');
const { exportJson, constructEmbed, getRand, chooseMonster, monsterEmbed } = require('../util/utilities.js');
const { GUILD_ID, BOT_CATEGORY_ID, DUNGEON_DATA } = require('../util/constants.js');

module.exports = {
    name: 'start',
    description: 'Starts the dungeon with everyone in the queue.',
    usage: 'dungeon',
    args: true,
    cooldown: 5,
    async execute(message) {
        message.delete();
        const userID = message.member.id;
        let inQueue = false;
        console.log(dungeondata.queue);
        for(let i = 0; i < dungeondata.queue.length; i++) if(dungeondata.queue[i].id === userID) inQueue = true;
        if(inQueue && !playerdata[userID].dungeonActive) {
            const overwrites = [{
                id: GUILD_ID,
                denied: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
            }];
            const dungNumber = getRand(1, 999);
            message.guild.createChannel(`Dungeon ${dungNumber}`, { type: 'text', parent: message.guild.channels.get(BOT_CATEGORY_ID), permissionOverwrites: overwrites })
            .then((channel) => {
                addDungeonToData(channel, dungNumber);
                for (let i = 0; i < dungeondata.dungeon[dungeondata.dungeon.length - 1].players.length; i++) {
                    const playerId = dungeondata.dungeon[dungeondata.dungeon.length - 1].players[i].id;
                    channel.overwritePermissions(playerId, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
                    playerdata[playerId].dungeonActive = true;
                    playerdata[playerId].dungeonChannel = channel.id;
                    exportJson(playerdata, 'playerdata');
                }
                channel.send(constructEmbed('Let the Fight Begin!', '', null, null));
                message.channel.send(constructEmbed(`Enter Dungeon ${dungNumber} with your party ${message.member.displayName}!`, '', null, null));
                channel.send(monsterEmbed(dungeondata.dungeon[dungeondata.dungeon.length - 1].currentFight)).then(
                    (msg) => { dungeondata.dungeon[dungeondata.dungeon.length - 1].lastMessageId = msg.id; exportJson(dungeondata, 'dungeondata'); });
                exportJson(dungeondata, 'dungeondata');
                // spawnFirstDungeonMonster(channel, buildStatFields2(dungeondata.dungeon[dungeondata.dungeon.length - 1].currentMob1, 'max hp'));
            });
        }
        else {
            message.channel.send(constructEmbed(`${message.member.displayName} you are not in a queue or already in a dungeon! join a queue to start a dungeon!`, '', null, null));
        }
    },
};

const addDungeonToData = (channel, dungNumber) => {
    const newDungeonData = DUNGEON_DATA;
    newDungeonData.dungeonID = channel.id;
    newDungeonData.players = dungeondata.queue;
    newDungeonData.dungeonNumber = dungNumber;
    newDungeonData.currentMob1 = chooseMonster('mobdata');
    newDungeonData.currentMob2 = chooseMonster('mobdata');
    newDungeonData.currentMob3 = chooseMonster('bossdata');
    newDungeonData.currentFight = newDungeonData.currentMob1;
    const totalGold = newDungeonData.currentMob1.reward + newDungeonData.currentMob2.reward + newDungeonData.currentMob3.reward;
    const totalXp = newDungeonData.currentMob1.level + newDungeonData.currentMob2.level + newDungeonData.currentMob3.level;
    newDungeonData.total_xp = totalXp;
    newDungeonData.total_reward = totalGold;
    dungeondata.dungeon.push(newDungeonData);
    dungeondata.queue = [];
    exportJson(dungeondata, 'dungeondata');
};