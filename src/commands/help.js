const { constructEmbed } = require('../util/utilities.js');
module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['commands'],
	usage: '[command name]',
	cooldown: 5,
	execute(message, args) {
		message.delete();
		const data = [];
		const { commands } = message.client;
		if (!args.length) {
			data.push('Here\'s a list of all the commands:\n');
			data.push(commands.map(command => command.name).join(` \n${message.client.config.prefix}`));
			data.push(`\nYou can send \`${message.client.config.prefix}help [command name]\` to get info on a specific command!`);
			const embed = constructEmbed(data[0], data.splice(1), null, null);
			return message.channel.send(embed)
				.then(() => {
					if (message.channel.type === 'dm') return;
				})
				.catch(error => {
					console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
					message.reply('it seems like I can\'t DM you!');
				});
		}
		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
		if (!command) {
			return message.reply('that\'s not a valid command, use .help or .help [command name]!');
		}
		data.push(`**Command Name:** ${message.client.config.prefix}${command.name}`);
		if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
		if (command.description) data.push(`**Description:** ${command.description}`);
		if (command.usage) data.push(`**Usage:** ${message.client.config.prefix}${command.name} ${command.usage}`);
		data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);
		const embed = constructEmbed(data[0], data.splice(1), null, null);
		return message.channel.send(embed);
	},
};