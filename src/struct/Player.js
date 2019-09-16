const { LEVEL_EMOJI, XP_ICON_BLACK, XP_ICON_WHITE, DEATH_IMAGE, LEVEL_XP_TOTALS, ACHIEVEMENTS, LEVEL_UP_IMAGE } = require('../util/constants.js');
const { generateHeartsBar, constructEmbed, chooseMonster, getRand, exportJson } = require('../util/utilities.js');
module.exports = class Player {
    constructor(data) {
        Object.keys(data).forEach(key => this[key] = data[key]);
    }

    /**
     * Deals damage to the player
     *
     * @param {object} message - Discord message.
     * @param {number} damage - Amount of damage to deal the player.
     */
    dealDamage(message, damage) {
        this.class.cooldown -= 1;
        this.currenthp -= damage;
        if (this.lasthpbar === null) this.lasthpbar = '';
        if (this.lasthpbar !== '') {
                try {
                    this.lasthpbar.delete();
                }
                catch (error) {
                    console.log(error);
                }
        }
        message.channel.send(constructEmbed(`${this.name}: [${this.currenthp}/${(this.maxhp + this.basehp)}] ${this.hpBar()}`, '', null, null)).then((msg => this.lasthpbar = msg)).catch(error => { console.log(error); });
        if (this.currenthp <= 0) this.respawn(message);
        exportJson(message.client.players, 'playerdata');
    }
    /**
     * Returns true if the player's hp is < 0.
     */
    dead() {
        return (this.currenthp > 0) ? false : true;
    }
    /**
     * Deals this player's total attack.
     */
    attack() {
        return (this.attack + this.baseattack);
    }
    /**
     * Sends Player's stats.
     *
     * @param {object} message - Discord message.
     */
    stats(message) {
        const fields = [
            { name: `⚔${this.attack + this.baseattack}`, value: `**${this.weapon}**`, inline: true },
            { name: `🛡${this.defense}`, value: `**${this.armor}**`, inline: true },
            { name: `💰${this.currency}`, value: '\u200B', inline: true },
            { name: '```🅸🅽🆅🅴🅽🆃🅾🆁🆈: \nHEALTH-POTIONS: ```' + `${this.inventory['health-potions']}`, value: `**XP:[${this.currentxp}/${this.maxxp}]**\n${this.xpBar()}`, inline: true },
        ];
        const embed = constructEmbed(`🅻🆅🅻 ${LEVEL_EMOJI[`${this.level}`]}  ${this.name}'s Stats`, `**HP:[${this.currenthp}/${this.maxhp + this.basehp}]**${this.hpBar()}`, this.class.img, fields);
        return message.channel.send(embed);
    }
    /**
     * Generates an "xp bar" of icons based on the player's current and max xp.
     */
    xpBar() {
        let xpBar = '';
        for (let i = 0; i < this.currentxp; i++) xpBar += XP_ICON_WHITE;
        for (let i = 0; i < (this.maxxp - this.currentxp); i++) xpBar += XP_ICON_BLACK;
        return xpBar;
    }
    /**
 * Heals the player.
 *
 * @param {object} message - Discord message.
 * @param {number} amount - Amount to heal the player by.
 */
    heal(message, amount) {
        this.currenthp += amount;
        if (this.lasthpbar === null) this.lasthpbar = '';
        if (this.lasthpbar !== '') {
            try {
                this.lasthpbar.delete();
            }
            catch (error) {
                console.log(error);
            }
        }
        if (this.currenthp > this.maxhp + this.basehp) this.currenthp = this.maxhp + this.basehp;
        message.channel.send(constructEmbed(`${this.name} you have been healed by ${amount}❤️!`, `[${this.currenthp}/${(this.maxhp + this.basehp)}] ${this.hpBar()}`, null, null)).then((msg => this.lasthpbar = msg)).catch(error => { console.log(error); });
        exportJson(message.client.players, 'playerdata');
    }
    /**
     * Respawns the player with 50% xp and 33% hp
     *
     * @param {object} message - Discord message.
     */
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
    /**
     * Adds xp and gold to the player.
     *
     * @param {object} message - Discord message.
     * @param {number} xp - Amount of xp to give the player.
     * @param {number} gold - Amount of gold to give the player.
     */
    recieve(message, xp, gold) {
        if(this.level > 4) xp = Math.ceil(xp / 2);
        this.currentxp += xp;
        this.currency += gold;
        if (this.currentxp >= this.maxxp) this.levelUp(message);
        exportJson(message.client.players, 'playerdata');
    }
    /**
     * Inreases the players level
     *
     * @param {object} message - Discord message.
     */
    levelUp(message) {
        if (this.level === 10) return;
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
    /**
     * returns true if the player has enough currency.
     *
     * @param {number} cost - The cost of the item(s).
     * @param {number} qty - The quantity of the item(s).
     */
    canAfford(cost, qty) {
        return (this.currency < cost * qty) ? false : true;
    }
    /**
     * Equips items to the player.
     *
     * @param {object} message - Discord message.
     * @param {object} item - The item to equip.
     * @param {number} qty - Amount of items to equip.
     */
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
    /**
     * Runs away from the monster
     *
     * @param {object} message - Discord message.
     */
    flee(message) {
        const embed = constructEmbed(`🏃 ${this.name}, you run away from the monster!`, '', null, null);
        return message.channel.send(embed);
    }
    /**
     * Display an ordered list of medals the player has.
     *
     * @param {object} message - Discord message.
     */
    medals(message) {
        const achievements = this.achievements.split('').sort();
        let achievementIcons = '';
        for (let i = 0; i < achievements.length; i++) achievementIcons += ACHIEVEMENTS[achievements[i]];
        const embed = constructEmbed(`${this.name}'s Achievements`, `${achievementIcons}`, null, null);
        return message.channel.send(embed);
    }
    /**
     * Updates the player's quest progress.
     *
     * @param {object} message - Discord message.
     * @param {string} currentMonster - Monster the player has killed.
     */
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
    /**
     * Generates or displays a quest for the player.
     *
     * @param {object} message - Discord message.
     */
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
    /**
     * Returns an hp bar.
     */
    hpBar() {
        return generateHeartsBar(this.currenthp);
    }
};