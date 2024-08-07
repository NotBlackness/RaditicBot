// commands/autorole.js
const { PermissionsBitField, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Autorole = require('../../Schemas/autoroleSchema');
const { color } = require('../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Manage autoroles')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a role to autorole list')
        .addRoleOption(option => option.setName('role').setDescription('Role to add').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a role from autorole list by ID')
        .addIntegerOption(option => option.setName('id').setDescription('ID of the role to remove').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all autoroles')),

  async execute({ interaction }) {

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return await interaction.reply({ content: 'You must have **Manage Roles** permission to use this command.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    // Fetch or create autorole data
    let autoroleData = await Autorole.findOne({ guildId });
    if (!autoroleData) {
      autoroleData = new Autorole({ guildId, roles: [] });
      await autoroleData.save();
    }

    if (subcommand === 'add') {
      const role = interaction.options.getRole('role');

      if (autoroleData.roles.length >= 5) {
        return interaction.reply('You can only add up to 5 autoroles.');
      }

      if (autoroleData.roles.includes(role.id)) {
        return interaction.reply('This role is already in the autorole list.');
      }

      if (role.position >= interaction.guild.members.me.roles.highest.position) {
        return interaction.reply('You cannot add a role that is equal to or higher than the bot\'s highest role.');
      }

      autoroleData.roles.push(role.id);
      await autoroleData.save();

      const addEmbed = new EmbedBuilder()
        .setTitle('Autorole Added')
        .setDescription(`The role **${role}** has been added to the autorole list and will now be given to new members.`)
        .setColor(color.default)
        .setTimestamp();

      return interaction.reply({ embeds: [addEmbed] });
    }

    if (subcommand === 'remove') {
      const id = interaction.options.getInteger('id');

      if (id < 1 || id > autoroleData.roles.length) {
        return interaction.reply('Invalid ID.');
      }

      const removedRoleId = autoroleData.roles.splice(id - 1, 1)[0];
      const removedRole = interaction.guild.roles.cache.get(removedRoleId);
      await autoroleData.save();
      return interaction.reply(`Removed role ${removedRole} with ID ${id} from autorole list.`);
    }

    if (subcommand === 'list') {
      if (autoroleData.roles.length === 0) {
        return interaction.reply('No autoroles set.');
      }

      const roleList = autoroleData.roles.map((roleId, index) => {
        const role = interaction.guild.roles.cache.get(roleId);
        return `${index + 1}. ${role ? `<@&${role.id}>` : 'Unknown Role'}`;
      }).join('\n');

      const listEmbed = new EmbedBuilder()
        .setTitle('Autorole List')
        .setDescription(roleList)
        .setColor(color.default)
        .setTimestamp();

      return interaction.reply({ embeds: [listEmbed] });
    }
  }
};