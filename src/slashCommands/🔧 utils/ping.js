const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Shows the bot\'s ping.'),
  async execute({interaction}) {
    const sent = interaction.reply({ content: "Pinging... 🏓", fetchReply: true });
    const ping = sent.createdTimestamp - interaction.createdTimestamp; 
    msg.editReply(`🏓 | Pong! **${ping}**ms.`);
  },
};