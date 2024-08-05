const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { default: axios } = require('axios');
const { color } = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('steal')
        .setDescription('Steal an emoji for your server.')
        .addStringOption(option => option.setName('emoji').setDescription('The emoji you want to steal').setRequired(true))
        .addStringOption(option => option.setName('name').setDescription('Name you want to give to the stolen emoticon.').setRequired(true)),
    async execute({ interaction }) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) 
            return interaction.reply({ content: `You do not have the permissions to use this command!`, ephemeral: true });

        let emoji = interaction.options.getString('emoji')?.trim();
        const name = interaction.options.getString('name');

        if (emoji.startsWith('<') && emoji.endsWith('>')) {
            const id = emoji.match(/\d{15,}/g)[0];

            const type = await axios.get(`https://cdn.discordapp.com/emojis/${id}.gif`).then(image => {
                if (image) return "gif"
                else return "png"
            }).catch(err => {
                return "png"
            })

            emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`
        }

        if (emoji.startsWith('<a') && emoji.endsWith('>')) {
            const id = emoji.match(/\d{15,}/g)[0];
            const type = await axios.get(`https://cdn.discordapp.com/emojis/${id}.gif`).then(image => {
                if (image) return "png"
                else return "gif"
            }).catch(err => {
                return "gif"
            })

            emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`

        }

        if (!emoji.startsWith('http')) {
            return interaction.reply({ content: `You can't steal a basic emoticon!`, ephemeral: true });
        }

        if (!emoji.startsWith('https')) {
            return interaction.reply({ content: `You can't steal a basic emoticon!`, ephemeral: true });
        }

        interaction.guild.emojis.create({ attachment: `${emoji}`, name: `${name}` })
            .then(emoji => {
                const embed = new EmbedBuilder()
                    .setColor(`${color.default}`)
                    .setDescription(`Added ${emoji} **successfully**, with the name: **${name}**.`)

                interaction.reply({ embeds: [embed] }).catch(err => {
                    interaction.reply({ content: "Your limit of emojis has run out. Remove some of the emojis from the server and try again!", ephemeral: true })
                })
            })
            .catch(error => {
                console.error('Failed to create emoji:', error);
                interaction.reply({ content: 'Failed to create emoji. Please try again later.', ephemeral: true });
            });
    },
};
