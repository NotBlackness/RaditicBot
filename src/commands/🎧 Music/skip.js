const { PermissionsBitField } = require('discord.js');

module.exports = {
  usage: 'skip',
  name: 'skip',
  description: 'Skips the currently playing song.',
  async execute({ msg, client }) {
    const {channel} = msg.member.voice;
    if (!channel || interaction.member.voice.channel !== interaction.guild.members.me.voice.channel) {
      return msg.reply('❌ | You need to be in the same voice channel as the bot to skip the song.');
    }

    if (!channel.permissionsFor(msg.guild.members.me).has([PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak])) {
      return msg.reply("I don't have permission to join or speak in your voice channel!");
    } 

    let player = client.manager.players.get(msg.guild.id);
    if (!player) return msg.reply("No player found!");
    await player.skip();
    return msg.reply({content: `Skipped to **[${player.queue[0]?.title}]**`});
  },
};