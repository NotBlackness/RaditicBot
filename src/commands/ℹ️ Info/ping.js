module.exports = {
  usage: 'ping',
  name: 'ping',
  description: 'Shows the bot\'s ping.',
  async execute({msg}) {
    const sent = msg.reply({ content: "Pinging... 🏓", fetchReply: true });
    const ping = sent.createdTimestamp - msg.createdTimestamp;
    sent.editReply(`🏓 | Pong! **${ping}**ms.`);
  },
};