const { EmbedBuilder } = require('discord.js');
const noblox = require('noblox.js');
const { mainOwnerId } = require('../../config.js');

module.exports = {
    name: 'roblox-userinfo', // Command name
    usage: "roblox-userinfo <username>",
    aliases: ['rui', 'ru'],
    description: 'Get information about a Roblox user.',
    async execute({msg, args}) {
        if (mainOwnerId !== msg.author.id) return;
        
        const username = args[0];
        if (!username) {
            return msg.reply('Please provide a Roblox username.').then(() => {
                setTimeout(() => {
                    msg.delete();
                }, 4000);
            });
        }

        await msg.channel.sendTyping(); // Sends "Typing..." status to show the bot is processing

        try {
            const id = await noblox.getIdFromUsername(username);
            if (!id) {
                return msg.reply(`No user found with the username \`${username}\``).then(() => {
                    setTimeout(() => {
                        msg.delete();
                    }, 4000);
                });
            }

            const info = await noblox.getPlayerInfo(id);
            const profilePicture = await noblox.getPlayerThumbnail([id], '720x720', 'png', false, 'body');
            //const hasPremium = await noblox.getPremium(id);

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle(`${info.username} (${id})`)
                .setThumbnail(profilePicture[0].imageUrl)
                .addFields(
                    { name: `Joined`, value: `<t:${Math.floor(info.joinDate / 1000)}:R>` },
                    { name: 'Description', value: `${info.blurb || 'No Description'}` },
                    { name: `Friends`, value: `${info.friendCount?.toString() ?? '0'}` },
                    { name: `Followers`, value: `${info.followerCount?.toString() ?? '0'}` },
                    { name: `Banned`, value: `${info.isBanned ? '✅' : '❌'}` }
                    //{ name: `Premium`, value: `${hasPremium ? "✅" : "❌"}` }
                );

            await msg.channel.send({ embeds: [embed] });

        } catch (error) {
            await msg.reply(`An error occurred: ${error.message}`);
        }
    }
};