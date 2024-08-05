const { getPrefix } = require('../../config');

module.exports = {
  usage: 'ping',
  name: 'ping',
  description: 'Shows the bot\'s ping.',
  async execute({msg, client}) {
    msg.reply(`🏓 | Pong! **${Date.now() - msg.createdTimestamp}**ms.`);
  },
};