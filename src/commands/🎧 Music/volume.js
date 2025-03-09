const Volume = require('../../Schemas/volumeSchema');
const { EmbedBuilder } = require('discord.js');
const { color } = require('../../config');

module.exports = {
  name: 'volume',
  aliases: ['vol'],
  description: 'Set or check the volume for the music player.',
  usage: 'volume [1-200]',
  async execute({ msg, args, client }) {
    const { channel } = msg.member.voice;
    if (!channel || msg.member.voice.channel !== msg.guild.members.me.voice.channel) {
      return msg.reply('❌ | You need to be in the same voice channel as the bot to change the volume.');
    }

    const player = client.manager.players.get(msg.guild.id);
    if (!player) return msg.reply("No active player in this server.");

    if (player.voiceId !== channel.id) {
      return msg.reply("You need to be in the same voice channel as the bot to change the volume!");
    }

    const volume = parseInt(args[0]);
    if (isNaN(volume)) {
      // Fetch current volume from database or return player's volume if no volume in the database
      const savedVolume = await Volume.findOne({ guildId: msg.guild.id });
      const currentVolume = savedVolume ? savedVolume.volume : 50; // Default to 50 if no volume is set
      return msg.reply(`The current volume is set to \`${currentVolume}\`.`);
    }

    if (volume < 1 || volume > 200) {
      return msg.reply("Please provide a valid volume level between 1 and 200.");
    }

    // Set player volume
    player.setVolume(volume);

    // Save the new volume to the database
    await Volume.findOneAndUpdate(
      { guildId: msg.guild.id },
      { volume: volume },
      { upsert: true, new: true }
    );

    // Embed for volume confirmation
    let volumeMessage = `🔊 The volume has been set to \`${volume}\`%.`;
    let embedColor = color.default;

    if (volume > 100) {
      volumeMessage += "\n\n```⚠️ High volume may cause distortion!```";
      embedColor = 0xffcc00; // Yellow warning color
    }

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle('Volume Updated')
      .setDescription(volumeMessage)
      .setFooter({ text: 'Use the command again to change the volume.' })
      .setTimestamp();

    return msg.reply({ embeds: [embed] });
  }
};