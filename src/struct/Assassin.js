const { constructEmbed } = require('../util/utilities.js');
const { ARENA_CHANNEL_ID, BOT_CHANNEL_ID } = require('../util/constants');

module.exports = class Assassin {
    constructor(data) {
        Object.keys(data).forEach(key => this[key] = data[key]);
    }
    ability1(message) {
        if(message.channel.id === BOT_CHANNEL_ID) return message.reply('You can only use this ability in combat.');
        if(this.cooldown > 0) return message.reply(`Ability is on cooldown for ${this.cooldown} more turns.`);
        this.cooldown = this.activeAbility1.cooldown;
        const userID = message.member.id;
        const players = message.client.players;
        const instance = message.client.dungeon.instance;
        const location = (message.channel.id === ARENA_CHANNEL_ID) ? message.client.monster : instance[players[userID].dungeonChannel].currentFight;
        if (location.dead()) return message.channel.send(constructEmbed('There is nothing to attack!', '', null, null));
        location.dealDamage(message, Math.floor((players[userID].attack + players[userID].baseattack) * this.activeAbility1.amount));
    }
};