const { RichEmbed } = require('discord.js');
const { LEVEL_EMOJI } = require('../util/constants.js');
const { generateHeartsBar } = require('../util/utilities.js');
module.exports = class Monster {
    constructor(data) {
        Object.keys(data).forEach(key => this[key] = data[key]);
    }
    dealDamage(message, damage) {
        this.currentHp -= damage;
        this.message.edit(this.embed());
        if(this.dead()) {
            this.spawned = false;
            message.client.players[message.member.id].recieve(message, this.lvl, this.reward);
            message.client.players[message.member.id].questUpdate(message, this.name);

        }
    }
    dead() {
        return (this.currentHp > 0) ? false : true;
    }
    async spawn(client, channel) {
        this.currentHp = this.maxHp;
        await client.channels.get(channel).send(this.embed()).then((msg => this.message = msg));
        this.spawned = true;
    }
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
};