const { constructEmbed } = require('../util/utilities.js');
const playerdata = require('../data/playerdata.json');
const { LEVEL_EMOJI } = require('../util/constants.js');

module.exports = {
    name: 'ranks',
    description: 'Displays the leaderboard for the server.',
    aliases: ['leaderboard', 'leaderboards', 'rank'],
    usage: '',
    cooldown: 5,
    async execute(message) {
        message.delete();
        const keys = Object.keys(playerdata);
        const leaderboardData = [];
        const client = message.client;
        for (let i = 0; i < keys.length; i++) {
            const user = await client.fetchUser(keys[i]);
            const userName = user.username;
            leaderboardData.push({ 'username': userName, 'lvl': playerdata[keys[i]].level });
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