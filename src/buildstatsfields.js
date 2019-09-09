const u = require('./utilities.js');
const currentfight = require('../Data/currentfight.json');
const playerdata = require('../Data/playerdata.json');

/**
 * Creates an object formatted for embed mob/boss use
 *
 * @param {object} data - stats from data for mobs/bosses
 * @param {string} currentHp - designation to build with current hp or max hp
 */

exports.buildStatFields = (data, currentHp) => {
    currentfight.currentBoss = data;
    u.exportJson(currentfight, 'currentfight');
    var statsFields = new Object();
    var hp = '';
    for (i = 0; i < data[currentHp]; i++) {
        hp += "❤️";
    }
    defeatedImage = 'https://previews.123rf.com/images/lkeskinen/lkeskinen1612/lkeskinen161202735/67907754-you-win-rubber-stamp-grunge-design-with-dust-scratches-effects-can-be-easily-removed-for-a-clean-cri.jpg';
    var lvl;
    switch (data.level) {
        case 1: lvl = "1️⃣"; break;
        case 2: lvl = "2️⃣"; break;
        case 3: lvl = "3️⃣"; break;
        case 4: lvl = "4️⃣"; break;
        case 5: lvl = "5️⃣"; break;
        case 6: lvl = "6️⃣"; break;
        case 7: lvl = "7️⃣"; break;
        case 9: lvl = "8️⃣"; break;
        case 10: lvl = "9️⃣"; break;
        case 11: lvl = "🔟"; break;
    }

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