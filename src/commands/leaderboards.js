// this code will break if there are over 25 members in the guild. need to refactor before release.
const { constructEmbed } = require('../util/utilities.js');
const { LEVEL_EMOJI, BOT_CHANNEL_ID } = require('../util/constants.js');

module.exports = {
    name: 'ranks',
    description: 'Displays the leaderboard for the server.',
    aliases: ['leaderboard', 'leaderboards', 'rank'],
    usage: '',
    cooldown: 5,
    async execute(message) {
        message.delete();
        if(message.channel.id !== BOT_CHANNEL_ID) return;
        const keys = Object.keys(message.client.players);
        const leaderboardData = [];
        for (let i = 0; i < keys.length; i++) {
            leaderboardData.push({ 'username': message.client.players[keys[i]].name, 'lvl': message.client.players[keys[i]].level });
        }
        leaderboardData.sort(function(a, b) { return b.lvl - a.lvl; });
        const embedFields = [];
        for (let i = 0; i < leaderboardData.length; i++) {
            embedFields.push({ name: `**${leaderboardData[i].username}**`, value: `🅻🆅🅻 ${LEVEL_EMOJI[leaderboardData[i].lvl]}`, img: null, inline: true });
        }
        const embed = constructEmbed('**LEADERBOARDS**', '', null, embedFields);
        return message.channel.send(embed);
    },
};