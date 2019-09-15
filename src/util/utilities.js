const fs = require('fs');
const { RichEmbed } = require('discord.js');
const { NEW_PLAYER_DATA, ARENA_CHANNEL_ID } = require('./constants.js');
const playerdata = require('../data/playerdata.json');

/**
 * Returns an embed object.
 *
 * @param {string} title - Title for the embed.
 * @param {string} description - Description for the embed.
 * @param {string} image - image URL for the embed.
 * @param {Array} fields - Array of objects for the embed fields.
 */
exports.constructEmbed = (title, description, image, fields) => {
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

/**
 * Returns a random number between min and max.
 *
 * @param {number} min - min range for random number (inclusive)
 * @param {number} max - max range of random number (exclusive)
 */
exports.getRand = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor((Math.random() * max) + min);
};

/**
 * Filter for JSON.Stringify.
 */
function replacer(key, value) {
    if (key == 'lasthpbar') return key = '';
    else return value;
}

/**
 * writes content to specified file.
 *
 * @param {object} content - Content to be exported to file.
 * @param {string} filename - Filename to save to.
 */
exports.exportJson = (content, fileName) => {
    fs.writeFileSync(`./src/data/${fileName}.json`, JSON.stringify(content, replacer));
};

/**
 * Creates player data if it does not already exist.
 *
 * @param {string} userID - User's discord ID.
 */
exports.maybeCreatePlayerData = (userID) => {
    if (playerdata[userID]) return;
    playerdata[userID] = Object.assign({}, NEW_PLAYER_DATA);
    this.exportJson(playerdata, 'playerdata');
};

/**
 * Returns a string of ❤️s representing the health value.
 *
 * @param {number} health - Health value.
 */
exports.generateHeartsBar = health => {
    let hp = '';
    for (let i = 0; i < health; i++) {
        hp += '❤️';
    } return hp;
};

/**
 * Returns a userID depending if there was a mentioned member or not
 *
 * @param {object} message - Discord message.
 * @param {object} specifiedMember - Discord mentioned member.
 */
exports.decideUser = (message, specifiedMember) => {
    const userID = (specifiedMember) ? specifiedMember.id : message.author.id;
    return userID;
};

/**
 * Returns a a random mob from the provided file
 *
 * @param {string} filePath - filepath for mob file.
 */
exports.chooseMonster = filePath => {
    const { mob } = require(`../data/${filePath}`);
    const keys = Object.keys(mob);
    const chosenMob = this.getRand(0, keys.length);
    return mob[chosenMob];
};

/**
 * 66% chance to spawn a mob (called on presence change).
 *
 * @param {object} Client - Discord Client.
 */
exports.maybeSpawnMob = client => {
    if (!client.monster.dead()) return;
    const spawnChance = this.getRand(1, 10);
    if(spawnChance > 6) return;
    const Monster = require('../struct/Monster.js');
    const mob = new Monster(this.chooseMonster('mobdata'));
    client.monster = mob;
    client.monster.spawn(client, ARENA_CHANNEL_ID);
};