const Discord = require('discord.js');
const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { prefix } = require('../config');
const ms = require('pretty-ms');
const ticketSchema = require('../Schemas/ticketSchema');
const { createTranscript } = require('discord-html-transcripts');
const { color } = require('../config');

const client = require(process.cwd() + '/src/index.js')

client.on("interactionCreate", async (interaction) => {
  if (!interaction.guild) return;

  const { customId, guild, channel } = interaction;

  if (interaction.isButton()) {
    if (customId === "ticket") {
      let data = await ticketSchema.findOne({ GuildID: interaction.guild.id });

      if (!data) {
        return await interaction.reply({ content: "Ticket system is not setup in this server.", ephemeral: true });
      }

      const role = guild.roles.cache.get(data.Role)
      const cate = data.Category;
      const posChannel = interaction.guild.channels.cache.find(c => c.topic && c.topic.includes(`Ticket Owner: ${interaction.user.id}`));
      if (posChannel) {
        return await interaction.reply({ content: `You already have a ticket open: <#${posChannel.id}>`, ephemeral: true });
      }

      await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        parent: cate,
        type: ChannelType.GuildText,
        topic: `Ticket Owner: ${interaction.user.id}`,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: ["ViewChannel"]
          },
          {
            id: role.id,
            allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
          },
          {
            id: interaction.member.id,
            allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
          },
        ],
      }).then(async (channel) => {
        const openembed = new EmbedBuilder()
          .setColor('#00c7fe')
          .setTitle('Ticket Opened')
          .setDescription(`Welcome to your ticket **${interaction.user.username}**\nClick the 🔒 Close button to delete the ticket`)
          .setThumbnail(interaction.guild.iconURL())
          .setTimestamp()
          .setFooter({ text: `${interaction.guild.name}'s Tickets` })

        const closeButton = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('closeticket')
              .setLabel('Close')
              .setStyle(ButtonStyle.Danger)
              .setEmoji('🔒')
          )
        await channel.send({ content: `<@&${role.id}> | <@${interaction.user.id}>`, embeds: [openembed], components: [closeButton] })

        const openTicket = new EmbedBuilder()
          .setDescription(`Ticket created in <#${channel.id}>`)

        await interaction.reply({ embeds: [openTicket], ephemeral: true })
      })
    }
    if (customId === "closeticket") {
      const closingEmbed = new EmbedBuilder()
        .setDescription('🔒 are you sure you want to close this ticket?')
        .setColor('DarkRed')

      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('yesclose')
            .setLabel('Yes')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('✅'),

          new ButtonBuilder()
            .setCustomId('nodont')
            .setLabel('No')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('❌')
        )

      await interaction.reply({ embeds: [closingEmbed], components: [buttons] })
    }

    if (customId === "yesclose") {
      let data = await ticketSchema.findOne({ GuildID: interaction.guild.id })
      const transcript = await createTranscript(channel, {
        limit: -1,
        returnBuffer: true
      })

      const transcriptEmbed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.guild.name}'s Transcripts`, iconURL: guild.iconURL() })
        .addFields(
          { name: 'Ticket name', value: `${channel.name}` },
          { name: 'Closed by', value: `${interaction.user.tag}` }
        )
        .setColor(color.default)
        .setTimestamp()
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({ text: `${interaction.guild.name}'s Tickets` })

      const processEmbed = new EmbedBuilder()
        .setDescription(`Closing in 10 seconds...`)
        .setColor(color.default)

      await interaction.update({ embeds: [processEmbed], components: [] })

      const ticketLog = await guild.channels.cache.get(data.Logs)
      if (ticketLog) ticketLog.send({
        embeds: [transcriptEmbed],
        files: [transcript],
      })

      setTimeout(() => {
        interaction.channel.delete()
      }, 10000);
    }

    if (customId === "nodont") {
      const noEmbed = new EmbedBuilder()
        .setDescription(`Ticket close cancelled by ${interaction.user.username}`)
        .setColor('Red')

      await interaction.update({ embeds: [noEmbed], components: [] })
    }
  }

  const commandName = interaction.commandName;
  if (!client.slashCommands) return;
  const slashCommand = client.slashCommands.get(commandName);
  if (!slashCommand) return
  try {
    return slashCommand.execute({ client, interaction, ms, Discord, prefix });
  } catch (error) {
    console.log(error)
    interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true 
    });
  }
});