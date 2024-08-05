const { PermissionsBitField } = require('discord.js');

module.exports = {
    usage: 'unlock [<#channel>]',
    name: 'unlock',
    description: 'Unlocks the current channel',
    async execute({ msg }) {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return msg.reply("❌ | You do not have permission to manage channels.");
        }

        if (!msg.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return msg.reply("❌ | I do not have permission to manage channels.");
          }
        
        const channel = msg.mentions.channels.first() || msg.channel;
        const everyoneRole = channel.guild.roles.everyone;

        const currentPermissions = channel.permissionOverwrites.cache.get(everyoneRole.id);

        if (currentPermissions && !currentPermissions.deny.has(PermissionsBitField.Flags.SendMessages)) {
            return msg.reply(`The channel ${channel} is already unlocked.`);
        }

        await channel.permissionOverwrites.edit(everyoneRole, {
            SendMessages: null
        });

        await msg.reply(`🔓 | The channel ${channel} has been unlocked.`);
    },
};