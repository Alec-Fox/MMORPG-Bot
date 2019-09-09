/**
 * Created by Alec F
 */
const botSettings = require("../botsettings.json");
const Discord = require("discord.js");
const spawn = require('./spawner.js');
const m = require('./misc.js');
const shop = require('./shop.js');
const combat = require('./combat.js');

logger = require('./logger.js');

var bot = new Discord.Client({ autoReconnect: true });
bot.on("ready", async () => {
    combat.resetFight();
    console.log(` ${bot.user.username} 2.0 is ready bitches!`);
    try {
        let link = await bot.generateInvite(["ADMINISTRATOR"]);
    } catch (e) {
        console.log(e.stack);
    }
});

/**
 * Reconnects the bot if diconnected.
 */
bot.on('disconnect', (event) => {
    console.error(error);
    bot.login(botSettings.testToken);
    combat.resetFight();

});

/**
 * Listens for error events and logs them in console.
 */
bot.on('error', (error) => {
    console.error(error);
});

/**
 * listens for updates to a user's presence (online status, game, etc).
 */

bot.on('presenceUpdate', (oldMember, newMember) => {
    spawn.maybeSpawn(bot);
});

/** listens for messages from users
 * 
 */

bot.on('message', msg => {
    if (msg.author.bot) return;
    if (msg.channel.type === "dm") return;
    //messages turned into array to read messageArray[0] as a command for bot
    let msgArray = msg.content.split(" ");
    let command = msgArray[0];
    var specifiedMember = msg.mentions.members.first();
    m.maybeCreatePlayerData(msg.author.id);
    m.checkCommand(command, msg);
    shop.shopEmbed(command, msg);
    combat.attack(command, msg)
    shop.purchaseItem(command, msg, msgArray);
    m.sendPlayerData(command, msg);
    m.useHpPot(command, msg);
    m.helpMessage(command, msg);
});

//logs bot into server
bot.login(botSettings.token);