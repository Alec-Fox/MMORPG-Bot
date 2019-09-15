const { LEVEL_EMOJI, XP_ICON_BLACK, XP_ICON_WHITE, DEATH_IMAGE, LEVEL_XP_TOTALS, ACHIEVEMENTS, LEVEL_UP_IMAGE } = require('../util/constants.js');
const { generateHeartsBar, constructEmbed, chooseMonster, getRand, exportJson } = require('../util/utilities.js');
module.exports = class Player {
    constructor(data) {
        Object.keys(data).forEach(key => this[key] = data[key]);
    }
    dealDamage(message, damage) {
        this.currenthp -= damage;
        if(this.lasthpbar === null) this.lasthpbar = '';
        if (this.lasthpbar !== '') this.lasthpbar.delete().catch(error => {console.log(error);});
        message.channel.send(constructEmbed(`${this.name}: [${this.currenthp}/${(this.maxhp + this.basehp)}] ${this.hpBar()}`, '', null, null)).then((msg => this.lasthpbar = msg)).catch(error => {console.log(error);});
        if (this.currenthp <= 0) this.respawn(message);
        exportJson(message.client.players, 'playerdata');
    }
    dead() {
        return (this.currenthp > 0) ? false : true;
    }
    stats(message) {
        const fields = [
            { name: `⚔${this.attack + this.baseattack}`, value: `**${this.weapon}**`, inline: true },
            { name: `🛡${this.defense}`, value: `**${this.armor}**`, inline: true },
            { name: `💰${this.currency}`, value: '\u200B', inline: true },
            { name: '```🅸🅽🆅🅴🅽🆃🅾🆁🆈: \nHEALTH-POTIONS: ```' + `${this.inventory['health-potions']}`, value: `**XP:[${this.currentxp}/${this.maxxp}]**\n${this.xpBar()}`, inline: true },
        ];
        const embed = constructEmbed(`🅻🆅🅻 ${LEVEL_EMOJI[`${this.level}`]}  ${this.name}'s Stats`, `**HP:[${this.currenthp}/${this.maxhp + this.basehp}]**${this.hpBar()}`, null, fields);
        return message.channel.send(embed);
    }
    xpBar() {
        let xpBar = '';
        for (let i = 0; i < this.currentxp; i++) xpBar += XP_ICON_WHITE;
        for (let i = 0; i < (this.maxxp - this.currentxp); i++) xpBar += XP_ICON_BLACK;
        return xpBar;
    }
    heal(message, amount) {
        this.currenthp += amount;
        if(this.lasthpbar === null) this.lasthpbar = '';
        if (this.lasthpbar !== '') this.lasthpbar.delete().catch(error => {console.log(error);});
        if(this.currenthp > this.maxhp + this.basehp) this.currenthp = this.maxhp + this.basehp;
        message.channel.send(constructEmbed(`${this.name} you have been healed by ${amount}❤️!`, `[${this.currenthp}/${(this.maxhp + this.basehp)}] ${this.hpBar()}`, null, null)).then((msg => this.lasthpbar = msg)).catch(error => {console.log(error);});
        exportJson(message.client.players, 'playerdata');
    }
    respawn(message) {
        this.currenthp = Math.floor((this.maxhp + this.basehp) / 3);
        this.currentxp = Math.floor(this.currentxp / 2);
        const embed = constructEmbed(`☠️☠️**${this.name} You DIED. The monster fleed.** ☠️☠️`, '', DEATH_IMAGE, null);
        message.client.monster.spawned = false;
        message.client.monster.currentHp = 0;
        this.currency -= message.client.monster.reward;
        this.currentxp -= message.client.monster.lvl;
        message.channel.send(embed);
        exportJson(message.client.players, 'playerdata');
    }
    recieve(message, xp, gold) {
        this.currentxp += xp;
        this.currency += gold;
        if (this.currentxp >= this.maxxp) this.levelUp(message);
        exportJson(message.client.players, 'playerdata');
    }
    levelUp(message) {
        this.level++;
        this.attack++;
        this.currentxp = this.currentxp - this.maxxp;
        this.maxxp = LEVEL_XP_TOTALS[this.level];
        this.maxhp++;
        this.currenthp = this.maxhp + this.basehp;
        const embed = constructEmbed(`${this.name} **YOU ARE NOW ** 🅻🆅🅻 ${LEVEL_EMOJI[this.level]}!`, '', LEVEL_UP_IMAGE, null);
        message.channel.send(embed);
        exportJson(message.client.players, 'playerdata');
    }
    canAfford(cost, qty) {
        return (this.currency < cost * qty) ? false : true;
    }
    equip(message, item, qty) {
        this.currency -= parseInt(item.cost * qty);
        switch (item.type) {
            case 'armor':
                this.defense = 0 + item.armor;
                this.armor = item.name;
                this.basehp = 15 + item.armor;
                break;
            case 'weapon':
                this.attack = 1 + item.attack;
                this.weapon = item.name;
                break;
            case 'consumable':
                this.inventory['health-potions'] += qty;
        }
        exportJson(message.client.players, 'playerdata');
    }
    flee(message) {
        const embed = constructEmbed(`🏃 ${this.name}, you run away from the monster!`, '', null, null);
        return message.channel.send(embed);
    }
    medals(message) {
        const achievements = this.achievements.split('').sort();
        let achievementIcons = '';
        for (let i = 0; i < achievements.length; i++) achievementIcons += ACHIEVEMENTS[achievements[i]];
        const embed = constructEmbed(`${this.name}'s Achievements`, `${achievementIcons}`, null, null);
        return message.channel.send(embed);
    }
    questUpdate(message, currentMonster) {
        if (this.quest.type === currentMonster) {
            this.quest.progress++;
            exportJson(message.client.players, 'playerdata');
            if (this.quest.progress >= this.quest.total) {
                this.currency += this.quest.reward;
                message.channel.send(constructEmbed(`${this.name}, you completed your quest and received: 💰${this.quest.reward}`, '', null, null));
                this.quest = { 'active': false, 'type': '', 'total': null, 'progress': null };
            }
        }
    }
    getQuest(message) {
        if (!this.quest.active) {
            const questData = chooseMonster('mobdata');
            const totalQuest = getRand(2, 15);
            this.quest = { 'active': true, 'type': `${questData.name}`, 'total': totalQuest, 'progress': 0, 'reward': Math.floor((totalQuest / 2) + 1), 'img': questData.image };
        }
        const embed = constructEmbed(`-------------------**${this.name}'s Active Quest**-------------------`, '', null, null);
        embed.addField(`Bounty: ${this.quest.type}`, `Progress: [${this.quest.progress}/ ${this.quest.total}]`);
        embed.addField(`Reward: 💰${this.quest.reward}`, '\u200B');
        return message.channel.send(embed);
    }
    hpBar() {
        return generateHeartsBar(this.currenthp);
    }
};