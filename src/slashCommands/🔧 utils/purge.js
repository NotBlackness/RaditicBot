const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Purges a specified number of messages (up to 100).')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to purge (up to 100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),
    async execute({interaction}) {
        // Check if the user has the required permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'You do not have permission to manage messages!', ephemeral: true });
        }

        const amount = interaction.options.getInteger('amount');

        try {
            // Defer the reply to show that the bot is processing the request
            await interaction.deferReply({ ephemeral: true });

            // Fetch messages to delete
            const fetchedMessages = await interaction.channel.messages.fetch({ limit: amount });

            // Filter out messages older than 14 days
            const deletableMessages = fetchedMessages.filter(msg => (Date.now() - msg.createdTimestamp) < 14 * 24 * 60 * 60 * 1000);

            if (deletableMessages.size === 0) {
                return interaction.editReply({ content: "I can't delete messages older than 14 days." });
            }

            // Show that the bot is deleting messages
            await interaction.editReply({ content: "Deleting messages..." });

            // Bulk delete messages
            await interaction.channel.bulkDelete(deletableMessages, true);

            // Edit the reply to show the success message
            await interaction.editReply({ content: `Successfully deleted ${deletableMessages.size} message(s).` });

        } catch (error) {
            console.error(error);
            interaction.editReply({ content: 'There was an error trying to purge messages in this channel!' });
        }
    },
};