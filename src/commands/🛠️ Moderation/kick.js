const { ownerId } = require('../../config.js');
const { PermissionsBitField } = require('discord.js');

module.exports = {
  usage: 'kick <@user> / <username> / <user_id> [reason]',
  name: 'kick',
  description: 'Kick a user from the server',
  async execute({ args, msg }) {

    if (!msg.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return msg.reply('❌ | You do not have permission to kick users.');
    }

    if (!msg.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return msg.reply("❌ | I don't have permission to kick users.");
    }

    if (!args[0]) {
      return msg.reply('Please provide a user to kick.');
    }

    let user;
    const input = args[0].replace(/[<@!>]/g, '');

    // Check if the first argument is a mention
    if (msg.mentions.users.size) {
      user = msg.guild.members.cache.get(input);
    } else {
      // Try to find the user by username or ID
      if (input.match(/^\d{17,19}$/)) {
        user = await msg.guild.members.fetch(input).catch(() => null);
      } else {
        user = msg.guild.members.cache.find(member => member.user.username.toLowerCase() === input.toLowerCase());
      }
    }

    if (!user) {
      return msg.reply('Please provide a valid user to kick!');
    }

    const member = msg.guild.members.cache.get(user.id);

    if (!member) {
      return msg.reply('That user is not in this server!');
    }

    if (!member.kickable) {
      return msg.reply("❌ | I cannot kick this user!\nPossibilities:\nMy role position is not above the user role position.");
    }

    if (msg.guild.ownerId === member.id) {
      return msg.reply("You can't kick the server owner!");
    }

    if (msg.author.id === member.id) {
      return msg.reply("You can't kick yourself!");
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';
    member.kick(reason)
      .then(() => msg.reply(`Successfully kicked ${user.user.tag}, Reason: ${reason}`))
      .catch(error => {
        console.error('Error kicking user:', error);
        msg.reply('An error occurred while trying to kick the user.');
      });
  },
};