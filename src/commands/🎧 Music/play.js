const Volume = require('../../Schemas/volumeSchema');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  usage: 'play <song name or URL>',
  name: 'play',
  aliases: ['p'],
  description: 'Plays a song or playlist from a name or URL.',
  async execute({ msg, args, client }) {
    const query = args.join(" "); // FIX: Capture full input (URLs and text)
    const { channel } = msg.member.voice;

    if (!channel) return msg.reply("You need to be in a voice channel to use this command!");
    if (!channel.permissionsFor(msg.guild.members.me).has([PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak])) {
      return msg.reply("I don't have permission to join or speak in your voice channel!");
    }

    if (!query) return msg.reply("Please provide a song name or a valid URL!");

    // Get the custom volume for this guild or set it to the default volume (50)
    const savedVolume = await Volume.findOne({ guildId: msg.guild.id });
    const volume = savedVolume ? savedVolume.volume : 50;

    // Create the player with the volume set
    let player = await client.manager.createPlayer({
      guildId: msg.guild.id,
      textId: msg.channel.id,
      voiceId: channel.id,
      volume: volume,
    });

    // Search for a song or URL
    let result = await client.manager.search(query, { requester: msg.author });

    if (!result.tracks.length) return msg.reply("No results found!");

    // Handle playlists and single tracks
    if (result.type === "PLAYLIST") {
      player.queue.add(result.tracks);
      msg.reply(`Queued **${result.tracks.length}** songs from **${result.playlistName}**.`);
    } else {
      player.queue.add(result.tracks[0]);
      msg.reply(`Queued **${result.tracks[0].title}**.`);
    }

    if (!player.playing && !player.paused) player.play();
  }
};