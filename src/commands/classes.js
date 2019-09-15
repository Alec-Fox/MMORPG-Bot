const { constructEmbed } = require('../util/utilities.js');
const { CLASSES } = require('../util/constants.js');
module.exports = {
    name: 'classes',
    description: 'Displays list of available classes.',
    aliases: ['class'],
    usage: '',
    cooldown: 5,
    execute(message) {
        message.delete();
        const embed = constructEmbed('**Classes**', 'type .<class name> to choose your class.', null, null);
        for(let i = 0; i < CLASSES.length; i++) {
            embed.addField(`**${CLASSES[i].name}**`, '\u200B', true);
            embed.addField(`**Active: ${CLASSES[i].active}**`, `${CLASSES[i].valueactive}%`, true);
            embed.addField(`**Passive: ${CLASSES[i].passive}**`, `${CLASSES[i].valuepassive}%`, true);

        }
        message.channel.send(embed);
    },
};