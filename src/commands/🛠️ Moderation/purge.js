const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { color } = require('../../config.js');

module.exports = {
  name: 'purge',
  description: 'Purge messages from the channel',
  usage: 'purge <amount> <filter>',
  aliases: ['clear'],
  async execute({msg, args}) {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      const noPermissionEmbed = new EmbedBuilder()
        .setColor(color.default)
        .setTitle('Permission Error')
        .setDescription('You do not have the required permissions to use this command.')
        .setTimestamp();

      return msg.reply({ embeds: [noPermissionEmbed], ephemeral: true });
    }

    const amount = parseInt(args[0]);
    const filter = args[1];
    const channel = msg.channel;

    if (isNaN(amount) || amount < 1 || amount > 100) {
      const invalidAmountEmbed = new EmbedBuilder()
        .setColor(color.default)
        .setTitle('Invalid Amount')
        .setDescription('Please specify a valid number of messages to purge (1-100).')
        .setTimestamp();

      return msg.reply({ embeds: [invalidAmountEmbed], ephemeral: true });
    }

    let messages;

    try {
      switch (filter) {
        case 'links':
          messages = await channel.messages.fetch({ limit: amount });
          messages = messages.filter(msg => msg.content.includes('http://') || msg.content.includes('https://'));
          break;
        case 'bot':
          messages = await channel.messages.fetch({ limit: amount });
          messages = messages.filter(msg => msg.author.bot);
          break;
        case 'invites':
          messages = await channel.messages.fetch({ limit: amount });
          messages = messages.filter(msg => /discord\.gg\/\w+/i.test(msg.content));
          break;
        case 'attachments':
          messages = await channel.messages.fetch({ limit: amount });
          messages = messages.filter(msg => msg.attachments.size > 0);
          break;
        case 'images':
          messages = await channel.messages.fetch({ limit: amount });
          messages = messages.filter(msg => msg.attachments.some(attachment => attachment.name.match(/\.(png|jpe?g|gif)$/i)));
          break;
        case 'all':
        default:
          messages = await channel.messages.fetch({ limit: amount });
          break;
      }

      if (messages.size === 0) {
        const noMessagesEmbed = new EmbedBuilder()
          .setColor(color.default)
          .setFooter({ text: 'Parrot' })
          .setTitle('No Messages to Purge')
          .setDescription('There are no messages in the channel to purge.')
          .setTimestamp();

        return msg.reply({ embeds: [noMessagesEmbed], ephemeral: true });
      }

      await channel.bulkDelete([...messages.values()], true);
      const purgeSuccessEmbed = new EmbedBuilder()
        .setColor(color.default)
        .setTitle('Purge Successful')
        .setDescription(`Successfully purged ${messages.size} message(s).`)
        .setTimestamp();

      msg.reply({ embeds: [purgeSuccessEmbed], ephemeral: true });
    } catch (error) {
      console.error('Error purging messages:', error);
      const purgeErrorEmbed = new EmbedBuilder()
        .setColor(color.default)
        .setTitle('Purge Error')
        .setDescription('An error occurred while purging messages.')
        .setTimestamp();

      msg.reply({ embeds: [purgeErrorEmbed], ephemeral: true });
    }
  },
};