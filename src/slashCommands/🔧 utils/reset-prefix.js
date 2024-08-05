const { SlashCommandBuilder } = require('discord.js');
const { PermissionsBitField } = require('discord.js');
const prefixSchema = require('../../Schemas/prefixSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset-prefix')
    .setDescription('Reset the custom prefix for the bot in the current server.'),

  async execute({interaction}) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: 'You do not have admin permission to use this command.', ephemeral: true });
    }

    try {
      const prefixData = await prefixSchema.findOneAndDelete({ guildId: interaction.guild.id });

      if (!prefixData) {
        return interaction.reply({ content: 'There is no custom prefix set in this server.', ephemeral: true });
      }

      return interaction.reply('Custom prefix has been reset to default.');
    } catch (error) {
      console.error('Error resetting prefix:', error);
      return interaction.reply('An error occurred while resetting the prefix.');
    }
  },
};