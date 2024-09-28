const Volume = require('../../Schemas/volumeSchema');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  usage: 'play <song name or url>',
  name: 'play',
  aliases: ['p'],
  description: 'Plays a song.',
  async execute({ msg, args, client }) {
    const query = args.slice(1).join(" ");
    const { channel } = msg.member.voice;

    if (!channel) return msg.reply("You need to be in a voice channel to use this command!");
    if (!channel.permissionsFor(msg.guild.members.me).has([PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak])) {
      return msg.reply("I don't have permission to join or speak in your voice channel!");
    }

    // Get the custom volume for this guild or set it to the default volume (40)
    const savedVolume = await Volume.findOne({ guildId: msg.guild.id });
    const volume = savedVolume ? savedVolume.volume : 50; // Default to 50 if no custom volume

    // Create the player with the volume set
    let player = await client.manager.createPlayer({
      guildId: msg.guild.id,
      textId: msg.channel.id,
      voiceId: channel.id,
      volume: volume,  // Apply saved or default volume
    });

    let result = await client.manager.search(query, { requester: msg.author });
    if (!result.tracks.length) return msg.reply("No results found!");

    if (result.type === "PLAYLIST") player.queue.add(result.tracks);
    else player.queue.add(result.tracks[0]);

    if (!player.playing && !player.paused) player.play();

    return msg.reply({
      content: result.type === "PLAYLIST" 
        ? `Queued ${result.tracks.length} from ${result.playlistName}` 
        : `Queued ${result.tracks[0].title}`,
    });
  }
};