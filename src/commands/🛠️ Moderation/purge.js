const { PermissionsBitField } = require('discord.js');

module.exports = {
    usage: 'purge <amount/all> [filter]',
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

        // Fetch the messages from the channel
        const messages = await msg.channel.messages.fetch({ limit: deleteAmount + 1 }); // +1 to account for excluding command message
        let filteredMessages = messages.filter(m => m.id !== msg.id); // Exclude the command executor's message

        // Get the filter option from arguments
        const filter = args[1]?.toLowerCase();

        // Apply the filter if provided
        if (filter) {
            switch (filter) {
                case 'bots':
                    filteredMessages = filteredMessages.filter(m => m.author.bot);
                    break;
                case 'humans':
                    filteredMessages = filteredMessages.filter(m => !m.author.bot);
                    break;
                case 'attachments':
                    filteredMessages = filteredMessages.filter(m => m.attachments.size > 0);
                    break;
                case 'links':
                    const linkRegex = /(https?:\/\/[^\s]+)/g;
                    filteredMessages = filteredMessages.filter(m => linkRegex.test(m.content));
                    break;
                default:
                    return msg.reply('Invalid filter provided. Use one of the following: `bots`, `humans`, `attachments`, `links`.');
            }
        }

        // Bulk delete the filtered messages
        try {
            await msg.channel.bulkDelete(filteredMessages, true);
            msg.channel.send(`Successfully deleted ${filteredMessages.size} messages.`).then((message) => {
                setTimeout(() => {
                    message.delete();
                })
            })
        } catch (error) {
            console.error(error);
            msg.reply('There was an error trying to purge messages in this channel!');
        }
    },
};