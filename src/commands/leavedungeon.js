/* eslint-disable require-atomic-updates */
const dungeondata = require('../data/dungeondata');
const playerdata = require('../data/playerdata');
const { exportJson, constructEmbed } = require('../util/utilities.js');
const { BOT_CHANNEL_ID } = require('../util/constants.js');

module.exports = {
    name: 'exit',
    description: 'Starts the dungeon with everyone in the queue.',
    usage: 'dungeon',
    args: true,
    cooldown: 5,
    async execute(message) {
        message.delete();
        const userID = message.member.id;
        const dungeonInstance = dungeondata.dungeon.findIndex(({ dungeonID }) => dungeonID === playerdata[userID].dungeonChannel);
        const newPlayers = dungeondata.dungeon[dungeonInstance].players.filter(function(user) { return user.id !== `${message.member.id}`;});
        dungeondata.dungeon[dungeonInstance].players = newPlayers;
        const channel = await message.client.channels.get(playerdata[userID].dungeonChannel);
        channel.overwritePermissions(userID, { VIEW_CHANNEL: false, SEND_MESSAGES: false });
        exportJson(dungeondata, 'dungeondata');
        message.guild.channels.get(BOT_CHANNEL_ID).send(constructEmbed(`${message.member.displayName}, you have abandoned the dungeon!`, '', null, null));
        if (newPlayers.length < 1) {
            const dungChannel = await message.guild.channels.get(playerdata[userID].dungeonChannel);
            dungChannel.delete();
        }
        playerdata[userID].dungeonChannel = '';
        playerdata[userID].dungeonActive = false;
        exportJson(playerdata, 'playerdata');
    },
};
