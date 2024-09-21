const { SlashCommandBuilder } = require('discord.js');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete a number of messages or filter by specific criteria')
        .addStringOption(option => 
            option.setName('amount')
                .setDescription('Number of messages to delete or "all"')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('filter')
                .setDescription('Filter the messages (Bots, Humans, Attachments, Links)')
                .addChoices(
                    { name: 'Bots', value: 'bots' },
                    { name: 'Humans', value: 'humans' },
                    { name: 'Attachments', value: 'attachments' },
                    { name: 'Links', value: 'links' }
                )
        ),
    async execute({interaction}) {
        // Ensure the user has the required permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'You do not have permission to manage messages.', ephemeral: true });
        }

        const amount = interaction.options.getString('amount');
        const filter = interaction.options.getString('filter');
        let deleteAmount = parseInt(amount);

        if (amount === 'all') deleteAmount = 100; // Max of 100 messages can be deleted at once by Discord API

        if (isNaN(deleteAmount) || deleteAmount <= 0 || deleteAmount > 100) {
            return interaction.reply({ content: 'Please specify a valid number between 1 and 100 or use "all".', ephemeral: true });
        }

        // Fetch messages
        const messages = await interaction.channel.messages.fetch({ limit: deleteAmount });
        let filteredMessages;

        // Apply filters if specified
        if (filter) {
            switch (filter) {
                case 'bots':
                    filteredMessages = messages.filter(msg => msg.author.bot);
                    break;
                case 'humans':
                    filteredMessages = messages.filter(msg => !msg.author.bot);
                    break;
                case 'attachments':
                    filteredMessages = messages.filter(msg => msg.attachments.size > 0);
                    break;
                case 'links':
                    const linkRegex = /(https?:\/\/[^\s]+)/g;
                    filteredMessages = messages.filter(msg => linkRegex.test(msg.content));
                    break;
                default:
                    return interaction.reply({ content: 'Invalid filter provided.', ephemeral: true });
            }
        } else {
            filteredMessages = messages; // No filter, delete all
        }

        // Bulk delete filtered messages
        try {
            await interaction.channel.bulkDelete(filteredMessages, true);
            await interaction.reply({ content: `Successfully deleted ${filteredMessages.size} messages.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'There was an error trying to purge messages in this channel!', ephemeral: true });
        }
    },
};