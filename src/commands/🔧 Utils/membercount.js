const { EmbedBuilder } = require('discord.js');
const { color } = require('../../config');

module.exports = {
    usage: 'membercount',
    name: 'membercount',
    aliases: ['mc'],
    description: 'Displays the member count of the server.',
    async execute({ msg }) {
        const guild = msg.guild;
        if (!guild) {
            return await msg.reply('Guild information not available.');
        }

        // Ensure guild's memberCount is available
        await guild.members.fetch();

        const memberCount = guild.memberCount;
        const botCount = guild.members.cache.filter(member => member.user.bot).size;
        const onlineCount = guild.members.cache.filter(member => (member.presence && member.presence.status === 'online') || (member.user.bot && member.presence && member.presence.status === 'online')).size;
        const offlineCount = guild.members.cache.filter(member => (member.presence && member.presence.status === 'offline') || (member.user.bot && (!member.presence || member.presence.status === 'offline'))).size;
        const dndCount = guild.members.cache.filter(member => (member.presence && member.presence.status === 'dnd') || (member.user.bot && member.presence && member.presence.status === 'dnd')).size;

        const embed = new EmbedBuilder()
            .setColor(`${color.default}`)
            .setTitle('Member Count')
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL({ dynamic: true }),
            })
            .addFields(
                { name: 'Total Member(s):', value: `**${memberCount}**`, inline: false },
                { name: 'Bot(s):', value: `${botCount}`, inline: false },
                { name: 'Online:', value: `**${onlineCount}**`, inline: false },
                { name: 'Offline:', value: `**${offlineCount}**`, inline: false },
                { name: 'Do Not Disturb:', value: `**${dndCount}**`, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: `Requested by ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL() });

        await msg.reply({ embeds: [embed] });
    }
};