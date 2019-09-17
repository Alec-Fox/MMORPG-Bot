const { constructEmbed, decideUser } = require('../util/utilities.js');

module.exports = {
    name: 'pot',
    description: 'Heals you or mention user for 10 ❤️',
    aliases: ['heal', 'health-pot'],
    usage: ' or .pot @user',
    cooldown: 1 / 2,
    execute(message) {
        message.delete();
        const specifiedMember = message.mentions.members.first();
        const userID = decideUser(message, specifiedMember);
        if (message.client.players[message.member.id].inventory['health-potions'] < 1) {
            const embed = constructEmbed(`${message.member.displayName} you do not have any health-potions!`, '', null, null);
            message.channel.send(embed);
            return;
        }
        message.client.players[message.author.id].inventory['health-potions']--;
        message.client.players[userID].heal(message, 10);
    },
};