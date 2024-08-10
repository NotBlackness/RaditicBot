const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purge',
    description: 'Purges a specified number of messages or all (up to 100).',
    async execute(message, args) {
        // Check if the user has the required permission
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('You do not have permission to manage messages!');
        }

        let amount = args[0];

        // Check if "all" is specified, default to 100 if not
        if (amount && amount.toLowerCase() === 'all') {
            amount = 100;
        } else {
            // Convert amount to a number and cap it at 100
            amount = parseInt(amount) || 100;
            amount = Math.min(amount, 100);
        }

        try {
            // Delete the command executer's message first
            await message.delete();

            // Fetch messages to delete
            const fetchedMessages = await message.channel.messages.fetch({ limit: amount });

            // Filter out the command executer's message and messages older than 14 days
            const deletableMessages = fetchedMessages.filter(msg => msg.id !== message.id && (Date.now() - msg.createdTimestamp) < 14 * 24 * 60 * 60 * 1000);

            if (deletableMessages.size === 0) {
                return message.channel.send("I can't delete messages older than 14 days.")
                    .then(msg => setTimeout(() => msg.delete(), 5000));
            }

            // Bulk delete messages
            await message.channel.bulkDelete(deletableMessages, true);

            // Notify the user about the number of deleted messages
            const reply = await message.channel.send(`Purged ${deletableMessages.size} messages.`);
            setTimeout(() => reply.delete(), 5000);

        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to purge messages in this channel!');
        }
    },
};