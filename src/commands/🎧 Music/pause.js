module.exports = {
  usage: 'pause',
  name: 'pause',
  description: 'Pauses the current song.',
  async execute({ msg, client }) {
    const player = client.manager.players.get(msg.guild.id);

    if (!player) return msg.reply("No music is currently playing!");
    if (!msg.member.voice.channel || msg.member.voice.channel.id !== player.voiceId) {
      return msg.reply("You must be in the same voice channel as the bot to use this command!");
    }

    if (player.paused) {
      return msg.reply("The music is already paused!");
    }

    player.pause(true);
    return msg.reply("Paused the music!");
  },
};