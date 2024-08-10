const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { color } = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('steal')
        .setDescription('Steal an emoji for your server.')
        .addStringOption(option => 
            option.setName('emoji')
                .setDescription('The emoji you want to steal')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('name')
                .setDescription('The name you want to give to the stolen emoji.')
                .setRequired(false)), // Name is now optional

    async execute({interaction}) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
            return interaction.reply({ content: 'You do not have the permissions to use this command!', ephemeral: true });
        }

        let emoji = interaction.options.getString('emoji')?.trim();
        let name = interaction.options.getString('name') || null; // Default to null if not provided

        // Extract the default name from the emoji string
        if (emoji.startsWith('<') && emoji.endsWith('>')) {
            const id = emoji.match(/\d{15,}/g)[0];
            const type = await axios.get(`https://cdn.discordapp.com/emojis/${id}.gif`)
                .then(() => "gif")
                .catch(() => "png");

            emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`;

            // Extract the emoji name from the input
            if (!name) {
                name = emoji.match(/:([^:]+):/)[1];
            }
        }

        if (!emoji.startsWith('http')) {
            return interaction.reply({ content: `You can't steal a basic emoticon!`, ephemeral: true });
        }

        try {
            const addedEmoji = await interaction.guild.emojis.create({ attachment: emoji, name: name });

            const embed = new EmbedBuilder()
                .setColor(color.default)
                .setDescription(`Added ${addedEmoji} **successfully**, with the name: **${addedEmoji.name}**.`);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            if (error.message.includes('Maximum number of emojis reached')) {
                await interaction.reply({ content: 'The server emoji slot is full. Delete some emojis to add new ones.', ephemeral: true });
            } else {
                console.error('Failed to create emoji:', error);
                await interaction.reply({ content: 'Failed to create emoji. Please try again later.', ephemeral: true });
            }
        }
    },
};