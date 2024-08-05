const { ownerIds } = require('../../config.js');

module.exports = {
  usage: 'r.say <message>',
  name: 'say',
  description: 'Say something',
  async execute({ msg, args }) {
    if (!ownerIds.includes(msg.author.id)) return;

    const message = args.join(' '); // Fixed args[0] to args
    if (!message) {
      return msg.reply('Please provide something to say.').then(() => {
        setTimeout(() => {
          msg.delete();
        }, 4000);
      });
    } else {
      msg.delete();
      msg.channel.send(message);
    }
  },
};