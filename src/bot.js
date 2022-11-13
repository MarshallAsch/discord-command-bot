// bot.js
// ======

require('dotenv').config();

const { Client, Events, GatewayIntentBits } = require('discord.js');
const { statSync } = require('fs');

const source = require('rfr');

const logger = source('src/logger');
const { loadConfig } = source('src/config');

const { loadCommands, register } = source('src/commands/load');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const configFile = process.env.CONFIG_FILE || './config.yaml';

let configuration;
let configInterval;
let lastTime;

function load() {
  logger.info('Reloading Configuration file');

  const stats = statSync(configFile, { throwIfNoEntry: false });
  if (stats === undefined) {
    logger.error('Config file not found!!');
    process.exit(1);
  }

  if (lastTime === stats.mtime) {
    logger.trace('Configuration file has not changed, not reloading');
    return;
  }

  lastTime = stats.mtime;
  configuration = loadConfig(configFile);
  const commands = loadCommands(configuration.commands);
  client.commands = commands;
  client.guilds.cache.forEach((guild) => register(token, clientId, guild.id, commands));

  if (configInterval !== undefined) {
    clearInterval(configInterval);
  }

  // don't reload if it it is less than 5 minutes
  if (configuration.reload_time < 1000 * 60 * 5) {
    logger.info('will not load config again');
    return;
  }

  configInterval = setInterval(load, configuration.reload_time);
}

client.once(Events.ClientReady, (c) => {
  logger.info(`Ready! Logged in as ${c.user.tag}`);
  load();
});

client.on(Events.Error, (err) => {
  logger.warning(`Error: bot encountered error {${err}}`);
  client.login(token).then((r) => logger.log(`Login successful: ${r}`));
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    logger.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction, configuration.connection);
  } catch (error) {
    logger.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

client.login(token);
