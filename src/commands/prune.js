const { DEV_ID } = require('../util/constants.js');

module.exports = {
    name: 'prune',
    description: '(ADMIN ONLY) Prune up to 99 messages.',
    args: true,
    usage: '[number]',
    cooldown: 5,
    execute(message, args) {
        message.delete();
        if (message.member.id !== DEV_ID) return message.reply('You do not have the privilages to use this command!');
        const amount = parseInt(args[0]) + 1;

        if (isNaN(amount)) {
            return message.reply('that doesn\'t seem to be a valid number.');
        }
        else if (amount <= 1 || amount > 100) {
            return message.reply('you need to input a number between 1 and 99.');
        }

        message.channel.bulkDelete(amount, true).catch(err => {
            console.error(err);
            message.channel.send('there was an error trying to prune messages in this channel!');
        });
    },
};