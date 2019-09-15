const { Client, Collection } = require('discord.js');
const Monster = require('./Monster.js');
const { chooseMonster } = require('../util/utilities.js');
const mob = new Monster(chooseMonster('mobdata'));

module.exports = class extends Client {
	constructor(config) {
		super({
			disableEveryone: true,
			disabledEvents: ['TYPING_START'],
		});

		this.commands = new Collection();

		this.cooldowns = new Collection();

		this.queue = new Map();

		this.config = config;

		this.players = {};

		this.monster = mob;

		this.dungeon = { queue: [], instance: {} };

	}
};