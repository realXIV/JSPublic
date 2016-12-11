try {
    var Discord = require("discord.js");
    var config = require("./config.json");
    var fs = require("fs");
    var mkdirp = require("mkdirp");
    var requireDir = require('require-dir');
} catch (err) {
    console.log(`Failed to load dependency, ${err}`)
    return;
}

var bot = new Discord.Client();
var token = config.bottoken;
var commandrole = config.commandrole;
var ownerid = config.ownerid;
var prefix = config.prefix;
bot.funcs = requireDir("./funcs/");
bot.elevation = require("./elevation.js")

bot.funcs.loadcmds(bot, Discord, fs);

bot.login(token);

bot.on('ready', () => {
    bot.user.setGame()
    startdate = new Date()
    console.log("Bot online (" + startdate + ")")
});



bot.on('message', msg => {
    var prefixtrue = false;

    if (msg.content.startsWith(`<@!${bot.user.id}> `)) {
        msg.content = msg.content.replace('!', '');
    }

    if (msg.content.startsWith(prefix))
        prefixtrue = true;

    if (msg.channel.type !== 'text')
        return;

    if (msg.author.bot)
        return;

    if (!msg.content.startsWith(`<@${bot.user.id}> `) && !prefixtrue)
        return;

    if (prefixtrue) {
        var command = (msg.content.split(" ")[0].slice(prefix.length)).toLowerCase();
        var params = msg.content.split(" ").slice(1);
    } else {
        var command = (msg.content.split(" ")[1].slice(`<@${bot.user.id}>`)).toLowerCase();
        var params = msg.content.split(" ").slice(2);
    }

    let perms = bot.elevation.resolve(msg, ownerid);
    let cmd;

    if (!command)
        return;

    if (bot.commands.has(command)) {
        cmd = bot.commands.get(command);
    } else if (bot.aliases.has(command)) {
        cmd = bot.commands.get(bot.aliases.get(command));
    }

    if (cmd) {
        if (perms < cmd.conf.permLevel)
            return;
        cmd.run(bot, msg, params, config, perms);
    }
});

process.on("unhandledRejection", err => {
    fs.appendFile("error.txt", err.stack + "\n", function(error) {});
    console.log("Unhandled Error: \n" + err.stack);
});
