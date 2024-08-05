const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const { color, emoji } = require('../../config.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server-info')
    .setDescription('Displays detailed information about the server.'),

  async execute({interaction}) {
    const guild = interaction.guild;
    const owner = await guild.members.fetch(guild.ownerId);
    const ownerId = guild.ownerId;
    const ownerNickname = owner.nickname || 'None';
    const displayName = owner.displayName || 'None';
    const boostCount = guild.premiumSubscriptionCount;
    const boostTier = guild.premiumTier;
    const guildName = guild.name;
    const guildId = guild.id;
    const guildDescription = guild.description || 'None';

    // Fetch all channels
    const channels = await guild.channels.fetch();

    const textChannelCount = channels.filter(channel => channel.type === ChannelType.GuildText).size;
    const voiceChannelCount = channels.filter(channel => channel.type === ChannelType.GuildVoice).size;
    const totalChannelCount = channels.size;
    const roleCount = guild.roles.cache.size;
    const categoriesCount = channels.filter(channel => channel.type === ChannelType.GuildCategory).size;

    const serverInfoEmbed = new EmbedBuilder()
      .setTitle(`${emoji.info} Server Information`)
      .addFields(
        { name: 'Owner Info', value: `Owner: <@${ownerId}>\nID: ${ownerId}\nNickname: ${ownerNickname}\nDisplay Name: ${displayName}`, inline: false },
        { name: 'Server Info', value: `Name: ${guildName}\nID: ${guildId}\nDescription: ${guildDescription}\nRole Count: **${roleCount}**`, inline: false },
        { name: 'Boosts Info', value: `Boost Count: **${boostCount}**\nBoost Tier: **${boostTier}**`, inline: false },
        { name: 'Channels and Categories Info', value: `Total Channels: **${totalChannelCount}**\nText Channels: **${textChannelCount}**\nVoice Channels: **${voiceChannelCount}**\nCategories: **${categoriesCount}**`, inline: false },
      )
      .setColor(color.default)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

    interaction.reply({ embeds: [serverInfoEmbed] });
  },
};