const { constructEmbed, generateHeartsBar, generateXpBar, maybeCreatePlayerData, decideUser } = require('../util/utilities.js');
const playerdata = require('../data/playerdata.json');
const { LEVEL_EMOJI } = require('../util/constants.js');

module.exports = {
    name: 'stats',
    description: 'Display your stats or mentioned user\'s stats.',
    aliases: ['inventory'],
    usage: ' or .stats @user',
    cooldown: 5,
    execute(message) {
        message.delete();
        const specifiedMember = message.mentions.members.first();
        const userID = decideUser(message, specifiedMember).userID;
        const userName = decideUser(message, specifiedMember).userName;
        maybeCreatePlayerData(userID);
        const hpIcons = generateHeartsBar(playerdata[userID].currenthp);
        const xpBar = generateXpBar(playerdata[userID].currentxp, playerdata[userID].maxxp);
        const title = `🅻🆅🅻 ${LEVEL_EMOJI[`${playerdata[userID].level}`]}      ${userName}'s Stats`;
        const description = `**HP:[${playerdata[userID].currenthp}/${(playerdata[userID].maxhp + playerdata[userID].basehp)}]**${hpIcons}`;
        const fields = [
            { name: `⚔${playerdata[userID].attack + playerdata[userID].baseattack}`, value: `**${playerdata[userID].weapon}**`, inline: true },
            { name: `🛡${playerdata[userID].defense}`, value: `**${playerdata[userID].armor}**`, inline: true },
            { name: `💰${playerdata[userID].currency}`, value: 'GOLD', inline: true },
            { name: '```🅸🅽🆅🅴🅽🆃🅾🆁🆈: \nHEALTH-POTIONS: ```' + `${playerdata[userID].inventory['health-potions']}`, value: `**XP:[${playerdata[userID].currentxp}/${playerdata[userID].maxxp}]**\n${xpBar}`, inline: true },
        ];
        const embed = constructEmbed(title, description, null, fields);
        return message.channel.send(embed);

    },
};