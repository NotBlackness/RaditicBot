const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { color } = require('../../config');

module.exports = {
    usage: 'avatar [<@user>]',
    name: 'avatar',
    aliases: ['av'],
    description: 'Get your own avatar or the avatar of another user',
    async execute({ msg, args }) {
        let member;
        if (args.length > 0) {
            const replacedArg = args[0].replace(/[<@!>]/g, '');
            member = await msg.guild.members.fetch(replacedArg).catch(() => null) || msg.author;
        } else {
            member = msg.author;
        }

        const link = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Avatar Link')
                    .setURL(member.user.displayAvatarURL({ format: "png", size: 2048 }))
                    .setStyle(ButtonStyle.Link)
            );

        const avatar = new EmbedBuilder()
            .setDescription(`Avatar of **${member.user.username}**`)
            .setFooter({ text: `${msg.guild.name}`, iconURL: msg.client.user.displayAvatarURL({ dynamic: true }) })
            .setImage(member.user.displayAvatarURL({ format: "png", size: 2048 }))
            .setTimestamp()
            .setColor(`${color.default}`);

        await msg.reply({ embeds: [avatar], components: [link] });
    },
};