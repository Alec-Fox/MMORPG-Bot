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
        let top25 = leaderboardData.length;
        if (leaderboardData.length > 25) top25 = 25;
        for (let i = 0; i < top25; i++) {
            let levelEmoji = LEVEL_EMOJI[leaderboardData[i].lvl];
            if(leaderboardData[i].lvl > 10) {
                levelEmoji = LEVEL_EMOJI[1] + LEVEL_EMOJI[leaderboardData[i].lvl - 10];
            }
            embedFields.push({ name: `**${leaderboardData[i].username}**`, value: `🅻🆅🅻 ${levelEmoji}`, img: null, inline: true });
        }
        const embed = constructEmbed('**LEADERBOARDS (TOP 25)**', '', null, embedFields);
        return message.channel.send(embed);
    },
};