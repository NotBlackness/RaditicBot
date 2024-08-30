module.exports = {
  usage: 'ping',
  name: 'ping',
  description: 'Shows the bot\'s ping.',
  async execute({ msg }) {
    // Send the initial reply and wait for the reply message object
    const sent = await msg.reply({ content: "Pinging... 🏓" });

    // Calculate the ping
    const ping = sent.createdTimestamp - msg.createdTimestamp;

    // Edit the reply to show the ping
    await sent.edit(`🏓 | Pong! **${ping}**ms.`);
  },
};