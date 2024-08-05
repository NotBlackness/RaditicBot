const { EmbedBuilder, SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const counting = require('../../Schemas/countingSchema');
const { color } = require('../../config')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('counting')
    .setDescription('Manage Counting System.')
    .addSubcommand(subcommand => {
      return subcommand
      .setName('setup')
      .setDescription('Setup the counting system.')
      .addChannelOption(option => {
        return option
        .setName('channel')
        .setDescription('The channel where you want to enable the counting system.')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)
      })
    })
    .addSubcommand(subcommand => {
      return subcommand
      .setName('disable')
      .setDescription('Disable the counting system.')
    }),
  async execute({interaction}) {

    const { options, guild } = interaction;
    const subcommand = options.getSubcommand();
    const data = await counting.findOne({ Guild: interaction.guild.id });

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: "You don't have \`Administrator\` permission to manage the counting system.", ephemeral: true });

    if (subcommand === "setup") {
      if (data) {
        return await interaction.reply({ content: "❌ You have already setup the counting system.", ephemeral: true });
      } else {
        const channel = options.getChannel('channel');
        await counting.create({
          Guild: guild.id,
          Channel: channel.id,
          Number: 1
        });

        const embed = new EmbedBuilder()
        .setColor(color.default)
        .setDescription(`✅ The counting system has been setup! Go to ${channel} amd start at number 1!`);

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } else if (subcommand === "disable") {
      if (!data) {
        return await interaction.reply({ content: "❌ You don't have a counting system setup yet.", ephemeral: true });
      } else {
        await counting.deleteOne({
          Guild: guild.id,
        });

        const embed1 = new EmbedBuilder()
        .setColor(color.default)
        .setDescription('✅ The counting system has been disabled for this server.');

        await interaction.reply({ embeds: [embed1], ephemeral: true });
      }
    }
  },
};