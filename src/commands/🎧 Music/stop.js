module.exports = {
  usage: 'stop',
  name: 'stop',
  description: 'Stops the current music and clears the queue',
  async execute({msg, args, client}) {
    try {
      const { channel } = msg.member.voice;
      const player = client.manager.players.get(msg.guild.id);

      if (!channel || msg.member.voice.channel !== msg.guild.members.me.voice.channel) {
        return msg.reply('❌ | You need to be in the same voice channel as the bot to skip the song.');
      }

      if (!player) {
        return msg.channel.send({
          content: "❌ There's no active player in this server!",
        });
      }

      if (player.voiceId !== channel.id) {
        return msg.channel.send({
          content: "🚫 You need to be in the same voice channel as the bot to stop the music!",
        });
      }

      // Destroy the player and clear the queue
      player.destroy();

      return msg.channel.send({
        content: "🛑 Stopped the music and cleared the queue.",
      });
    } catch (error) {
      console.error(error);
      return msg.channel.send({
        content: "⚠️ An error occurred while trying to stop the music!",
      });
    }
  },
};