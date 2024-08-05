const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

const reactions = require('../../Schemas/reactionroleSchema');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('reaction-role')
  .setDescription('Manage your reactiom role system.')
  .addSubcommand(subcommand => {
    return subcommand
    .setName('add')
    .setDescription('Add a reaction role to a message.')
    .addStringOption(option => {
      return option
      .setName('message-id')
      .setDescription('The message ID you want to set reaction roles.')
      .setRequired(true)
    })
    .addStringOption(option => {
      return option
      .setName('emoji')
      .setDescription('The emoji to react with.')
      .setRequired(true)
    })
    .addRoleOption(option => {
      return option
      .setName('role')
      .setDescription('The role you want to give.')
      .setRequired(true)
    })
  })
   .addSubcommand(subcommand => {
     return subcommand
     .setName('remove')
     .setDescription('Remove a reaction role from a message.')
     .addStringOption(option => {
       return option
       .setName('message-id')
       .setDescription('The message ID you want to remove reaction role.')
       .setRequired(true)
     })
     .addStringOption(option => {
       return option
       .setName('emoji')
       .setDescription('The emoji to react with.')
       .setRequired(true)
     })
   }), 
  async execute({interaction}) {
    const {options, guild, channel} = interaction;
    const sub = options.getSubcommand();
    const emoji = options.getString('emoji');

    let e;
    const message = await channel.messages.fetch(options.getString('message-id')).catch(err => {
      e = err;
    });
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: "You don't have permissions to use this command.", ephemeral: true });
    if (e) return await interaction.reply({ content: `Be sure to get a message from ${channel}`, ephemeral: true })

    const data = await reactions.findOne({ guildId: guild.id, messageId: message.id, Emoji: emoji });

    switch (sub) {
         case 'add':

        if (data) {
          return interaction.reply({ content: 'It looks like you already have this reaction role setup.', ephemeral: true });
        } else {
          const role = options.getRole('role');

          await reactions.create({
            guildId: guild.id,
            messageId: message.id,
            Emoji: emoji,
            Role: role.id
          });

          const embed = new EmbedBuilder()
          .setColor('#A020F0')
          .setDescription(`I have added reaction role to ${message.url} with ${emoji} and the role ${role}`)

          await message.react(emoji).catch(err => {
            return interaction.reply({ content: 'Please add this emoji in this server.' })
          })

          await interaction.reply({ embeds: [embed] })
        }

        break;
      case 'remove':
        if (!data) {
          return await interaction.reply({ content: 'Reaction role does not exist.' })
        } else {
          await reactions.deleteMany({ guildId: guild.id, messageId: message.id, Emoji: emoji });
          const embed = new EmbedBuilder()
          .setDescription(`I have removed reaction role from ${message.url} for the emoji ${emoji}`)
          .setColor('#A020F0')
          await interaction.reply({ embeds: [embed] });
        }
    }
  }
}