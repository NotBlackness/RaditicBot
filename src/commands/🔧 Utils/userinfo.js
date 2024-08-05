const { EmbedBuilder } = require('discord.js');
const { color } = require('../../config');

module.exports = {
  usage: 'userinfo [<@user>]',
  name: 'userinfo',
  aliases: ['user-info', 'user-information', 'whois', 'who-is', 'ui', 'wi'],
  description: 'Shows some information about the user.',
  async execute({ msg, args }) {
    let user;
    if (args.length > 0) {
      const replacedArg = args[0].replace(/[<@!>]/g, '');
      user = await msg.guild.members.fetch(replacedArg).catch(() => null);
    }

    // Fallback to the message author if no user found or no arguments provided
    if (!user) {
      user = msg.author;
    } else {
      user = user.user;  // Get the user object from the fetched member
    }

    const member = await msg.guild.members.fetch(user.id);
    const icon = user.displayAvatarURL();
    const tag = user.tag;

    // Handling roles
    const roles = member.roles.cache.map(r => r.toString());
    const maxRolesToShow = 40;
    const remainingRolesCount = roles.length > maxRolesToShow ? roles.length - maxRolesToShow : 0;
    const rolesToShow = roles.slice(0, maxRolesToShow).join(', ') + (remainingRolesCount > 0 ? ` and ${remainingRolesCount}+ more` : '');

    const embed = new EmbedBuilder()
      .setColor(color.default)
      .setAuthor({ name: tag, iconURL: icon })
      .setThumbnail(icon)
      .addFields(
        { name: 'Member', value: `${user}`, inline: false },
        { name: 'Username', value: `${user.username}`, inline: false },
        { name: 'DisplayName', value: `${user.displayName}`, inline: false },
        { name: 'Roles', value: `${rolesToShow}`, inline: false },
        { name: 'Joined Server', value: `<t:${parseInt(member.joinedAt / 1000)}:R>`, inline: true },
        { name: 'Joined Discord', value: `<t:${parseInt(user.createdAt / 1000)}:R>`, inline: true }
      )
      .setFooter({ text: `User ID: ${user.id}` })
      .setTimestamp();

    await msg.reply({ embeds: [embed] });
  },
};