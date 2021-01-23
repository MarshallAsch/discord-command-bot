// bot.js
// ======

const Discord = require('discord.js');
const source = require('rfr');
const { execFileSync } = require('child_process');
const YAML = require('yaml');
const fs = require('fs');

const logger = source('logger');

const client = new Discord.Client();


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


function runCommand(command, message) {
    // lookup in config file
    const file = fs.readFileSync('/config/config.yml', {encoding:'utf8', flag:'r'})
    const config = YAML.parse(file)
    const commandConfig = config.commands.map(e => Object.values(e)[0]).find(e => e.name === command);

    if (commandConfig) {
        try {
            const stdout = execFileSync(`/config/startscripts/${commandConfig.script}`);
            logger.log(stdout.toString());
            sendMessage(message.channel, "command ran successfully")
        } catch (err) {
            logger.log(err);
            sendMessage(message.channel, "command failed")
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
    logger.log(`Message received: {${message.content}}`);

    // Handle message if not from self
    if (!message.author.bot) {
        message.content.toLowerCase().startsWith('!run');

        const content = discardCommand(message.content);
        runCommand(content, message);


    }
});



client.login(process.env.DISCORD_TOKEN);
