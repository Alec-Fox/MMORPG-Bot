module.exports = {
    BOT_USER_ID: '372392086789423104',
    BOT_CHANNEL_ID: '372365212076081164',
    ARENA_CHANNEL_ID: '619846213650612255',
    LOGGER_CHANNEL_ID: '473176714869080065',
    BOT_CATEGORY_ID: '372246646831972352',
    GUILD_ID: '371533518653751306',
    DEV_ID: '162434234357645312',
    DEATH_IMAGE: 'https://i.imgur.com/MmNjqTI.png',
    LEVEL_XP_TOTALS: {
        "1": 10,
        "2": 15,
        "3": 20,
        "4": 20,
        "5": 20,
        "6": 20,
        "7": 20,
        "8": 20,
        "9": 20,
        "10": 20

    },
    LEVEL_EMOJI: {
        "1": '1⃣',
        "2": '2⃣',
        "3": '3⃣',
        "4": '4⃣',
        "5": '5⃣',
        "6": '6⃣',
        "7": '7⃣',
        "8": '8⃣',
        "9": '9⃣',
        "10": '🔟'
    },
    NEW_PLAYER_DATA: {
        "level": 1,
        "currentxp": 0,
        "maxxp": 10,
        "currency": 3,
        "maxhp": 15,
        "currenthp": 15,
        "defense": 0,
        "attack": 1,
        "armor": "none equiped",
        "weapon": "none equiped",
        "inventory": { "health-potions": 0 },
        "quest": { "active": false, "type": "", "total": null, "progress": null, "reward": null, "img": "" },
        "dungeonActive" :false,
        "dungeonChannel": ""
    },
    DUNGEON_DATA: {
            "dungeonID": "",
            "dungeonNumber": "",
            "players": "",
            "currentMob1": "",
            "currentMob2": "",
            "currentBoss": "",
            "progress": 1,
            "lastMessageId" : ""
    },
    HELP_LIST: `
    -----------------------------------MMORPG Commmands----------------------------------
    **!help** -             Displays MMORPG bot commands.

    **!stats** -            Displays your stats.
    **!stats @user** -      Display user's stats.                      

    **!shop** -             Displays item shop.

    **!buy <item name>** -  Purchases item from shop.

    **!attack** -           Attacks the monster. Deals your attack damage to them, and theirs to you.

    **!pot** -              Consumes 1 health-potion (heals you 20❤️).
    **!pot @user** -        Consumes 1 health-potion (heals user 20❤️).

    **!quest** -            Start a quest or view your current progress.
    **!quest @user** -      View quest for user.

    **!abandon** -          Abandon your current quest.

    **!join-queue** -       Join the queue for a dungeon.
    **!leave-queue** -      Leave the queue for a dungeon.

    **!start-dungeon** -    Start the dungeon with everyone in the queue.
    **!leave-dungeon** -    Abandon the dungeon 

    ----------------------------------MMORPG HOW TO PLAY---------------------------------
    Monsters spawn randomly in the areana while you are playing games on your PC. 

    Attack and defeat them to gain gold and xp! (Only person who gets final blow will receive reward and xp!)

    Complete quests to gain extra gold.

    You die if your health drops to 0. You will lose a portion of your current xp on death.

    Purchase items in the shop to grow stronger.

    Enter Dungeons (with or without friends) to face stronger monsters with better rewards!
    `
};

deepFreeze = constants => {
    var propNames = Object.getOwnPropertyNames(constants);
    propNames.forEach((name) => {
        var prop = constants[name];

        if (typeof prop === 'object' && prop !== null) {
            deepFreeze(prop);
        }
    });
    return Object.freeze(constants);
}

deepFreeze(module.exports);