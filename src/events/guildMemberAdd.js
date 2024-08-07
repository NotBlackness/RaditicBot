const welcomeSchema = require('../Schemas/welcomeSchema');
const { EmbedBuilder } = require('discord.js');
const client = require(process.cwd() + '/src/index.js');
const { color } = require('../config');
const Autorole = require('../Schemas/autoroleSchema');

client.on("guildMemberAdd", async (member) => {
    const data = await welcomeSchema.findOne({ guildId: member.guild.id });

    if (!data) return;

    const welcomeMessage = data.welcomeMessage || '';
    const channelId = data.channelId;
    const embedOption = data.embedOption;
    const embedTitle = data.embedTitle || 'Welcome!';
    const embedColor = data.embedColor || `${color.default}`;
    const thumbnailUrl = data.thumbnailUrl;
    const bannerUrl = data.bannerUrl;
    const footerTxt = data.footerText || '';

    const guild = member.guild;
    const channel = guild.channels.cache.get(channelId);
    await guild.members.fetch();

    if (!channel) return;

    try {
        let messageToSend = welcomeMessage
            .replace(/{userMention}/g, `<@${member.id}>`)
            .replace(/{userName}/g, member.user.username)
            .replace(/{guildName}/g, member.guild.name)
            .replace(/{memberCount}/g, `${guild.memberCount}`);

        let titleToPut = embedTitle
            .replace(/{userMention}/g, `<@${member.id}>`)
            .replace(/{userName}/g, member.user.username)
            .replace(/{guildName}/g, member.guild.name)
            .replace(/{memberCount}/g, `${guild.memberCount}`);

        let footerText = footerTxt
            .replace(/{userMention}/g, `<@${member.id}>`)
            .replace(/{userName}/g, member.user.username)
            .replace(/{guildName}/g, member.guild.name)
            .replace(/{memberCount}/g, `${guild.memberCount}`);

        if (embedOption) {
            const embed = new EmbedBuilder()
                .setTitle(titleToPut)
                .setDescription(messageToSend)
                .setColor(embedColor);

            if (thumbnailUrl) embed.setThumbnail(thumbnailUrl);
            if (bannerUrl) embed.setImage(bannerUrl);
            if (footerText) embed.setFooter({ text: footerText });

            channel.send({ content: `<@${member.id}>`, embeds: [embed] });
        } else {
            channel.send(messageToSend);
        }
    } catch (e) {
        channel.send('An error occurred while sending the welcome message.');
        console.error(e);
    }

    // Autorole system
    try {
        const guildId = member.guild.id;
        const autoroleData = await Autorole.findOne({ guildId });

        if (!autoroleData || autoroleData.roles.length === 0) return;

        for (const roleId of autoroleData.roles) {
            const role = member.guild.roles.cache.get(roleId);
            if (role) {
                await member.roles.add(role);
                console.log(`Added role ${role.name} (${role.id}) to ${member.user.tag}`);
            } else {
                console.log(`Role with ID ${roleId} not found in guild ${guildId}`);
            }
        }
    } catch (error) {
        console.error(`Error adding autoroles: ${error}`);
    }
});