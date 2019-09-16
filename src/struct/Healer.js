module.exports = class Healer {
    constructor(data) {
        Object.keys(data).forEach(key => this[key] = data[key]);
    }
    ability1(message) {
        if(this.cooldown > 0) return message.reply(`Ability is on cooldown for ${this.cooldown} more turns.`);
        this.cooldown = this.activeAbility1.cooldown;
        const specifiedMember = message.mentions.members.first();
        specifiedMember ? message.client.players[specifiedMember.id].heal(message, this.activeAbility1.amount) : message.client.players[message.member.id].heal(message, this.activeAbility1.amount);
    }
};