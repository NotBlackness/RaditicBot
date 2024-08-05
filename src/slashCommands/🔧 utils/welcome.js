const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ChannelType } = require('discord.js');
const welcomeSchema = require('../../Schemas/welcomeSchema');
const axios = require('axios');
const { color } = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Manage welcome system.')
        .addSubcommand(subcommand => {
            return subcommand
                .setName('setup')
                .setDescription('Setup welcome system.')
                .addStringOption(option => {
                    return option
                        .setName('message')
                        .setDescription('The custom message bot will send when a user joins. Type /welcome variables to see the variables.')
                        .setRequired(true)
                })
                .addChannelOption(option => {
                    return option
                        .setName('channel')
                        .setDescription('The channel where the welcome message will be sent.')
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                        .setRequired(true)                 
                })
                .addBooleanOption(option => {
                    return option
                        .setName('embed')
                        .setDescription('Whether to send the welcome message as an embed or not.')
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
                        .setDescription('Footer text of the embed message.')
                        .setRequired(false)
                })
        })
        .addSubcommand(subcommand => {
            return subcommand
                .setName('disable')
                .setDescription('Disable welcome system.')
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
            if (!options) return interaction.editReply({ content: "No options provided." });

            const welcomeMessage = options.getString('message');
            const channelId = options.getChannel('channel').id;
            const guildId = interaction.guild.id;

            const embedOption = options.getBoolean('embed');
            const embedTitle = options.getString('title');
            const embedColor = options.getString('color');
            const thumbnailUrl = options.getString('thumbnail');
            const bannerUrl = options.getString('banner');
            const footerText = options.getString('footer');

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

            let data = await welcomeSchema.findOne({ guildId: guildId });
            if (!data) {
                data = await welcomeSchema.create({
                    guildId: guildId,
                    welcomeMessage: welcomeMessage,
                    channelId: channelId,
                    embedOption: embedOption,
                    embedTitle: embedTitle,
                    embedColor: embedColor,
                    thumbnailUrl: thumbnailUrl,
                    bannerUrl: bannerUrl,
                    footerText: footerText
                });
            } else {
                await welcomeSchema.findOneAndUpdate({ guildId: guildId }, {
                    welcomeMessage: welcomeMessage,
                    channelId: channelId,
                    embedOption: embedOption,
                    embedTitle: embedTitle,
                    embedColor: embedColor,
                    thumbnailUrl: thumbnailUrl,
                    bannerUrl: bannerUrl,
                    footerText: footerText
                });
            }

            await interaction.editReply(`Welcome message set successfully!\nCustom message: ${welcomeMessage}\nWelcome message will be sent in <#${channelId}>`);
        } else if (subcommand === 'disable') {
            await interaction.deferReply({ ephemeral: true });

            await welcomeSchema.findOneAndDelete({ guildId: interaction.guild.id });
            await interaction.editReply('Welcome system disabled successfully!');
        } else if (subcommand === 'variables') {
            const variablesEmbed = new EmbedBuilder()
                .setTitle('Variables for Custom Welcome Message')
                .setDescription('Here are the variables that can be used in the custom welcome message:')
                .addFields(
                    { name: '{userMention}', value: 'Mentions the user', inline: false },
                    { name: '{userName}', value: 'Displays the user\'s username', inline: false },
                    { name: '{guildName}', value: 'Displays the server\'s name', inline: false },
                    { name: '{memberCount}', value: 'Displays the member count of the server', inline: false }
                )
                .setColor(color.default);

            await interaction.reply({ embeds: [variablesEmbed], ephemeral: true });
        }
    }
};