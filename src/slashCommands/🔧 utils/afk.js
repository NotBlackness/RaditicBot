// afk.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const afkSchema = require('../../Schemas/afkSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set your status to AFK')
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for AFK.')
                .setRequired(false)
        ),
    async execute({interaction}) {
        const { options, guild, user } = interaction;

        const Data = await afkSchema.findOne({ Guild: guild.id, User: user.id });

        if (Data) {
            return interaction.reply({ content: 'You are already AFK in this server!', ephemeral: true });
        } else {
            const reason = options.getString('reason') || "I'm AFK.";

            await afkSchema.create({
                Guild: guild.id,
                User: user.id,
                Reason: reason // Fixed the typo here
            });

            const embed = new EmbedBuilder()
                .setColor('#A020F0')
                .setDescription(`You are now AFK within this server. Reason: **${reason}**`);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};