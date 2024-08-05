const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: "server-icon",
  aliases: ["sic"],
  description: 'See the server icon',
  async execute({msg}) {
    const guild = msg.guild;

    const link = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setLabel('Avatar Link')
            .setURL(guild.iconURL({ format: "png" }))
            .setStyle(ButtonStyle.Link)
    );

    const embed = new EmbedBuilder()
    .setTitle(`Server icon of: **${guild.name}**`)
    .setImage(guild.iconURL({ format: "png" }))
    .setTimestamp();

    await msg.reply({ embeds: [embed], components: [link] });
  }
}