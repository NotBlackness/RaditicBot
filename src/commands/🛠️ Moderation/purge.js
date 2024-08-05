const { PermissionsBitField } = require('discord.js');

module.exports = {
  usage: 'purge <amount> / <all>',
  name: 'purge',
  description: 'Delete a specified number of messages (between 1 and 100), or all messages if "purge all" is specified.',
  async execute({ msg, args }) {
    // Check if the user has the ManageMessages permission
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return msg.reply('❌ | You need the `ManageMessages` permission to use this command.');
    }

    // Check if the bot has the ManageMessages permission
    if (!msg.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return msg.reply('❌ | I need the `ManageMessages` permission to use this command.');
    }

    let amount;
    if (args[0] && args[0].toLowerCase() === 'all') {
      amount = 100;
    } else {
      amount = parseInt(args[0]);
      if (isNaN(amount) || amount <= 0 || amount > 100) {
        return msg.reply('Please provide a number between 1 and 100, or specify "purge all" to delete up to 100 messages.');
      }
    }

    try {
      const now = Date.now();
      let fetched = await msg.channel.messages.fetch({ limit: amount });

      // Filter out the command message itself and messages older than 14 days
      fetched = fetched.filter(m => now - m.createdTimestamp < 14 * 24 * 60 * 60 * 1000 && m.id !== msg.id);

      if (fetched.size === 0) {
        return msg.reply("I can't delete messages that are older than 14 days.").then((reply1) => {
          setTimeout(() => {
            reply1.delete();
          }, 5000);
        });
      }

      await msg.channel.bulkDelete(fetched, true); // `true` filters out messages older than 14 days, but we already did this manually

      const reply = await msg.channel.send(`Successfully purged ${fetched.size} message(s).`);
      setTimeout(() => {
        reply.delete();
      }, 3000);

    } catch (error) {
      console.error(error);
      msg.reply('There was an error purging messages.');
    }
  },
};