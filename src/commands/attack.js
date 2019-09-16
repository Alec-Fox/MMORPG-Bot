/* eslint-disable require-atomic-updates */
const { constructEmbed } = require('../util/utilities.js');
const { ARENA_CHANNEL_ID, BOT_CHANNEL_ID, CLEAN_BATHROOM_IMAGE } = require('../util/constants');
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
        players[userID].dealDamage(message, location.attack);
        location.dealDamage(message, (players[userID].attack + players[userID].baseattack));
        if (location !== message.client.monster && instance[players[userID].dungeonChannel].currentFight.dead()) maybeContinueDung(message);
    },
};

/**
 * Continues the dungeon progress
 *
 * @param {object} message - Discord message.
 */
const maybeContinueDung = async (message) => {
    const userID = message.member.id;
    const instance = message.client.dungeon.instance;
    const players = message.client.players;
    if (instance[players[userID].dungeonChannel].progress < 3) {
        instance[players[userID].dungeonChannel].progress++;
        instance[players[userID].dungeonChannel].currentFight = instance[players[userID].dungeonChannel][`currentMob${instance[players[userID].dungeonChannel].progress}`];
        message.channel.send(constructEmbed('**Another monster approaches!**', '', null, null));
        message.channel.send(instance[players[userID].dungeonChannel].currentFight.embed()).then(
            (msg) => { instance[players[userID].dungeonChannel].currentFight.message = msg; }).catch(error => { console.log(error); });
        return;
    }
    const embed = constructEmbed('**-----------------------Victorious!-------------------------**', '**These brave heroers have scrubbed the dungeon clean!**', CLEAN_BATHROOM_IMAGE, null);
    for (let i = 0; i < instance[players[userID].dungeonChannel].players.length; i++) {
        players[instance[players[userID].dungeonChannel].players[i].id].dungeonActive = false;
        players[instance[players[userID].dungeonChannel].players[i].id].lasthpbar = '';
        const user = await message.client.fetchUser(instance[players[userID].dungeonChannel].players[i].id);
        embed.addField(`${user.username}`, '\u200B', true);
    }
    message.client.channels.get(BOT_CHANNEL_ID).send(embed);
    try {
        message.client.channels.get(players[userID].dungeonChannel).delete();
    }
    catch (error) {
        console.log(error);
    }

};