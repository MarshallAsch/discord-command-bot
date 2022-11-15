const {
  Collection, SlashCommandBuilder, REST, Routes,
} = require('discord.js');

const source = require('rfr');

const logger = source('src/logger');
const { remoteCommand } = source('src/commands/exec');

function generateCommandFunction(command) {
  return async (interaction, connection) => {
    if (command.allowed_users !== undefined
      && !command.allowed_users.includes(interaction.user.id)) {
      return interaction.reply('You are not allowed to use this command');
    }

    if (command.blocked_users !== undefined
      && command.blocked_users.includes(interaction.user.id)) {
      return interaction.reply('You are not allowed to use this command');
    }

    await interaction.deferReply({ ephemeral: true });
    const res = await remoteCommand(connection, command.command);
    return interaction.editReply(`results: \n\`\`\`${res}\`\`\``);
  };
}

function builtin() {
  const commands = new Collection();

  const ping = {
    data: new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Replies with Pong!'),
    execute: async (interaction) => interaction.reply('Pong'),
  };

  const version = {
    data: new SlashCommandBuilder()
      .setName('version')
      .setDescription('Replies with the current version of the bot'),
    execute: async (interaction) => interaction.reply(`Command-bot version: ${process.env.VCS_REF}`),
  };

  commands.set(ping.data.name, ping);
  commands.set(version.data.name, version);

  return commands;
}

function loadCommands(configCommands) {
  const commands = new Collection();

  configCommands.forEach((command) => {
    const cmd = {
      data: new SlashCommandBuilder()
        .setName(command.name)
        .setDescription(command.description || 'runs a command on the host'),
      execute: generateCommandFunction(command),
    };
    commands.set(cmd.data.name, cmd);
  });

  return commands.concat(builtin());
}

async function register(token, clientId, guildId, commandCollection) {
  const commands = commandCollection.map((c) => c.data.toJSON());

  // Construct and prepare an instance of the REST module
  const rest = new REST({ version: '10' }).setToken(token);

  // and deploy your commands!
  try {
    logger.info(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    logger.error(error);
  }
}

module.exports = {
  loadCommands,
  register,
};
