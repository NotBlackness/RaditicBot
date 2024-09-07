const { ownerId } = require('../../config.js');
const { PermissionsBitField } = require('discord.js');

module.exports = {
  usage: 'kick <@user> / <username> / <user_id> [reason]',
  name: 'kick',
  description: 'Kick a user from the server',
  async execute({ args, msg }) {

    // Check if the command issuer has permission to kick members
    if (!msg.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return msg.reply('❌ | You do not have permission to kick users.');
    }

    // Check if the bot has permission to kick members
    if (!msg.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return msg.reply("❌ | I don't have permission to kick users.");
    }

    // Check if a user was provided
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

    // Check if the user was found
    if (!user) {
      return msg.reply('Please provide a valid user to kick!');
    }

    const member = msg.guild.members.cache.get(user.id);

    // Check if the member is in the server
    if (!member) {
      return msg.reply('That user is not in this server!');
    }

    // Check if the bot can kick the member
    if (!member.kickable) {
      return msg.reply("❌ | I cannot kick this user!\nPossibilities:\nMy role position is not above the user role position.");
    }

    // Check if the member is the server owner
    if (msg.guild.ownerId === member.id) {
      return msg.reply("❌ | You can't kick the server owner!");
    }

    // Check if the user is trying to kick themselves
    if (msg.author.id === member.id) {
      return msg.reply("❌ | You can't kick yourself!");
    }

    // Check if the bot's highest role is above the user's highest role
    if (msg.guild.members.me.roles.highest.position <= member.roles.highest.position) {
      return msg.reply("❌ | I cannot kick this user because my role is not high enough in the role hierarchy.");
    }

    // Check if the user has powerful permissions (all three: Administrator, Manage Guild, Manage Roles)
    if (
      member.permissions.has(PermissionsBitField.Flags.Administrator) && 
      member.permissions.has(PermissionsBitField.Flags.ManageGuild) && 
      member.permissions.has(PermissionsBitField.Flags.ManageRoles)
    ) {
      return msg.reply("❌ | I cannot kick this user due to their high permissions (Administrator, Manage Guild, and Manage Roles) as a security measure.");
    }

    // Get the reason for the kick
    const reason = args.slice(1).join(' ') || 'No reason provided';

    // Kick the member
    member.kick(reason)
      .then(() => msg.reply(`✅ | Successfully kicked ${user.user.tag}. Reason: ${reason}`))
      .catch(error => {
        console.error('Error kicking user:', error);
        msg.reply('An error occurred while trying to kick the user.');
      });
  },
};