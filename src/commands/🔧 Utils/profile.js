const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { profileImage } = require('discord-arts');

module.exports = {
    usage: 'profile [<@user>]',
    name: 'profile',
    description: 'This command allows you to view a user\'s profile using an image.',
    async execute({msg, args}) {
        let user;
        if (args.length > 0) {
            const replacedArg = args[0].replace(/[<@!>]/g, '');
            user = await msg.guild.members.fetch(replacedArg).catch(() => null) || msg.author;
        } else {
            user = msg.author;
        }

        const member = await msg.guild.members.fetch(user.id);
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

        msg.reply({ files: [new AttachmentBuilder(buffer)] });
    },
};