module.exports = {
    name: 'flee',
    description: 'Flee from the current monster. The monster runs away.',
    aliases: ['run'],
    usage: '',
    cooldown: 5,
    execute(message) {
        message.client.players[message.member.id].flee(message);
    },
};