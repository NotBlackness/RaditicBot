const { SlashCommandBuilder } = require('discord.js');
const { PermissionsBitField } = require('discord.js');
const { getPrefix } = require('../../config.js');
const prefixSchema = require('../../Schemas/prefixSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('prefix')
    .setDescription('Change the bot prefix or check the bot\'s current prefix.')
    .addStringOption(option =>
      option.setName('new_prefix')
        .setDescription('The new prefix to set.')
        .setRequired(false)
    ),

  async execute({interaction}) {
    const currentPrefix = await getPrefix(interaction.guild.id);
    const newPrefix = interaction.options.getString('new_prefix');

    if (!newPrefix) {
      return interaction.reply(`The current prefix for this server is: \`${currentPrefix}\``);
    }

    const formattedPrefix = newPrefix.toLowerCase(); // Convert the provided prefix to lowercase

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: 'You do not have admin permission to use this command.', ephemeral: true });
    }

    try {
      let prefixData = await prefixSchema.findOne({ guildId: interaction.guild.id });

      if (!prefixData) {
        prefixData = await prefixSchema.create({
          guildId: interaction.guild.id,
          prefix: formattedPrefix // Save the lowercase prefix
        });
      } else {
        if (prefixData.prefix === formattedPrefix) {
          return interaction.reply(`The prefix "${formattedPrefix}" is already set in this server.`);
        }
      }

      prefixData.prefix = formattedPrefix; // Save the lowercase prefix
      await prefixData.save();

      return interaction.reply(`Prefix has been changed to: \`${formattedPrefix}\``);
    } catch (error) {
      console.error('Error changing prefix:', error);
      return interaction.reply('An error occurred while changing the prefix.');
    }
  },
};