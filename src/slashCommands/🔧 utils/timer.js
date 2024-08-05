const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { color } = require('../../config');
const Timer = require('../../Schemas/timerSchema');  // Adjust the path as necessary

function parseDuration(durationStr) {
  const regex = /(\d+)\s*(second|seconds|s|minute|minutes|m|hour|hours|h|day|days|d)/gi;
  let duration = 0;
  let match;

  while ((match = regex.exec(durationStr)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 's':
      case 'second':
      case 'seconds':
        duration += value * 1000;
        break;
      case 'm':
      case 'minute':
      case 'minutes':
        duration += value * 60 * 1000;
        break;
      case 'h':
      case 'hour':
      case 'hours':
        duration += value * 60 * 60 * 1000;
        break;
      case 'd':
      case 'day':
      case 'days':
        duration += value * 24 * 60 * 60 * 1000;
        break;
      default:
        return null;
    }
  }

  return duration;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timer')
    .setDescription('Start a timer.')
    .addStringOption(option =>
      option
        .setName('duration')
        .setDescription('The timer duration (e.g., "1m12s", "1 minute 12 seconds").')
        .setRequired(true)
    ),
  async execute({ interaction }) {
    const { options } = interaction;
    const durationString = options.getString('duration');
    const duration = parseDuration(durationString);

    if (!duration || duration <= 0) {
      return await interaction.reply({ content: 'Please provide a valid duration format (e.g., "1m12s", "1 minute 12 seconds").', ephemeral: true });
    }

    const startingMessage = await interaction.reply({ content: 'Starting your timer...', ephemeral: true });

    const endTime = Date.now() + duration;

    const embed = new EmbedBuilder()
      .setTitle('Timer Started')
      .setDescription(`### Ends <t:${Math.floor(endTime / 1000)}:R>`)
      .setFooter({ text: '⚠️ This timer can be 1-2 seconds off due to API call delays.', iconURL: interaction.guild.iconURL() })
      .setAuthor({ name: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
      .setTimestamp()
      .setColor(color.default);

    const message = await interaction.channel.send({ embeds: [embed], fetchReply: true });

    await startingMessage.edit({ content: 'Your timer has been started.', ephemeral: true });

    // Save the end time and message ID to MongoDB
    const timer = new Timer({
      messageId: message.id,
      channelId: message.channel.id,
      endTime: new Date(endTime)
    });
    await timer.save();

    // Schedule a task to check the timer regularly
    checkTimers(interaction.client);
  },
};

// Function to check timers regularly and update the embed if the timer has ended
async function checkTimers(client) {
  const now = new Date();

  const expiredTimers = await Timer.find({ endTime: { $lte: now } });

  for (const timer of expiredTimers) {
    const channel = await client.channels.fetch(timer.channelId);
    if (!channel) continue;

    const message = await channel.messages.fetch(timer.messageId);
    if (!message) continue;

    const endedEmbed = new EmbedBuilder()
      .setTitle('Timer Ended')
      .setDescription(`### Ends <t:${Math.floor(timer.endTime.getTime() / 1000)}:R>`)
      .setAuthor({ name: `${channel.guild.name}`, iconURL: channel.guild.iconURL() })
      .setTimestamp()
      .setColor(color.red);

    await message.edit({ embeds: [endedEmbed] });
    await Timer.deleteOne({ _id: timer._id });
  }

  // Check timers every second
  setTimeout(() => checkTimers(client), 1000);
}