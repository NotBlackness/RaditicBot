const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    usage: 'snipe [<#channel>]',
    name: 'snipe',
    description: 'Snipes a message from a channel or the current channel.',
  async execute({ msg, client }) {
    try {
    const channel = msg.channel;
    const snipe = client.snipes.get(channel.id);

    if (!snipe || !snipe.content) {
      return msg.channel.send({ content: 'There is nothing to snipe.', ephemeral: false });
    }
      const elapsed = Date.now() - snipe.timestamp;
      const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
      const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

      let timeString = '';
      if (days > 0) timeString += `${days}days `;
      if (hours > 0) timeString += `${hours}hours `;
      if (minutes > 0) timeString += `${minutes}minutes `;
      if (seconds > 0 && !days && !hours && !minutes) timeString += `${seconds}seconds`;

      if (!timeString) timeString = '0s'; // Show 0s if the time is 0

      // Convert timestamp to Unix format
      const unixTimestamp = Math.floor(snipe.timestamp / 1000);
      // Add the relative time flag 'R'
      const formattedTime = `<t:${unixTimestamp}:R>`;

      const ID = snipe.author.id;
      const member = msg.guild.members.cache.get(ID)
      const URL = member.displayAvatarURL();

      const embed = new EmbedBuilder()
      .setTitle(`in ${channel.name}, ${formattedTime}:`)
      .setAuthor({
        name: snipe.author.tag,
        iconURL: URL,
      })
        .setDescription(`${snipe.content}`)
      .setFooter({text:`Member ID: ${ID}`, iconURL: `${URL}`})
      .setTimestamp(snipe.timestamp)
      if (snipe.image) embed.setImage(snipe.image)
      .setColor('#A020F0');

    await msg.channel.send({ embeds: [embed] });
    } catch (error) {
      console.log(error)
     msg.channel.send('An error occured while snipe');
     }
  },
};