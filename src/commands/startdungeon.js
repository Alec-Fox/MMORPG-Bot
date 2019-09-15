const { constructEmbed, getRand, chooseMonster } = require('../util/utilities.js');
const { GUILD_ID, BOT_CATEGORY_ID, DUNGEON_DATA, DIRTY_BATHROOM_IMAGE } = require('../util/constants.js');
const Monster = require('../struct/Monster.js');

module.exports = {
    name: 'start',
    description: 'Starts the dungeon with everyone in the queue.',
    usage: 'dungeon',
    args: true,
    cooldown: 5,
    execute(message) {
        message.delete();
        const userID = message.member.id;
        let inQueue = false;
        for (let i = 0; i < message.client.dungeon.queue.length; i++) if (message.client.dungeon.queue[i].id === userID) inQueue = true;
        if (inQueue && !message.client.players[userID].dungeonActive) {
            const overwrites = [{
                id: GUILD_ID,
                denied: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
            }];
            const dungNumber = getRand(1, 999);
            message.guild.createChannel(`Dungeon ${dungNumber}`, { type: 'text', parent: message.guild.channels.get(BOT_CATEGORY_ID), permissionOverwrites: overwrites })
                .then((channel) => {
                    addDungeonToData(channel, dungNumber);
                    for (let i = 0; i < message.client.dungeon.instance[channel.id].players.length; i++) {
                        const playerId = message.client.dungeon.instance[channel.id].players[i].id;
                        channel.overwritePermissions(playerId, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
                        message.client.players[playerId].dungeonActive = true;
                        message.client.players[playerId].dungeonChannel = channel.id;
                    }
                    channel.send(constructEmbed('Let the Fight Begin!', '', null, null));
                    message.channel.send(constructEmbed(`Enter Dungeon ${dungNumber} with your party ${message.member.displayName}!`, '', DIRTY_BATHROOM_IMAGE, null));
                    channel.send(message.client.dungeon.instance[channel.id].currentFight.embed()).then(
                        (msg) => { message.client.dungeon.instance[channel.id].currentFight.message = msg;});
                    return;
                });
                return;
        }
        message.channel.send(constructEmbed(`${message.member.displayName} you are not in a queue or already in a dungeon! join a queue to start a dungeon!`, '', null, null));

    },
};

const addDungeonToData = (channel, dungNumber) => {
    const channelID = channel.id;
    const newDungeonData = { [channelID]: {} };
    newDungeonData[channelID] = DUNGEON_DATA;
    newDungeonData[channelID].progress = 1;
    newDungeonData[channelID].players = channel.client.dungeon.queue;
    newDungeonData[channelID].dungeonNumber = dungNumber;
    const mob1 = new Monster (chooseMonster('mobdata'));
    const mob2 = new Monster (chooseMonster('mobdata'));
    const mob3 = new Monster (chooseMonster('bossdata'));
    newDungeonData[channelID].currentMob1 = mob1;
    newDungeonData[channelID].currentMob2 = mob2;
    newDungeonData[channelID].currentMob3 = mob3;
    newDungeonData[channelID].currentFight = newDungeonData[channelID].currentMob1;
    const totalGold = newDungeonData[channelID].currentMob1.reward + newDungeonData[channelID].currentMob2.reward + newDungeonData[channelID].currentMob3.reward;
    const totalXp = newDungeonData[channelID].currentMob1.lvl + newDungeonData[channelID].currentMob2.lvl + newDungeonData[channelID].currentMob3.lvl;
    newDungeonData[channelID].total_xp = totalXp;
    newDungeonData[channelID].total_reward = totalGold;
    channel.client.dungeon.instance = Object.assign(channel.client.dungeon.instance, newDungeonData);
    channel.client.dungeon.queue = [];
};