const fs = require('fs');
const { RichEmbed, Collection } = require('discord.js');
const { NEW_PLAYER_DATA, DEATH_IMAGE, LEVEL_XP_TOTALS, LEVEL_EMOJI, LEVEL_UP_IMAGE, ARENA_CHANNEL_ID, BOT_CHANNEL_ID } = require('./constants.js');
const currentfight = require('../data/currentfight');
const playerdata = require('../data/playerdata.json');

module.exports.constructEmbed = (title, description, image, fields) => {
    const embed = new RichEmbed()
        .setColor(3021383)
        .setTitle(title)
        .setDescription(description)
        .setImage(image);

    if (fields) {
        for (let i = 0; i < fields.length; i++) {
            embed.addField(fields[i].name, fields[i].value, fields[i].inline);
        }
    } return embed;

};

exports.getRand = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * max);
};

exports.exportJson = (content, fileName) => {
    fs.writeFileSync(`./src/Data/${fileName}.json`, JSON.stringify(content));
};

exports.resetDungeon = () => {
    const newDungeonData = new Collection;
    newDungeonData.set('queue', []);
    newDungeonData.set('dungeon', []);
    this.exportJson(strMaptoObj(newDungeonData), 'dungeondata');
    const keys = Object.keys(playerdata);
    for (let i = 0; i < keys.length; i++) playerdata[keys[i]].dungeonActive = false;
    this.exportJson(playerdata, 'playerdata');

};

exports.maybeCreatePlayerData = (userID) => {
    if (playerdata[userID]) return;
    playerdata[userID] = Object.assign({}, NEW_PLAYER_DATA);
    this.exportJson(playerdata, 'playerdata');
};

exports.calculateDeath = (message) => {
    const userID = message.member.id;
    if (playerdata[userID].currenthp <= 0) {
        const title = `☠️☠️${message.member.displayName} **DIED. The monster fleed.** ☠️☠️`;
        const embed = this.constructEmbed(title, '', DEATH_IMAGE, null);
        message.channel.send(embed);
        playerdata[userID].currentxp = Math.floor(playerdata[userID].currentxp / 2);
        playerdata[userID].currenthp = Math.floor((playerdata[userID].maxhp + playerdata[userID].basehp) / 3);
        this.resetFight();
        this.exportJson(playerdata, 'playerdata');
        return true;
    }
    return false;
};

exports.calculateXp = (message, xp, player) => {
    playerdata[player].currentxp += xp;
    this.exportJson(playerdata, 'playerdata');
    calculateLvlUp(message, player);
};

exports.resetFight = () => {
    currentfight.currentChannel = null;
    currentfight.mobSpawned = false;
    currentfight.currentBoss = null;
    currentfight.currentBossEmbed = null;
    this.exportJson(currentfight, 'currentfight');
};

exports.generateHeartsBar = health => {
    let hp = '';
    for (let i = 0; i < health; i++) {
        hp += '❤️';
    } return hp;
};

exports.generateXpBar = (xpMin, xpMax) => {
    let xpBar = '';
    const xpIconWhite = '⬜';
    const xpIconBlack = '⬛';

    for (let i = 0; i < xpMin; i++) {
        xpBar += xpIconWhite;
    }
    const remainingXp = xpMax - xpMin;
    for (let i = 0; i < remainingXp; i++) {
        xpBar += xpIconBlack;
    } return xpBar;
};

exports.decideUser = (message, specifiedMember) => {
    const decidedUser = { userID: '', userName: '' };

    decidedUser.userID = (specifiedMember) ? specifiedMember.id : message.author.id;
    decidedUser.userName = (specifiedMember) ? specifiedMember.displayName : message.member.displayName;

    return decidedUser;
};

exports.chooseMonster = filePath => {
    const { mob } = require(`../data/${filePath}`);
    const keys = Object.keys(mob);
    const chosenMob = this.getRand(0, keys.length);
    return mob[chosenMob];


};

exports.updateQuestProgress = (message, currentMonster) => {
    const userID = message.author.id;
    if (playerdata[userID].quest.type === currentMonster) {
        playerdata[userID].quest.progress++;
        this.exportJson(playerdata, 'playerdata');

        if (playerdata[userID].quest.progress >= playerdata[userID].quest.total) {
            const reward = playerdata[userID].quest.reward;
            playerdata[userID].currency += reward;
            this.exportJson(playerdata, 'playerdata');
            message.channel.send(this.constructEmbed(`${message.author.username}, you completed your quest and received: 💰${reward}`, '', null, null));
            playerdata[userID].quest = { 'active': false, 'type': '', 'total': null, 'progress': null };
            this.exportJson(playerdata, 'playerdata');
        }
    }
};

exports.maybeSpawnMob = client => {
    if (currentfight.mobSpawned === true) return;
    const num = this.getRand(1, 15);
    if (num > 0) this.spawnMonster(client, ARENA_CHANNEL_ID, 'mobdata', true);
};

exports.spawnMonster = async (client, channelId, filePath, spawnArena) => {
    const monster = await this.chooseMonster(filePath);
    monster['current hp'] = monster['max hp'];
    const embedID = await client.channels.get(channelId).send(this.monsterEmbed(monster));
    try {
        if (spawnArena) {
            currentfight.currentBossEmbed = embedID.id;
            currentfight.currentChannel = ARENA_CHANNEL_ID;
            currentfight.mobSpawned = true;
            currentfight.currentBoss = monster;
            this.exportJson(currentfight, 'currentfight');
        }
    }
    catch (err) { console.log(err); }
};

exports.monsterEmbed = (monster) => {
    const hpBar = this.generateHeartsBar(monster['current hp']);
    const monsterImage = (monster['current hp'] >= 0) ? monster.image : monster.deathimage;
    const embed = new RichEmbed()
        .setColor(3021383)
        .setTitle(`🅻🆅🅻${LEVEL_EMOJI[monster.level]} **${monster.name}**`)
        .setDescription(`[${monster['current hp']}/${monster['max hp']}] ${hpBar}`)
        .setFooter(`REWARD: ${monster.reward}💰`)
        .setImage(monsterImage)
        .addField(`⚔ **${monster.attack}**`, '\u200B', true)
        .addField(`🛡 **${monster.defense}**`, '\u200B', true);
    return embed;
};

const strMaptoObj = strMap => {
    const obj = Object.create(null);
    for (const [k, v] of strMap) {
        obj[k] = v;
    }
    return obj;
};
const objToStrMap = obj => {
    const strMap = new Map();
    for (const k of Object.keys(obj)) {
        strMap.set(k, obj[k]);
    }
    return strMap;
};

// eslint-disable-next-line no-unused-vars
const jsonToStrMap = jsonStr => {
    return objToStrMap(JSON.parse(jsonStr));
};

const calculateLvlUp = async (message, player) => {
    if (playerdata[player].level >= 10) return;
    if (playerdata[player].currentxp >= playerdata[player].maxxp) {
        playerdata[player].level += 1;
        playerdata[player].attack += 1;
        playerdata[player].currentxp = 0;
        playerdata[player].maxxp = LEVEL_XP_TOTALS[`${playerdata[player].level}`];
        playerdata[player].maxhp += 1;
        playerdata[player].currenthp = playerdata[player].maxhp;

        const user = await message.client.fetchUser(player);
        const userName = user.username;
        const title = `${userName} **YOU ARE NOW ** 🅻🆅🅻 ${LEVEL_EMOJI[playerdata[player].level]}!`;
        const embed = this.constructEmbed(title, '', LEVEL_UP_IMAGE, null);
        message.client.channels.get(BOT_CHANNEL_ID).send(embed);
        this.exportJson(playerdata, 'playerdata');
    }
};