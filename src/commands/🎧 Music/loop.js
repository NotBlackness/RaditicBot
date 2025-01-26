module.exports = {
  usage: 'loop',
  name: 'loop',
  aliases: ['repeat'],
  description: 'Toggles looping for the currently playing song.',
  async execute({ msg, client }) {
    const player = client.manager.players.get(msg.guild.id);

    if (!player) {
      return msg.reply("There's no music playing in this guild!");
    }

    const { channel } = msg.member.voice;
    if (!channel) {
      return msg.reply("You need to be in a voice channel to use this command!");
    }
    if (channel.id !== player.voiceId) {
      return msg.reply("You need to be in the same voice channel as the bot to use this command!");
    }

    // Toggle loop state
    if (player.loop === 'track') {
      player.setLoop('none'); // Disable loop
      return msg.reply("Looping has been **disabled** for the current song.");
    } else {
      player.setLoop('track'); // Enable loop
      return msg.reply("Looping has been **enabled** for the current song.");
    }
  }
};