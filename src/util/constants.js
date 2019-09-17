module.exports = {
    BOT_USER_ID: '372392086789423104',
    BOT_CHANNEL_ID: '372365212076081164',
    ARENA_CHANNEL_ID: '619846213650612255',
    LOGGER_CHANNEL_ID: '473176714869080065',
    BOT_CATEGORY_ID: '372246646831972352',
    GUILD_ID: '371533518653751306',
    DEV_ID: '162434234357645312',
    DEATH_IMAGE: 'https://i.imgur.com/BVScqCl.png',
    LEVEL_UP_IMAGE: 'https://i.imgur.com/BncqEFS.png',
    CLEAN_BATHROOM_IMAGE: 'https://i.imgur.com/Rd3HtaE.png',
    DIRTY_BATHROOM_IMAGE: 'https://i.imgur.com/P93YXN6.png',
    PRIEST_IMAGE: 'https://i.imgur.com/PXEuEQb.png',
    XP_ICON_BLACK: '⬛',
    XP_ICON_WHITE: '⬜',
    ACHIEVEMENTS: {
        '1': '🥉',
        '2': '🥈',
        '3': '🥇',
    },
    LEVEL_XP_TOTALS: {
        '1': 10,
        '2': 15,
        '3': 20,
        '4': 20,
        '5': 20,
        '6': 20,
        '7': 20,
        '8': 20,
        '9': 20,
        '10': 20,

    },
    LEVEL_EMOJI: {
        '1': '1⃣',
        '2': '2⃣',
        '3': '3⃣',
        '4': '4⃣',
        '5': '5⃣',
        '6': '6⃣',
        '7': '7⃣',
        '8': '8⃣',
        '9': '9⃣',
        '10': '🔟',
    },
    NEW_PLAYER_DATA: {
        'name': '',
        'level': 1,
        'currentxp': 0,
        'maxxp': 10,
        'currency': 5,
        'basehp': 15,
        'baseattack': 1,
        'maxhp': 1,
        'currenthp': 15,
        'defense': 0,
        'attack': 1,
        'armor': 'none equiped',
        'weapon': 'none equiped',
        'inventory': { 'health-potions': 1 },
        'quest': { 'active': false, 'type': '', 'total': null, 'progress': null, 'reward': null, 'img': '' },
        'dungeonActive': false,
        'dungeonChannel': '',
        'achievements': '',
        'lasthpbar': '',
        'class' : false,
    },
    DUNGEON_DATA: {
        'dungeonNumber': '',
        'players': '',
        'currentMob1': '',
        'currentMob2': '',
        'currentMob3': '',
        'progress': 1,
        'lastMessageId': '',
        'currentFight': '',
        'total_xp': 0,
        'total_reward': 0,
    },
    CLASSES: [
        { 'name': 'Assassin', 'active': 'Deadly Shot', 'valueactive': 300, 'passive': 'Deals 3x your attack damage.', 'valuepassive': 5 },
        { 'name': 'Healer', 'active': 'Heal', 'valueactive': 50, 'passive': 'Heals you/@someone for 10.', 'valuepassive': 3 },
        { 'name': 'Tank', 'active': 'Shield Bash', 'valueactive' : 100, 'passive': 'Deals current HP as damage.', 'valuepassive': 5 },
        { 'name': '(next patch) Sneaker', 'active': 'Hide', 'valueactive': 100, 'passive': 'Evasion', 'valuepassive': 25 },
        { 'name': '(next patch) Sharp Shooter', 'active': 'Snipe', 'valueactive': 200, 'passive': 'Damage Bonus', 'valuepassive': 30 }],
};