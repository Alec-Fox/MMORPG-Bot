const { BOT_CHANNEL_ID } = require('../util/constants.js');
module.exports = {
    name: 'flee',
    description: 'Flee from the current monster. The monster runs away.',
    aliases: ['run'],
    usage: '',
    cooldown: 5,
    execute(message) {
        message.delete();
        if(message.channel.id === BOT_CHANNEL_ID) return message.reply('There is nothing to flee here!');
        message.client.players[message.member.id].flee(message);
    },
};