const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const schema = require('../../Schemas/autoresponder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoresponse')
    .setDescription('Manage Auto Responder')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add an autoresponse.')
        .addStringOption(option =>
          option
            .setName('trigger')
            .setDescription('The trigger it will auto response to.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('response')
            .setDescription('The response for the trigger.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove an auto response.')
        .addStringOption(option =>
          option
            .setName('trigger')
            .setDescription('Remove the auto response by its trigger.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all the auto responses.')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove-all')
        .setDescription('Remove all auto responses.')
    ),

  async execute({ interaction }) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return await interaction.reply({ content: 'You must have **Administrator** permission to use this command.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (subcommand === 'add') {
      const trigger = interaction.options.getString('trigger').toLowerCase();
      const response = interaction.options.getString('response');

      let data = await schema.findOne({ guildId });
      if (!data) {
        // Create new schema if it doesn't exist
        data = await schema.create({
          guildId,
          autoresponses: [{ trigger, response }],
        });
      } else {
        // Check for duplicate triggers
        if (data.autoresponses.some(res => res.trigger === trigger)) {
          return interaction.reply({ content: 'You must have unique triggers.', ephemeral: true });
        }

        // Add new autoresponse
        data.autoresponses.push({ trigger, response });
        await data.save();
      }

      const embed = new EmbedBuilder()
        .setTitle('AutoResponse Created')
        .setDescription(`Trigger: ${trigger}\nResponse: ${response}`)
        .setColor('#A020F0')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'remove') {
      const trigger = interaction.options.getString('trigger').toLowerCase();

      const data = await schema.findOne({ guildId });
      if (!data || !data.autoresponses.some(res => res.trigger === trigger)) {
        return interaction.reply({ content: 'I couldn\'t find an auto response with that trigger.', ephemeral: true });
      }

      // Remove the specific autoresponse
      data.autoresponses = data.autoresponses.filter(res => res.trigger !== trigger);
      await data.save();

      const embed = new EmbedBuilder()
        .setDescription(`Deleted auto response with trigger: ${trigger}`)
        .setColor('#A020F0');
      await interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'list') {
      const data = await schema.findOne({ guildId });

      if (!data || data.autoresponses.length === 0) {
        const embed = new EmbedBuilder()
          .setTitle('AutoResponse List')
          .setDescription('No autoresponses found.')
          .setColor('#A020F0');
        return interaction.reply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setTitle('AutoResponse List')
        .setDescription('List of all autoresponses.')
        .setColor('#A020F0');

      data.autoresponses.forEach((autoresponse, index) => {
        embed.addFields({
          name: `Autoresponse #${index + 1}`,
          value: `Trigger: ${autoresponse.trigger}\nResponse: ${autoresponse.response}`,
        });
      });

      await interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'remove-all') {
      const data = await schema.findOne({ guildId });

      if (!data || data.autoresponses.length === 0) {
        return interaction.reply({ content: 'No Autoresponder Found.', ephemeral: true });
      }

      // Clear all autoresponses
      data.autoresponses = [];
      await data.save();

      const embed = new EmbedBuilder()
        .setDescription('Successfully deleted all responses.')
        .setColor('#A020F0');
      await interaction.reply({ embeds: [embed] });
    }
  }
};