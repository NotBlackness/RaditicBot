const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ChannelType } = require('discord.js');
const leaveSchema = require('../../Schemas/leaveSchema');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Manage leave system.')
        .addSubcommand(subcommand => {
            return subcommand
                .setName('setup')
                .setDescription('Setup leave system.')
                .addStringOption(option => {
                    return option
                        .setName('message')
                        .setDescription('The custom message bot will send when a user leaves. Type /leave variables to see the variables.')
                        .setRequired(true)
                })
                .addChannelOption(option => {
                    return option
                        .setName('channel')
                        .setDescription('The channel where the leave message will be sent.')
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                        .setRequired(true)
                })
                .addBooleanOption(option => {
                    return option
                        .setName('embed')
                        .setDescription('Whether to send the leave message as an embed or not.')
                        .setRequired(false)
                })
                .addStringOption(option => {
                    return option
                        .setName('title')
                        .setDescription('Title of the embed message.')
                        .setRequired(false)
                })
                .addStringOption(option => {
                    return option
                        .setName('color')
                        .setDescription('Color of the embed message.')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Red', value: 'Red' },
                            { name: 'Blue', value: 'Blue' },
                            { name: 'Green', value: 'Green' },
                            { name: 'Yellow', value: 'Yellow' },
                            { name: 'Purple', value: 'Purple' },
                            { name: 'Pink', value: 'DarkVividPink' },
                            { name: 'Orange', value: 'Orange' },
                            { name: 'White', value: 'White' },
                            { name: 'Gray', value: 'Gray' }
                        )
                })
                .addStringOption(option => {
                    return option
                        .setName('thumbnail')
                        .setDescription('URL of the thumbnail image for the embed.')
                        .setRequired(false)
                })
                .addStringOption(option => {
                    return option
                        .setName('banner')
                        .setDescription('URL of the banner image for the embed.')
                        .setRequired(false)
                })
                .addStringOption(option => {
                    return option
                        .setName('footer')
                        .setDescription('Footer text for the embed.')
                        .setRequired(false)
                });
        })
        .addSubcommand(subcommand => {
            return subcommand
                .setName('disable')
                .setDescription('Disable leave system.')
        })
        .addSubcommand(subcommand => {
            return subcommand
                .setName('variables')
                .setDescription('See the variables of custom message.')
        }),
    async execute({ interaction }) {
        const subcommand = interaction.options?.getSubcommand();

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "You need the `Administrator` permission to use this command.", ephemeral: true });
        }

        if (subcommand === 'setup') {
            await interaction.deferReply({ ephemeral: true });
            const options = interaction.options;
            if (!options) return interaction.editReply({ content: "No options provided.", ephemeral: true });

            const leaveMessage = options.getString('message');
            const channelId = options.getChannel('channel').id;
            const guildId = interaction.guild.id;

            const embedOption = options.getBoolean('embed');
            const embedTitle = options.getString('title');
            const embedColor = options.getString('color');
            const thumbnailUrl = options.getString('thumbnail');
            const bannerUrl = options.getString('banner');
            const footerText = options.getString('footer');

            // Check if URLs are valid
                const isValidUrl = async (url) => {
                    try {
                        await axios.get(url);
                        return true;
                    } catch {
                        return false;
                    }
                };

                if (thumbnailUrl && !await isValidUrl(thumbnailUrl)) {
                    return interaction.editReply({ content: "Invalid thumbnail URL provided." });
                }

                if (bannerUrl && !await isValidUrl(bannerUrl)) {
                    return interaction.editReply({ content: "Invalid banner URL provided." });
            }

            let data = await leaveSchema.findOne({ guildId: guildId });
            if (!data) {
                data = await leaveSchema.create({
                    guildId: guildId,
                    leaveMessage: leaveMessage,
                    channelId: channelId,
                    embedOption: embedOption,
                    embedTitle: embedTitle,
                    embedColor: embedColor,
                    thumbnailUrl: thumbnailUrl,
                    bannerUrl: bannerUrl,
                    footerText: footerText
                });
            } else {
                await leaveSchema.findOneAndUpdate({ guildId: guildId }, {
                    leaveMessage: leaveMessage,
                    channelId: channelId,
                    embedOption: embedOption,
                    embedTitle: embedTitle,
                    embedColor: embedColor,
                    thumbnailUrl: thumbnailUrl,
                    bannerUrl: bannerUrl,
                    footerText: footerText
                });
            }

            await interaction.editReply(`Leave message set successfully!\nCustom message: ${leaveMessage}\nLeave message will be sent in <#${channelId}>`);
        } else if (subcommand === 'disable') {
            await interaction.deferReply({ ephemeral: true }); 
            await leaveSchema.findOneAndDelete({ guildId: interaction.guild.id });
            await interaction.editReply('Leave system disabled successfully!');
        } else if (subcommand === 'variables') {
            await interaction.deferReply({ ephemeral: true });
            const variablesEmbed = new EmbedBuilder()
                .setTitle('Variables for Custom Leave Message')
                .setDescription('Here are the variables that can be used in the custom leave message:')
                .addFields(
                    { name: '{userMention}', value: 'Mentions the user', inline: true },
                    { name: '{userName}', value: 'Displays the user\'s username', inline: true },
                    { name: '{guildName}', value: 'Displays the server\'s name', inline: true },
                    { name: '{memberCount}', value: 'Displays the member count of the server', inline: true }
                )
                .setColor('#A020F0');

            await interaction.editReply({ embeds: [variablesEmbed], ephemeral: true });
        }
    }
};