const { constructEmbed, monsterEmbed, exportJson, calculateDeath, calculateXp, generateHeartsBar, resetFight } = require('../util/utilities.js');
const playerdata = require('../data/playerdata.json');
const dungeondata = require('../data/dungeondata.json');
const { BOT_CHANNEL_ID } = require('../util/constants.js');


module.exports = {
    name: 'attack',
    description: 'Attack the monster.',
    usage: '',
    cooldown: 1,
    async execute(message) {
        const currentfight = require('../data/currentfight');
        message.delete();
        const client = message.client;
        const userID = message.author.id;
        const whichMonsterChannel = await isMonsterInChannel(message, userID, currentfight);
        if (whichMonsterChannel.arena === true) {
            const monster = currentfight.currentBoss;
            currentfight.currentBoss['current hp'] -= (playerdata[userID].attack + playerdata[userID].baseattack);
            playerdata[userID].currenthp -= currentfight.currentBoss.attack;
            const playerHpBar = generateHeartsBar(playerdata[userID].currenthp);
            const hpBarEmbed = constructEmbed(`[${playerdata[userID].currenthp}/${(playerdata[userID].maxhp + playerdata[userID].basehp)}] ${playerHpBar}`, '', null, null);
            client.channels.get(message.channel.id).send(hpBarEmbed);
            calculateDeath(message);
            await message.channel.fetchMessage(currentfight.currentBossEmbed).then(oldEmbed => { oldEmbed.delete(); });
            const embedID = await client.channels.get(message.channel.id).send(monsterEmbed(monster));
            currentfight.currentBossEmbed = embedID.id;
            if (currentfight.currentBoss['current hp'] <= 0) {
                const players = [{ id: userID }];
                calculateReward(message, players, monster.reward, monster.level);
                resetFight();
            }
            exportJson(currentfight, 'currentfight');
            exportJson(playerdata, 'playerdata');
            return;
        }
        if (whichMonsterChannel.dungeon === true) {
            const dungeonInstance = dungeondata.dungeon.findIndex(({ dungeonID }) => dungeonID === playerdata[userID].dungeonChannel);
            dungeondata.dungeon[dungeonInstance].currentFight['current hp'] -= (playerdata[userID].attack + playerdata[userID].baseattack);
            playerdata[userID].currenthp -= dungeondata.dungeon[dungeonInstance].currentFight.attack;
            const monster = dungeondata.dungeon[dungeonInstance].currentFight;
            const playerHpBar = generateHeartsBar(playerdata[userID].currenthp);
            const hpBarEmbed = constructEmbed(`[${playerdata[userID].currenthp}/${(playerdata[userID].maxhp + playerdata[userID].basehp)}] ${playerHpBar}`, '', null, null);
            client.channels.get(message.channel.id).send(hpBarEmbed);
            calculateDeath(message);
            await message.channel.fetchMessage(dungeondata.dungeon[dungeonInstance].lastMessageId).then(oldEmbed => { oldEmbed.delete(); });
            const embedID = await client.channels.get(message.channel.id).send(monsterEmbed(monster));
            // eslint-disable-next-line require-atomic-updates
            dungeondata.dungeon[dungeonInstance].lastMessageId = embedID.id;
            if (dungeondata.dungeon[dungeonInstance].currentFight['current hp'] <= 0) {
                const players = dungeondata.dungeon[dungeonInstance].players;
                calculateReward(message, players, dungeondata.dungeon[dungeonInstance].currentFight.reward, dungeondata.dungeon[dungeonInstance].currentFight.level);
                maybeContinueDung(message, dungeonInstance);
            }
            exportJson(dungeondata, 'dungeondata');
            exportJson(playerdata, 'playerdata');
            return;
        }
        return message.channel.send(constructEmbed('There is no monster to fight here!', '', null, null));
    },
};

const isMonsterInChannel = (message, userID, currentfight) => {
    const whichMonster = { arena: false, dungeon: false };
    if (message.channel.id === currentfight.currentChannel) {
        whichMonster.arena = true;
        whichMonster.dungeon = false;
        return whichMonster;
    }
    else if (message.channel.id === playerdata[userID].dungeonChannel) {
        whichMonster.arena = false;
        whichMonster.dungeon = true;
        return whichMonster;
    }
    return whichMonster;
};

const calculateReward = (message, players, reward, xp) => {
    reward = reward / players.length;
    xp = xp / players.length;
    for (let i = 0; i < players.length; i++) {
        playerdata[players[i].id].currency += reward;
        calculateXp(message, xp, players[i].id);
    }
};

const maybeContinueDung = async (message, index) => {
    const client = message.client;
    if (dungeondata.dungeon[index].progress < 4) {
        dungeondata.dungeon[index].currentFight = dungeondata.dungeon[index][`currentMob${dungeondata.dungeon[index].progress}`];
        dungeondata.dungeon[index].currentFight['current hp'] = dungeondata.dungeon[index].currentFight['max hp'];
        dungeondata.dungeon[index].progress++;
        exportJson(dungeondata, 'dungeondata');
        const monster = dungeondata.dungeon[index].currentFight;
        message.channel.send(constructEmbed('**Another monster approaches!**', '', null, null));
        await message.channel.fetchMessage(dungeondata.dungeon[index].lastMessageId).then(oldEmbed => { oldEmbed.delete(); });
        const embedID = await client.channels.get(message.channel.id).send(monsterEmbed(monster));
        // eslint-disable-next-line require-atomic-updates
        dungeondata.dungeon[index].lastMessageId = embedID.id;
        return;
    }
    const embed = constructEmbed('**-----------------------Victorious!-------------------------**', '**These brave heroers have scrubbed the dungeon clean!**', null, null);
    for (let i = 0; i < dungeondata.dungeon[index].players.length; i++) {
        const user = await client.fetchUser(dungeondata.dungeon[index].players[i].id);
        embed.addField(`${user.username}`, '\u200B', true);
        playerdata[user.id].dungeonActive = false;
        playerdata[user.id].dungeonChannel = '';
        exportJson(playerdata, 'playerdata');
    }
    client.channels.get(BOT_CHANNEL_ID).send(embed);
    client.channels.get(dungeondata.dungeon[index].dungeonID).delete();


};