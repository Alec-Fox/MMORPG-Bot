module.exports = {
    name: 'ability',
    description: 'Use your activated ability.',
    usage: ' or ability @user',
    cooldown: 1 / 2,
    async execute(message) {
        message.client.players[message.member.id].class.ability1(message);
    },
};