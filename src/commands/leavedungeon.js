/* eslint-disable require-atomic-updates */

const { constructEmbed } = require('../util/utilities.js');
const { BOT_CHANNEL_ID } = require('../util/constants.js');

module.exports = {
    name: 'exit',
    description: 'Leaves the dungeon.',
    usage: 'dungeon',
    args: true,
    cooldown: 5,
    async execute(message) {
        message.delete();
        const userID = message.member.id;
        if(message.client.players[userID].dungeonActive === false) return message.reply('You are not in a dungeon.');
        const dungeonInstance = message.client.players[userID].dungeonChannel;
        const newPlayers = message.client.dungeon.instance[dungeonInstance].players.filter(function(user) { return user.id !== `${message.member.id}`;});
        message.client.dungeon.instance[dungeonInstance].players = newPlayers;
        const channel = await message.client.channels.get(message.client.players[userID].dungeonChannel);
        channel.overwritePermissions(userID, { VIEW_CHANNEL: false, SEND_MESSAGES: false });
        message.guild.channels.get(BOT_CHANNEL_ID).send(constructEmbed(`${message.member.displayName}, you have abandoned the dungeon!`, '', null, null));
        if (newPlayers.length < 1) {
            const dungChannel = await message.guild.channels.get(message.client.players[userID].dungeonChannel);
            dungChannel.delete();
        }
        message.client.players[userID].dungeonChannel = '';
        message.client.players[userID].dungeonActive = false;
    },
};
