const { RichEmbed } = require('discord.js');
const { LEVEL_EMOJI, BOT_CHANNEL_ID, ARENA_CHANNEL_ID, CLEAN_BATHROOM_IMAGE } = require('../util/constants.js');
const { generateHeartsBar, constructEmbed } = require('../util/utilities.js');
module.exports = class Monster {
    constructor(data) {
        Object.keys(data).forEach(key => this[key] = data[key]);
    }
    /**
     * Deals damage to the monster.
     *
     * @param {object} message - Discord message.
     * @param {number} damage - Amount of damage to deal the player.
     */
    dealDamage(message, damage) {
        this.currentHp -= damage;
        this.message.edit(this.embed()).catch(error => { console.log(error); });
        if (this.dead()) {
            this.spawned = false;
            message.client.players[message.member.id].recieve(message, this.lvl, this.reward);
            message.client.players[message.member.id].questUpdate(message, this.name);
        }
        const userID = message.member.id;
        const instance = message.client.dungeon.instance;
        const players = message.client.players;
        const location = (message.channel.id === ARENA_CHANNEL_ID) ? message.client.monster : instance[players[userID].dungeonChannel].currentFight;
        if (location !== message.client.monster && instance[players[userID].dungeonChannel].currentFight.dead()) this.maybeContinueDung(message);
    }
    /**
     * Returns true if the monster's current hp < 0.
     */
    dead() {
        return (this.currentHp > 0) ? false : true;
    }
    /**
     * Spawns a monster in the given channel.
     *
     * @param {object} client - Discord Client.
     * @param {object} channel - Discord Channel.
     */
    async spawn(client, channel) {
        this.currentHp = this.maxHp;
        await client.channels.get(channel).send(this.embed()).then((msg => this.message = msg)).catch(error => { console.log(error); });
        this.spawned = true;
    }
    /**
     * Returns an embed with the monster's stats.
     */
    embed() {
        const hpBar = generateHeartsBar(this.currentHp);
        const monsterImage = (this.currentHp > 0) ? this.img : this.deathimage;
        const embed = new RichEmbed()
            .setColor(3021383)
            .setTitle(`🅻🆅🅻${LEVEL_EMOJI[this.lvl]} **${this.name}**`)
            .setDescription(`[${this.currentHp}/${this.maxHp}] ${hpBar}`)
            .setFooter(`REWARD: ${this.reward}💰`)
            .setImage(monsterImage)
            .addField(`⚔ **${this.attack}**`, '\u200B', true)
            .addField(`🛡 **${this.defense}**`, '\u200B', true);
        return embed;
    }
    /**
     * Continues the dungeon progress
     *
     * @param {object} message - Discord message.
     */
    async maybeContinueDung(message) {
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
    }
};