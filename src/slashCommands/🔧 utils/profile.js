const { ChatInputCommandInteraction, SlashCommandBuilder, Client, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { profileImage } = require('discord-arts');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('This command allows you to view a user\'s profile using an image.')
        .addUserOption(option => option
            .setName('user')
            .setDescription('Choose the user whose profile you want to view.')
            .setRequired(false)
        ),
    async execute({interaction}) {

        await interaction.deferReply();

        const user = interaction.options.getUser('user') || interaction.user

        const member = await interaction.guild.members.fetch(user.id);
        const presence = member.presence?.status || 'offline';

        const statusMessage = {
            online: 'online',
            idle: 'idle',
            dnd: 'dnd',
            offline: 'offline',
            streaming: 'streaming'
        };
        
        const buffer = await profileImage(user.id, {
            squareAvatar: false,
            removeAvatarFrame: false,
            overwriteBadges: true,
            badgesFrame: true,
            disableProfileTheme: false,
            moreBackgroundBlur: true,
            removeAvatarFrame: false,
            presenceStatus: statusMessage[presence]
        });

        interaction.editReply({ files: [new AttachmentBuilder(buffer)] });

    },
};