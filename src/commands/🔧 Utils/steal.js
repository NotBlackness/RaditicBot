const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { color } = require('../../config');

module.exports = {
    name: 'steal',
    description: 'Steal an emoji for your server.',
    usage: 'steal <emoji> [name]',

    async execute({msg, args}) {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
            return msg.reply('You do not have the permissions to use this command!');
        }

        let emoji = args[0]?.trim();
        const name = args[1] || null;

        if (!emoji) {
            return msg.reply('Please provide an emoji to steal.');
        }

        if (emoji.startsWith('<') && emoji.endsWith('>')) {
            const id = emoji.match(/\d{15,}/g)[0];
            const type = await axios.get(`https://cdn.discordapp.com/emojis/${id}.gif`)
                .then(() => "gif")
                .catch(() => "png");

            emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`;

            const defaultNameMatch = emoji.match(/:(\w+):/);
            const defaultName = defaultNameMatch ? defaultNameMatch[1] : 'default';

            try {
                const addedEmoji = await msg.guild.emojis.create({ attachment: emoji, name: name || defaultName });

                const embed = new EmbedBuilder()
                    .setColor(color.default)
                    .setDescription(`Added ${addedEmoji} **successfully**, with the name: **${addedEmoji.name}**.`);

                await msg.reply({ embeds: [embed] });
            } catch (error) {
                if (error.message.includes('Maximum number of emojis reached')) {
                    await msg.reply('The server emoji slot is full. Delete some emojis to add new ones.');
                } else {
                    console.error('Failed to create emoji:', error);
                    await msg.reply('Failed to create emoji. Please try again later.');
                }
            }
        } else if (!emoji.startsWith('http')) {
            return msg.reply(`You can't steal a basic emoticon!`);
        } else {
            return msg.reply('The provided emoji is not valid or cannot be stolen.');
        }
    },
};