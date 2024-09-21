const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purge',
    description: 'Delete a number of messages or filter by specific criteria',
    async execute({msg, args}) {
        // Check if the user has Manage Messages permission
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return msg.reply('You do not have permission to manage messages.');
        }

        // Check if the first argument is "all" or a number
        const amount = args[0];
        let deleteAmount = parseInt(amount);

        if (amount === 'all') deleteAmount = 100; // Max of 100 messages can be deleted at once

        if (isNaN(deleteAmount) || deleteAmount <= 0 || deleteAmount > 100) {
            return msg.reply('Please specify a valid number between 1 and 100 or use "all".');
        }

        // Get the filter option from arguments
        const filter = args[1]?.toLowerCase();

        // Fetch the messages from the channel
        const messages = await msg.channel.messages.fetch({ limit: deleteAmount });
        let filteredMessages;

        // Apply the filter if provided
        if (filter) {
            switch (filter) {
                case 'bots':
                    filteredMessages = messages.filter(m => m.author.bot);
                    break;
                case 'humans':
                    filteredMessages = messages.filter(m => !m.author.bot);
                    break;
                case 'attachments':
                    filteredMessages = messages.filter(m => m.attachments.size > 0);
                    break;
                case 'links':
                    const linkRegex = /(https?:\/\/[^\s]+)/g;
                    filteredMessages = messages.filter(m => linkRegex.test(m.content));
                    break;
                default:
                    return msg.reply('Invalid filter provided. Use one of the following: `bots`, `humans`, `attachments`, `links`.');
            }
        } else {
            filteredMessages = messages; // No filter, delete all
        }

        // Bulk delete the filtered messages
        try {
            await msg.channel.bulkDelete(filteredMessages, true);
            msg.channel.send(`Successfully deleted ${filteredMessages.size} messages.`);
        } catch (error) {
            console.error(error);
            msg.reply('There was an error trying to purge messages in this channel!');
        }
    },
};