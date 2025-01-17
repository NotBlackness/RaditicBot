const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purge',
    description: 'Delete messages from a channel (up to 100 messages).',
    async execute({ msg, args }) {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return msg.channel.send('❌ You do not have permission to use this command.');
        }

        const amountArg = args[0];
        if (!amountArg || (isNaN(amountArg) && amountArg.toLowerCase() !== 'all')) {
            return msg.channel.send('❌ Please provide a valid number of messages to delete or use `all`.');
        }

        let amount = amountArg.toLowerCase() === 'all' ? 100 : parseInt(amountArg);

        if (amount < 1 || amount > 100) {
            return msg.channel.send('❌ You can only delete between 1 and 100 messages at a time.');
        }

        try {
            // Deletes the command message first
            await msg.delete();

            // Fetches messages and excludes the command message itself
            const fetchedMessages = await msg.channel.messages.fetch({ limit: amount });
            const deletedMessages = await msg.channel.bulkDelete(fetchedMessages, true);

            const deletedCount = deletedMessages.size;

            // Sends feedback message
            msg.channel
                .send(`✅ Successfully deleted ${deletedCount} messages.`)
                .then(sentMsg => setTimeout(() => sentMsg.delete(), 5000));
        } catch (err) {
            console.error(err);
            msg.channel.send('❌ There was an error while trying to delete messages.');
        }
    }
};