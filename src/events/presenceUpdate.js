const { EmbedBuilder, ChannelType } = require('discord.js');
const Vanity = require('../Schemas/vanitySchema');
const client = require(process.cwd() + '/src/index.js');
const { color } = require('../config')
client.on('presenceUpdate', async (oldPresence, newPresence) => {
    const guildId = newPresence.guild.id;
    const settings = await Vanity.findOne({ guildId });

    if (!settings) return;

    const { vanities } = settings;
    const member = newPresence.member;

    for (const { vanity, channelId, roleId } of vanities) {
        const hasVanity = newPresence.activities.some(activity => activity.state && activity.state.includes(vanity));
        const hadVanity = oldPresence && oldPresence.activities.some(activity => activity.state && activity.state.includes(vanity));
        const role = member.guild.roles.cache.get(roleId);
        const channelToSend = member.guild.channels.cache.get(channelId);

        if (hasVanity && !hadVanity) {
            // Add role if the vanity URL is present in the status
            if (role) {
                await member.roles.add(role);
            }
            // Send a message to the channel if the vanity URL is present in the status
            if (channelToSend && channelToSend.type === ChannelType.GuildText) {
                const embed = new EmbedBuilder()
                    .setDescription(`${member} has added **${vanity}** in their status and received the role ${role}.`)
                    .setAuthor({ iconURL: member.guild.iconURL(), name: member.guild.name })
                    .setColor(color.green)
                    .setTimestamp();

                await channelToSend.send({ embeds: [embed] });
            }
        } else if (!hasVanity && hadVanity) {
            // Remove role if the vanity URL is no longer present in the status
            if (role) {
                await member.roles.remove(role);
            }
            // Send a message to the channel if the vanity URL is no longer present in the status
            if (channelToSend && channelToSend.type === ChannelType.GuildText) {
                const embed = new EmbedBuilder()
                    .setDescription(`${member} has removed ${vanity} from their status and has lost the role ${role}.`)
                    .setAuthor({ iconURL: member.guild.iconURL(), name: member.guild.name })
                    .setColor(color.red)
                    .setTimestamp();

                await channelToSend.send({ embeds: [embed] });
            }
        }
    }
});