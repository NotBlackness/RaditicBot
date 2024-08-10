const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { color } = require('../../config');

module.exports = {
    name: 'steal',
    description: 'Steal an emoji or sticker for your server.',
    usage: 'steal <emoji/sticker> [name]',

    async execute({msg, args}) {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
            return msg.reply('You do not have the permissions to use this command!');
        }

        let emojiOrSticker = args[0] ? args[0].trim() : null;
        const replyMessage = msg.reference ? await msg.channel.messages.fetch(msg.reference.messageId) : null;
        const name = args[1] || null;

        if (!emojiOrSticker && !replyMessage) {
            return msg.reply('Please provide an emoji, sticker, or reply to a message containing one.');
        }

        if (!emojiOrSticker && replyMessage) {
            // If no emoji/sticker is provided, check the replied message
            const emojiMatch = replyMessage.content.match(/<a?:\w+:\d{15,}>/);
            const sticker = replyMessage.stickers.first();

            if (emojiMatch) {
                emojiOrSticker = emojiMatch[0];
            } else if (sticker) {
                emojiOrSticker = sticker.url;
            } else {
                return msg.reply('The replied message does not contain a valid emoji or sticker.');
            }
        }

        if (emojiOrSticker.startsWith('<') && emojiOrSticker.endsWith('>')) {
            // Handle custom emoji
            const id = emojiOrSticker.match(/\d{15,}/g)[0];
            const type = await axios.get(`https://cdn.discordapp.com/emojis/${id}.gif`)
                .then(() => "gif")
                .catch(() => "png");

            const emojiURL = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`;
            const defaultNameMatch = emojiOrSticker.match(/:([^:]+):/);
            const defaultName = defaultNameMatch ? defaultNameMatch[1] : 'default';

            try {
                const addedEmoji = await msg.guild.emojis.create({ attachment: emojiURL, name: name || defaultName });

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
        } else if (emojiOrSticker.startsWith('http')) {
            // Handle stickers
            try {
                const response = await axios.get(emojiOrSticker, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data, 'binary');
                const addedSticker = await msg.guild.stickers.create(buffer, name || 'sticker');

                const embed = new EmbedBuilder()
                    .setColor(color.default)
                    .setDescription(`Added sticker **${name || 'sticker'}** successfully.`);

                await msg.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Failed to create sticker:', error);
                await msg.reply('Failed to create sticker. Please try again later.');
            }
        } else {
            return msg.reply(`You can't steal a basic emoticon or an invalid sticker!`);
        }
    },
};