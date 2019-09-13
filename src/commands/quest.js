const { chooseMonster, getRand, exportJson, decideUser, maybeCreatePlayerData } = require('../util/utilities.js');
const playerdata = require('../data/playerdata.json');
const { RichEmbed } = require('discord.js');

module.exports = {
    name: 'quest',
    description: 'Display your quest or get a new one. Type .quest @ user to view their quest.',
    aliases: ['quests', 'mission'],
    usage: ' or .quest @user',
    cooldown: 5,
    execute(message) {
        message.delete();
        const specifiedMember = message.mentions.members.first();
        const userID = decideUser(message, specifiedMember).userID;
        const userName = decideUser(message, specifiedMember).userName;
        maybeCreatePlayerData(userID);
        if(!checkQuestActive(userID)) {
            generateQuest(userID);
            const questEmbed = buildQuestField(userID, userName);
            return message.channel.send(questEmbed);
        }
        const questEmbed = buildQuestField(userID, userName);
        return message.channel.send(questEmbed);
    },
};

const checkQuestActive = (userID) => {
    if (playerdata[userID].quest.active) return true;
    return false;
};

const generateQuest = userID => {
    const questData = chooseMonster('mobdata');
    const totalQuest = getRand(1, 15);
    playerdata[userID].quest = { 'active': true, 'type': `${questData.name}`, 'total': totalQuest, 'progress': 0, 'reward': Math.floor((totalQuest / 2) + 1), 'img': questData.image };
    exportJson(playerdata, 'playerdata');
};

const buildQuestField = (userID, userName) => {
    const embed = new RichEmbed()
        .setColor(3021383)
        .setTitle(`-------------------**${userName}'s Active Quest**-------------------`)
        .setThumbnail(`${playerdata[userID].quest.img}`);
    embed.addField(`Bounty: ${playerdata[userID].quest.type}`, `Progress: [${playerdata[userID].quest.progress}/ ${playerdata[userID].quest.total}]`);
    embed.addField(`Reward: 💰${playerdata[userID].quest.reward}`, '\u200B');

    return embed;
};