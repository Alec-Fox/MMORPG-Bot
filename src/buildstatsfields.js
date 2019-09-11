const u = require('./utilities.js');
const currentfight = require('../Data/currentfight.json');
const c = require('./constants.js');

/**
 * Creates an object formatted for embed mob/boss use
 *
 * @param {object} data - stats from data for mobs/bosses
 * @param {string} currentHp - designation to build with current hp or max hp
 */

exports.buildStatFields = (data, currentHp) => {
    var statsFields = new Object();
    var hp = '';
    for (i = 0; i < data[currentHp]; i++) {
        hp += "❤️";
    }
    defeatedImage = 'https://i.imgur.com/5e3tLwn.png';
    const lvl = c.LEVEL_EMOJI[`${data.level}`];
    statsFields['hp'] = hp;
    statsFields['attack'] = data.attack;
    statsFields['armor'] = data.defense;
    statsFields['reward'] = data.reward;
    statsFields['name'] = data.name;
    statsFields['level'] = lvl;
    if (hp <= 0) {
        statsFields['img'] = defeatedImage;
    } else { statsFields['img'] = data.image; };
    return statsFields;
}