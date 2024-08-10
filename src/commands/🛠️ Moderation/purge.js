const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purge',
    description: 'Purges a specified number of messages (up to 100).',
    async execute({ msg, args }) {
        // Check if the user has the required permission
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return msg.reply('You do not have permission to manage messages!')
                .then(reply => setTimeout(() => reply.delete(), 5000));
        }

        // Check if the bot has the required permission
        if (!msg.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return msg.reply('I do not have permission to manage messages!')
                .then(reply => setTimeout(() => reply.delete(), 5000));
        }

        let amount = args[0];

        // Convert amount to a number and cap it at 100
        amount = parseInt(amount) || 100;
        amount = Math.min(amount, 100);

        try {
            // Delete the command executer's message first
            await msg.delete();

            // Fetch messages to delete
            const fetchedMessages = await msg.channel.messages.fetch({ limit: amount });

            // Filter out messages older than 14 days
            const deletableMessages = fetchedMessages.filter(message => (Date.now() - message.createdTimestamp) < 14 * 24 * 60 * 60 * 1000);

            if (deletableMessages.size === 0) {
                return msg.channel.send("I can't delete messages older than 14 days.")
                    .then(reply => setTimeout(() => reply.delete(), 5000));
            }

            // Bulk delete messages
            await msg.channel.bulkDelete(deletableMessages, true);

            // Notify the user about the number of deleted messages
            const reply = await msg.channel.send(`Purged ${deletableMessages.size} message(s).`);
            setTimeout(() => reply.delete(), 5000);

        } catch (error) {
            console.error(error);
            msg.channel.send('There was an error trying to purge messages in this channel!')
                .then(reply => setTimeout(() => reply.delete(), 5000));
        }
    },
};