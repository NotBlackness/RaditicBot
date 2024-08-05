// Import necessary modules
const { PermissionsBitField } = require('discord.js');

module.exports = {
  usage: 'ban <@user> / <user_id> / <username> [reason]',
  name: 'ban',
  description: 'Ban a user from the server.',
  async execute({ msg, args }) {
    try {
      // Check if the user has the necessary permissions
      if (!msg.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return msg.reply("❌ | You don't have permissions to ban users.");
      }

      if (!msg.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return msg.reply("❌ | I don't have permission to ban users.");
      }
      
      // Check if args[0] exists
      if (!args[0]) {
        return msg.reply('Please provide a valid user by @mention, username, or user ID.');
      }

      // Check if a user was mentioned
      const replacedArg = args[0].replace(/[<@!>]/g, '');
      const user = msg.guild.members.cache.get(replacedArg);

      // If no mention, try to find by username or user ID
      if (!user) {
        const input = args[0];

        // Check if the input is a user ID
        if (input.match(/^\d{17,19}$/)) {
          user = await msg.guild.members.fetch(input).catch(() => null);
        } else {
          // Find by username
          user = msg.guild.members.cache.find(member => member.user.username.toLowerCase() === input.toLowerCase());
        }

        if (!user) {
          return msg.reply('User not found. Please provide a valid user by @mention, username, or user ID.');
        }
      }

      // Check if the user is the guild owner
      if (msg.guild.ownerId === user.id) {
        return msg.reply("❌ | You can't ban the owner of this server!");
      }

      // Get the ban reason
      const reason = args.slice(1).join(' ') || 'No reason provided';

      if (!user.bannable) {
        return msg.reply("❌ | I cannot ban this user!\nPossibilities:\nMy role position is not above the user role position.");
      }

      // Ban the user
      await user.ban({ reason })
        .then(() => {
          msg.channel.send(`✅ | The user ${user.user.tag} (${user.id}) has been banned from this server. Reason: ${reason}`);
          user.send(`You are banned from **${msg.guild.name}**. Reason: **${reason}**`).catch(() => null);
        })
        .catch(error => {
          console.error('Error banning user:', error);
          msg.reply('There was an error banning the user.');
        });
    } catch (error) {
      console.error('Error banning user:', error);
      msg.reply('There was an error banning the user.');
    }
  },
};