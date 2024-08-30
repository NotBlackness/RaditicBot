const { EmbedBuilder } = require('discord.js');
const { color } = require('../../config.js');

module.exports = {
  name: 'hack',
  description: 'Hack a user\'s account (just for fun, doesn\'t actually work)',
  async execute({ msg, args }) {
    const replacedArg = args[0]?.replace(/[<@!>]/g, '');
    const user = msg.guild.members.cache.get(replacedArg);

    if (!user || user.user.bot) return msg.reply('Please mention a valid user to hack!');

    const hackingMessage1 = `Hacking **${user.user.username}**'s account...`;

    const hackingMessageEmbed = new EmbedBuilder()
      .setTitle('Hacking...')
      .setDescription(hackingMessage1)
      .setColor(color.default)
      .setTimestamp();

    const hackingMessage = await msg.reply({ embeds: [hackingMessageEmbed] });

    let progress = 0;
    let ProgressBar = '';

    // Set typing status
    msg.channel.sendTyping();

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5; // Increase speed by incrementing progress faster
      progress = Math.min(progress, 100); // Ensure progress does not exceed 100

      ProgressBar = '';
      for (let i = 0; i < 20; i++) { // Increase ProgressBar length to 20
        if (i < progress / 5) ProgressBar += '█'; // Adjust for the longer ProgressBar
        else ProgressBar += '░';
      }

      const hackingMessageProgress = `Hacking **${user.user.username}**'s account... \`\`\`[${progress}%] ${ProgressBar}\`\`\``;

      const hackingMessageProgressEmbed = new EmbedBuilder()
        .setTitle('Hacking In Progress...')
        .setDescription(hackingMessageProgress)
        .setColor(color.default)
        .setTimestamp();

      hackingMessage.edit({ embeds: [hackingMessageProgressEmbed] });

      // Refresh typing status
      msg.channel.sendTyping();

      if (progress >= 100) {
        clearInterval(interval);
        const fakeToken = generateFakeToken();
        const hackingComplete = `Hacking complete! **${user.user.username}**'s account token is: \`\`\`${fakeToken}\`\`\``;
        const hackingCompleteEmbed = new EmbedBuilder()
          .setTitle('Hacking Completed!')
          .setDescription(hackingComplete)
          .setColor(color.default)
          .setTimestamp();

        hackingMessage.edit({ embeds: [hackingCompleteEmbed] });
      }
    }, 400); // Reduce the interval to speed up progress updates
  },
};

function generateFakeToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 59; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}