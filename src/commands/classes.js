const { constructEmbed } = require('../util/utilities.js');
const { CLASSES, BOT_CHANNEL_ID } = require('../util/constants.js');
module.exports = {
    name: 'classes',
    description: 'Displays list of available classes.',
    aliases: ['class'],
    usage: '',
    cooldown: 5,
    execute(message) {
        message.delete();
        if(message.channel.id !== BOT_CHANNEL_ID) return;
        const embed = constructEmbed('**Classes**', 'type .<class name> to choose your class.', null, null);
        for(let i = 0; i < CLASSES.length; i++) {
            embed.addField(`**${CLASSES[i].name}**`, '\u200B', true);
            embed.addField(`**Active: ${CLASSES[i].active}**`, `${CLASSES[i].valueactive}%`, true);
            embed.addField(`**${CLASSES[i].passive}**`, `.ability (${CLASSES[i].valuepassive} turn cooldown.)`, true);

        }
        message.channel.send(embed);
    },
};