/* eslint-disable require-atomic-updates */
const { constructEmbed } = require('../util/utilities.js');
const { ARENA_CHANNEL_ID } = require('../util/constants');
module.exports = {
    name: 'attack',
    description: 'Attack the monster.',
    usage: '',
    cooldown: 1 / 2,
    async execute(message) {
        message.delete().catch(error => { console.log(error); });
        const instance = message.client.dungeon.instance;
        const players = message.client.players;
        const userID = message.member.id;
        const location = (message.channel.id === ARENA_CHANNEL_ID) ? message.client.monster : instance[players[userID].dungeonChannel].currentFight;
        if (location.dead()) return message.channel.send(constructEmbed('There is nothing to attack!', '', null, null));
        location.dealDamage(message, (players[userID].attack + players[userID].baseattack));
        players[userID].dealDamage(message, location.attack);
    },
};