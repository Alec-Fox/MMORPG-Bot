const fs = require('fs');
// eslint-disable-next-line no-var
const { RichEmbed } = require('discord.js');
const { NEW_PLAYER_DATA, ARENA_CHANNEL_ID } = require('./constants.js');
const playerdata = require('../data/playerdata.json');

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

exports.getRand = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor((Math.random() * max) + min);
};
function replacer(key, value) {
    if (key == 'lasthpbar') return key = '';
    else return value;
}
exports.exportJson = (content, fileName) => {
    fs.writeFileSync(`./src/data/${fileName}.json`, JSON.stringify(content, replacer));
};

exports.maybeCreatePlayerData = (userID) => {
    if (playerdata[userID]) return;
    playerdata[userID] = Object.assign({}, NEW_PLAYER_DATA);
    this.exportJson(playerdata, 'playerdata');
};

exports.generateHeartsBar = health => {
    let hp = '';
    for (let i = 0; i < health; i++) {
        hp += '❤️';
    } return hp;
};

exports.decideUser = (message, specifiedMember) => {
    const userID = (specifiedMember) ? specifiedMember.id : message.author.id;
    return userID;
};

exports.chooseMonster = filePath => {
    const { mob } = require(`../data/${filePath}`);
    const keys = Object.keys(mob);
    const chosenMob = this.getRand(0, keys.length);
    return mob[chosenMob];
};

exports.maybeSpawnMob = client => {
    if (!client.monster.dead()) return;
    const Monster = require('../struct/Monster.js');
    const mob = new Monster(this.chooseMonster('mobdata'));
    client.monster = mob;
    client.monster.spawn(client, ARENA_CHANNEL_ID);
};