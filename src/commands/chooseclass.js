const classdata = require('../data/classdata.json');
const Healer = require('../struct/Healer.js');
const Tank = require('../struct/Tank.js');
const Assassin = require('../struct/Assassin.js');
module.exports = {
    name: 'chooseclass',
    description: 'Choose a class to become.',
    usage: '[class]',
    cooldown: 5,
    args: true,
    execute(message, args) {
        const players = message.client.players;
        const userID = message.member.id;
        // if (players[userID].class) return message.reply('You already have a class!');
        const classesKeys = Object.keys(classdata);
        if (classesKeys.includes(args[0])) {
            switch (args[0]) {
                case 'healer': {
                    players[userID] = Object.assign(players[userID], { class: new Healer(classdata.healer) });
                    message.reply('You are now a Priest! ');
                    break;
                }
                case 'tank': {
                    players[userID] = Object.assign(players[userID], { class: new Tank(classdata.tank) });
                    message.reply('You are now an Orc!');
                    break;
                }
                case 'assassin': {
                    players[userID] = Object.assign(players[userID], { class: new Assassin(classdata.assassin) });
                    message.reply('You are now a Ninja!');
                    break;
                }
            }
            return;
        }
        return message.reply('That is not a valid class.');
    },
};