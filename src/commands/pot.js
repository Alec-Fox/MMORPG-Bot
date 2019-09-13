const { constructEmbed, exportJson, maybeCreatePlayerData, decideUser } = require('../util/utilities.js');
const playerdata = require('../data/playerdata.json');

module.exports = {
    name: 'pot',
    description: 'Heals you or mention user for 10 ❤️',
    aliases: ['heal', 'health-pot'],
    usage: ' or .pot @user',
    cooldown: 2,
    execute(message) {
        message.delete();
        const specifiedMember = message.mentions.members.first();
        const userID = decideUser(message, specifiedMember).userID;
        const userName = decideUser(message, specifiedMember).userName;
        maybeCreatePlayerData(userID);
        if (playerdata[message.author.id].inventory['health-potions'] < 1) {
            const embed = constructEmbed(`${message.author.username} you do not have any health-potions!`, '', null, null);
            message.channel.send(embed);
            return;
        }
        playerdata[message.author.id].inventory['health-potions']--;
        playerdata[userID].currenthp += 10;
        if (playerdata[userID].currenthp > (playerdata[userID].maxhp + playerdata[userID].basehp)) {
            playerdata[userID].currenthp = (playerdata[userID].maxhp + playerdata[userID].basehp);
        }
        const embed = constructEmbed(`${userName} you have been healed by 10❤️!`, '', null, null);
        exportJson(playerdata, 'playerdata');
        return message.channel.send(embed);
    },
};