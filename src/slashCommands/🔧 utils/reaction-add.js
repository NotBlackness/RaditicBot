// Import necessary modules
const { PermissionsBitField, DiscordAPIError, Message, SlashCommandBuilder } = require('discord.js');
const { default: axios } = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reaction-add')
    .setDescription('Add a reaction to a message.')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('The ID of the message to add reaction to')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('The emoji to add as a reaction')
        .setRequired(true)
    ),
  async execute({ interaction }) {
    const messageId = interaction.options.getString('message_id');
    const emoji = interaction.options.getString('emoji');

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.AddReactions)) return interaction.reply({ content: "You don't have the ``Add Reactions`` permission to use this command.", ephemeral: true });

    try {
      // Retrieve the message by its ID
      const message = await interaction.channel.messages.fetch(messageId);

      // Check if the message is a valid Discord message
      if (message instanceof Message) {
        // Check if the emoji is animated
        const isAnimated = emoji.split(':').pop().endsWith('>');

        if (isAnimated) {
          // Add the reaction to the message using the provided animated emoji
          await message.react(emoji);
        } else {
          // Add the reaction to the message using the provided emoji
          await message.react(emoji);
        }

        interaction.reply({ content: `Reaction added to the message with ID ${messageId}.`, ephemeral: true });
      } else {
        interaction.reply({ content: 'Invalid message ID provided.', ephemeral: true });
      }
    } catch (error) {
      if (error instanceof DiscordAPIError) {
        if (error.code === 10008) {
          interaction.reply({ content: 'Message not found. Please provide a valid message ID.', ephemeral: true });
        } else if (error.code === 10014) {
          interaction.reply({ content: 'An unknown emoji provided. Please provide a valid emoji to add.', ephemeral: true });
        } else {
          console.error('Error adding reaction:', error);
          interaction.reply({ content: 'There was an error adding the reaction.', ephemeral: true });
        }
      } else {
        console.error('Error adding reaction:', error);
        interaction.reply({ content: 'There was an error adding the reaction.', ephemeral: true });
      }
    }
  },
};