const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Shows the bot\'s ping.'),
  async execute({ interaction }) {
    // Send the initial reply and wait for the reply message object
    const sent = await interaction.reply({ content: "Pinging... 🏓", fetchReply: true });

    // Calculate the ping
    const ping = sent.createdTimestamp - interaction.createdTimestamp;

    // Edit the reply to show the ping
    await interaction.editReply(`🏓 | Pong! **${ping}**ms.`);
  },
};