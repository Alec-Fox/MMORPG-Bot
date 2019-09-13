const { constructEmbed, resetFight } = require('../util/utilities.js');

module.exports = {
    name: 'flee',
    description: 'Flee from the current monster. The monster runs away.',
    aliases: ['run'],
    usage: '',
    cooldown: 5,
    execute(message) {
        message.delete();
        const embed = constructEmbed(`🏃 ${message.member.displayName}, you run away from the monster!`, '', null, null);
        resetFight();
        return message.channel.send(embed);
    },
};