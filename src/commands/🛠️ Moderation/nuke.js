const { PermissionsBitField } = require('discord.js');

module.exports = {
    usage: 'nuke [<#channel>]',
    name: 'nuke',
    description: 'Deletes and recreates the current channel',
    async execute({ msg }) {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return msg.reply('You do not have permission to manage channels.');
        }

        const channel = msg.mentions.channels.first() || msg.channel;
        const channelName = channel.name;
        const channelPosition = channel.position;
        const channelDescription = channel.topic || null;

        try {
            // Delete the current channel
            await channel.delete();

            // Recreate the channel with the same name, description, and position
            const newChannel = await channel.clone();
            await newChannel.setName(channelName);
            await newChannel.setPosition(channelPosition);
            if (channelDescription) {
                await newChannel.setTopic(channelDescription);
            }

            await newChannel.send(`Channel has been nuked by \`\`${msg.author.username}\`\`! 💣`);
        } catch (error) {
            console.error(error);
            return msg.reply('An error occurred while nuking the channel.');
        }
    },
};