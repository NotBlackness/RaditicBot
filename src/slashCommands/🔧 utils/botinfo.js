const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');
const moment = require('moment');
const cpuStat = require('cpu-stat');
const { color } = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Shows some information about the bot.'),

    async execute({interaction}) {
        // Defer reply to show that the bot is processing the command
        await interaction.deferReply();

        // Calculate uptime
        const days = Math.floor(interaction.client.uptime / 86400000);
        const hours = Math.floor((interaction.client.uptime / 3600000) % 24);
        const minutes = Math.floor((interaction.client.uptime / 60000) % 60);
        const seconds = Math.floor((interaction.client.uptime / 1000) % 60);

        let uptimeString = '';
        if (days > 0) uptimeString += `${days}d `;
        if (hours > 0) uptimeString += `${hours}h `;
        if (minutes > 0) uptimeString += `${minutes}m `;
        if (seconds > 0) uptimeString += `${seconds}s`;

        if (!uptimeString) uptimeString = '0s'; // Show 0s if the uptime is 0

        // Calculate memory usage
        const memoryUsage = formatBytes(process.memoryUsage().heapUsed);

        // Initial embed to show while processing
        const initialEmbed = new EmbedBuilder()
            .setColor(color.default)
            .setDescription("Getting bot information...");

        const message = await interaction.editReply({ embeds: [initialEmbed] });

        // Calculate CPU usage
        cpuStat.usagePercent(async (error, percent) => {
            if (error) return console.log(error);

            const nodeVersion = process.version;
            const CPUUsage = percent.toFixed(2);
            const CPUInfo = os.cpus()[0].model;
            const cores = os.cpus().length;

            // Final bot information embed
            const botinfoEmbed = new EmbedBuilder()
                .setAuthor({
                    name: "Bot info",
                    iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }),
                })
                .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: `Made With 💞 By 🥀! NotBlackness </>`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                })
                .setColor(color.default)
                .addFields(
                    { name: "**Bot Name:**", value: `${interaction.client.user.username}`, inline: false },
                    { name: "**Bot ID:**", value: `${interaction.client.user.id}`, inline: false },
                    { name: "\u200B", value: "\u200B", inline: false },
                    { name: "**Bot Created At:**", value: `${moment.utc(interaction.client.user.createdAt).format("LLLL")}`, inline: false },
                    { name: "**Total Server(s):**", value: `${interaction.client.guilds.cache.size.toLocaleString()}`, inline: false },
                    { name: "**Total Member(s):**", value: `${interaction.client.users.cache.size.toLocaleString()}`, inline: false },
                    { name: "**Total Channel(s):**", value: `${interaction.client.channels.cache.size.toLocaleString()}`, inline: false },
                    { name: "**UpTime:**", value: `${uptimeString}`, inline: false },
                    { name: "**Ping:**", value: `API Latency: **${interaction.client.ws.ping}**ms\nClient Ping: **${Date.now() - message.createdTimestamp}**ms`, inline: false },
                    { name: "\u200B", value: "\u200B", inline: false },
                    { name: "**NodeJS Version:**", value: `${nodeVersion}`, inline: false },
                    { name: "**Memory Usage:**", value: `${memoryUsage}`, inline: false },
                    { name: "**CPU Usage:**", value: `${CPUUsage}%`, inline: false },
                    { name: "**CPU Model:**", value: `${CPUInfo}`, inline: false },
                    { name: "**Cores:**", value: `${cores}`, inline: false },
                );

            // Edit the initial message to show the bot info
            await interaction.editReply({ embeds: [botinfoEmbed] });
        });

        // Function to format bytes as human-readable text
        function formatBytes(bytes, decimals = 2) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        }
    },
};