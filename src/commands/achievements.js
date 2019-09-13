const { constructEmbed, decideUser, maybeCreatePlayerData } = require('../util/utilities.js');
const playerdata = require('../data/playerdata.json');
const { ACHIEVEMENTS } = require('../util/constants.js');

module.exports = {
    name: 'achievements',
    description: 'Displays user\'s accolades',
    aliases: ['medals'],
    usage: '',
    cooldown: 5,
    async execute(message) {
        message.delete();
        const specifiedMember = message.mentions.members.first();
        const userID = decideUser(message, specifiedMember).userID;
        const userName = decideUser(message, specifiedMember).userName;
        maybeCreatePlayerData(userID);
        const achievements = playerdata[userID].achievements.split('');
        const sortedAchievements = achievements.sort();
        let achievementIcons = '';
        for (let i = 0; i < sortedAchievements.length; i++) {
            achievementIcons += ACHIEVEMENTS[sortedAchievements[i]];
        }
        const title = `${userName}'s Achievements: `;
        const description = `${achievementIcons}`;
        const embed = constructEmbed(title, description, null, null);
        return message.channel.send(embed);
    },
};