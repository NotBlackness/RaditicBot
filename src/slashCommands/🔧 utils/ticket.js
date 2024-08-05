const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, ChannelType, SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { color } = require('../../config');

const ticketSchema = require('../../Schemas/ticketSchema');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('ticket')
  .setDescription('Manage Ticket System')
    .addSubcommand(subcommand => {
      return subcommand
      .setName('setup')
      .setDescription('Sets up the ticket system for the server.')
      .addChannelOption(option => {
        return option
        .setName('channel')
        .setDescription('The channel to send the ticket panel to.')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText);
      })
      .addChannelOption(option => {
        return option
        .setName('category')
        .setDescription('The category to create the ticket channels in.')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory);
      })
      .addChannelOption(option => {
        return option
        .setName('ticket-logs')
        .setDescription('The channel for the transcripts to be sent to.')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true);
      })
      .addStringOption(option => {
        return option
        .setName('description')
        .setDescription('The description for the ticket system.')
        .setRequired(true)
        .setMinLength(11)
        .setMaxLength(1000);
      })
      .addStringOption(option => {
        return option
        .setName('color')
        .setDescription('The color for the ticket panel.')
        .addChoices(
          { name: 'Red', value: 'Red' },
          { name: 'Blue', value: 'Blue' },
          { name: 'Green', value: 'Green' },
          { name: 'Yellow', value: 'Yellow' },
          { name: 'Purple', value: 'Purple' },
          { name: 'Pink', value: 'DarkVividPink' },
          { name: 'Orange', value: 'Orange' },
          { name: 'White', value: 'White' },
          { name: 'Gray', value: 'Gray' },
        )
        .setRequired(true);
      })
      .addRoleOption(option => {
        return option
        .setName('role')
        .setDescription('The role to ping when a ticket is created.')
        .setRequired(true);
      });
    })
    .addSubcommand(subcommand => {
      return subcommand
      .setName('disable')
      .setDescription('Disable the ticket system for the server.')
    }),
  async execute({ interaction, client }) {
    const { options, guild } = interaction;

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return await interaction.reply({ content: 'You don\'t have `Administrator` permission to use that command.', ephemeral: true });
    }

    const subcommand = options.getSubcommand();

    if (subcommand === 'setup') {
      const color = options.getString('color');
      const msg = options.getString('description');
      const GuildID = interaction.guild.id;
      const panel = options.getChannel('channel');
      const category = options.getChannel('category');
      const role = options.getRole('role') || '';
      const logs = options.getChannel('ticket-logs');

      try {
        const data = await ticketSchema.findOne({ GuildID: GuildID });
        if (data) {
          return await interaction.reply({ content: 'You already have a ticket system setup.', ephemeral: true });
        } else {
          await ticketSchema.create({
            GuildID: GuildID,
            Channel: panel.id,
            Category: category.id,
            Role: role.id,
            Logs: logs.id,
          });

          const embed = new EmbedBuilder()
            .setColor(`${color}`)
            .setTimestamp()
            .setTitle('Ticket Panel')
            .setDescription(`${msg}`);

          const button = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('ticket')
                .setLabel('Create Ticket')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎟️')
            );

          const channel = client.channels.cache.get(panel.id);
          await channel.send({ embeds: [embed], components: [button] });

          await interaction.reply({ content: `The ticket panel has been sent to ${channel}.`, ephemeral: true });
        }
      } catch (err) {
        console.error(err);
      }
    } else if (subcommand === 'disable') {
      try {
        const GuildID = guild.id;

        const embed2 = new EmbedBuilder()
          .setColor(color.default)
          .setDescription('ticket system has been disabled already')
          .setTimestamp()
          .setAuthor({ name: 'Ticket System' })
          .setFooter({ text: 'Ticket System Disabled' });

        const data = await ticketSchema.findOne({ GuildID: GuildID });
        if (!data) return await interaction.reply({ embeds: [embed2], ephemeral: true });

        await ticketSchema.findOneAndDelete({ GuildID: GuildID });

        const channel = client.channels.cache.get(data.Channel);
        if (channel) {
          await channel.messages.fetch({ limit: 1 }).then(messages => {
            const lastMessage = messages.first();
            if (lastMessage.author.id == client.user.id) {
              lastMessage.delete();
            }
          });
        }

        const embed = new EmbedBuilder()
          .setColor(color.default)
          .setDescription('Ticket System has been disabled')
          .setTimestamp()
          .setAuthor({ name: 'Ticket System' })
          .setFooter({ text: 'Ticket System Disabled' });

        await interaction.reply({ embeds: [embed] });
      } catch (err) {
        console.error(err);
      }
    }
  },
};