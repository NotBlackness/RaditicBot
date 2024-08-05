// Import necessary modules
const { PermissionsBitField } = require('discord.js');

module.exports = {
  usage: 'unban <user_id> / <username>',
  name: 'unban',
  description: 'Unban a user from the server.',
  async execute({ msg, args }) {
    // Check if the user has the necessary permissions
    if (!msg.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return msg.reply('❌ | You do not have permission to unban users.');
    }

    // Check if the bot has the necessary permissions
    if (!msg.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return msg.reply("❌ | I don't have permission to unban users.");
    }

    // Check if a user ID or username was provided
    let user = args[0];
    if (!user) {
      return msg.reply('❌ | Please provide a valid ID or username of a banned user to unban.');
    }

    // Check if the user is mentioned
    if (user.startsWith('<@') && user.endsWith('>')) {
      // Extract user ID from mention
      user = user.slice(3, -1);

      // Check if the extracted value is a valid user ID
      if (isNaN(user)) {
        return msg.reply('❌ | Please provide a valid ID or username of a banned user to unban.');
      }
    }

    // Attempt to unban the user
    try {
      const bans = await msg.guild.bans.fetch();

      const bannedUser = bans.find(ban => {
        // Check if the provided argument matches the username or ID of a banned user
        return ban.user.id === user || ban.user.username === user;
      });

      if (!bannedUser) {
        return msg.reply('❌ | User not found in the ban list.');
      }

      await msg.guild.members.unban(bannedUser.user.id);
      msg.reply(`✅ | User ${bannedUser.user.tag} has been unbanned.`);
    } catch (error) {
      console.error('Error unbanning user:', error);
      msg.reply('There was an error unbanning the user.');
    }
  },
};