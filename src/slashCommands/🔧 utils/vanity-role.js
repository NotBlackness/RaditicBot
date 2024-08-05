const { SlashCommandBuilder } = require('discord.js');
const Vanity = require('../../Schemas/vanitySchema'); // Ensure the path is correct

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vanity')
        .setDescription('Manage vanity URL settings.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a vanity URL, channel for messages, and role for users with the vanity URL in their status.')
                .addStringOption(option =>
                    option.setName('vanity')
                        .setDescription('The vanity URL to check for (e.g., .gg/yourserver).')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel where the message will be sent.')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to assign to the user.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a vanity URL setting.')
                .addStringOption(option =>
                    option.setName('vanity')
                        .setDescription('The vanity URL to remove (e.g., .gg/yourserver).')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove-all')
                .setDescription('Remove all vanity URL settings.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('Check current vanity URL settings.')),

    async execute({ interaction }) {
        const subcommand = interaction.options.getSubcommand();

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "You don't have the Administrator permission to use that command.", ephemeral: true });
        }
        
        if (subcommand === 'add') {
            const vanity = interaction.options.getString('vanity');
            const channel = interaction.options.getChannel('channel');
            const role = interaction.options.getRole('role');
            const guildId = interaction.guild.id;

            try {
                let settings = await Vanity.findOne({ guildId });
                if (settings) {
                    const exists = settings.vanities.some(v => v.vanity === vanity);
                    if (exists) {
                        await interaction.reply({ content: 'This vanity URL already exists.', ephemeral: true });
                        return;
                    }
                    settings.vanities.push({ vanity, channelId: channel.id, roleId: role.id });
                } else {
                    settings = new Vanity({
                        guildId,
                        vanities: [{ vanity, channelId: channel.id, roleId: role.id }],
                    });
                }

                await settings.save();

                await interaction.reply({ content: 'Vanity URL, channel, and role have been added.', ephemeral: true });
            } catch (error) {
                console.error('Error adding vanity:', error);
                await interaction.reply({ content: 'An error occurred while adding the vanity URL. Please try again later.', ephemeral: true });
            }
        } else if (subcommand === 'remove') {
            const vanity = interaction.options.getString('vanity');
            const guildId = interaction.guild.id;

            try {
                let settings = await Vanity.findOne({ guildId });
                if (settings) {
                    const initialLength = settings.vanities.length;
                    settings.vanities = settings.vanities.filter(v => v.vanity !== vanity);
                    if (settings.vanities.length === initialLength) {
                        await interaction.reply({ content: 'No matching vanity URL found.', ephemeral: true });
                    } else {
                        await settings.save();
                        await interaction.reply({ content: 'Vanity URL has been removed.', ephemeral: true });
                    }
                } else {
                    await interaction.reply({ content: 'No vanity settings found for this guild.', ephemeral: true });
                }
            } catch (error) {
                console.error('Error removing vanity:', error);
                await interaction.reply({ content: 'An error occurred while removing the vanity URL. Please try again later.', ephemeral: true });
            }
        } else if (subcommand === 'remove-all') {
            const guildId = interaction.guild.id;

            try {
                let settings = await Vanity.findOne({ guildId });
                if (settings && settings.vanities.length > 0) {
                    settings.vanities = [];
                    await settings.save();
                    await interaction.reply({ content: 'All vanity URLs have been removed.', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'No vanity URLs found to remove.', ephemeral: true });
                }
            } catch (error) {
                console.error('Error removing all vanities:', error);
                await interaction.reply({ content: 'An error occurred while removing all vanity URLs. Please try again later.', ephemeral: true });
            }
        } else if (subcommand === 'check') {
            const guildId = interaction.guild.id;

            try {
                const settings = await Vanity.findOne({ guildId });

                if (settings && settings.vanities.length > 0) {
                    const vanityList = settings.vanities.map((v, index) => `#${index + 1} \`\`\`Vanity URL: ${v.vanity}\nChannel ID: ${v.channelId}\nRole ID: ${v.roleId}\`\`\``).join('\n\n');
                    await interaction.reply({ content: `Current settings:\n${vanityList}`, ephemeral: true });
                } else {
                    await interaction.reply({ content: 'No vanity settings found for this guild.', ephemeral: true });
                }
            } catch (error) {
                console.error('Error checking vanity settings:', error);
                await interaction.reply({ content: 'An error occurred while checking the vanity settings. Please try again later.', ephemeral: true });
            }
        }
    }
};