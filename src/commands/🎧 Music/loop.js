module.exports = {
  usage: 'loop <song|queue|off>',
  name: 'loop',
  aliases: ['repeat', 'l'],
  description: 'Toggles looping for the current song, the queue, or disables looping.',
  async execute({ msg, args, client }) {
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

    const option = args[0]?.toLowerCase();

    if (!option) {
      return msg.reply("Please specify a loop mode: `song`, `queue`, or `off`.");
    }

    switch (option) {
      case 'song':
        player.setLoop('track');
        return msg.reply("Looping has been **enabled** for the current song.");
      case 'queue':
        player.setLoop('queue');
        return msg.reply("Looping has been **enabled** for the queue.");
      case 'off':
        player.setLoop('none');
        return msg.reply("Looping has been **disabled**.");
      default:
        return msg.reply("Invalid option! Please use `song`, `queue`, or `off`.");
    }
  }
};