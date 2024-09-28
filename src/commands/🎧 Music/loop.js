module.exports = {
  name: 'loop',
  usage: 'loop',
  description: 'Toggles loop modes between None, Track, and Queue. Use loop command again to change the loop mode.',
  async execute({ msg, args, client }) {
    const player = client.manager.players.get(msg.guild.id);
    if (!player) return msg.reply('No player found in this guild.');

    // Get the current loop mode or default to "none"
    let currentLoopMode = player.loop || 'none';
    let newLoopMode;

    // Switch loop mode
    if (currentLoopMode === 'none') newLoopMode = 'track';
    else if (currentLoopMode === 'track') newLoopMode = 'queue';
    else newLoopMode = 'none';

    // Set the new loop mode with Kazagumo's built-in loop functionality
    player.setLoop(newLoopMode);

    // Send response to the user
    msg.reply(`Loop mode set to **${newLoopMode.charAt(0).toUpperCase() + newLoopMode.slice(1)}**.`);
  }
}