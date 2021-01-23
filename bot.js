// bot.js
// ======

const Discord = require('discord.js');
const source = require('rfr');
const { execFileSync } = require('child_process');
const YAML = require('yaml');
const fs = require('fs');

const logger = source('logger');

const client = new Discord.Client();
const config = loadConfig();

// this will remove all whitespace beteen tokens
function splitStringBySpace(string) {
    return string.split(/\s+/).filter((s) => s.length !== 0);
}

// remove the command from the string
function discardCommand(string) {
    const firstSpace = string.indexOf(' ');
    return firstSpace === -1 ? '' : string.slice(firstSpace).trim();
}

function sendMessage(channel, message) {
    return channel.send(message)
        .then((r) => logger.log('Successfully sent message: ', + r))
        .catch((e) => logger.log('Error: could not send message: ', e));
}

function loadConfig() {
    const file = fs.readFileSync('/config/config.yml', {encoding:'utf8', flag:'r'});
    const config = YAML.parse(file);
    const commandList = config.commands.map(e => Object.values(e)[0]);

    config.commands = commandList;
    return config;
}

function runCommand(command, message) {
    const commandConfig = config.commands.find(e => e.name === command);

    if (commandConfig) {
        try {
            const stdout = execFileSync(`/config/startscripts/${commandConfig.script}`);
            logger.log(stdout.toString());
            sendMessage(message.channel, "command ran successfully");
        } catch (err) {
            logger.log(err);
            sendMessage(message.channel, "command failed");
        }
    }
}

client.once('ready', () => {
    logger.log('ready');
});

client.on('error', (err) => {
    logger.log(`Error: bot encountered error {${err}}`);
    client.login(process.env.DISCORD_TOKEN).then((r) => logger.log(`Login successful: ${r}`));
});

client.on('message', (message) => {

    // Handle message if not from self
    if (!message.author.bot &&
        message.content.toLowerCase().startsWith('!run') &&
        config.listen_channels.includes(message.channel.id)) {

        logger.log(`Command received: {${message.content}}`);

        const content = discardCommand(message.content);
        runCommand(content, message);
    }
});



client.login(process.env.DISCORD_TOKEN);
