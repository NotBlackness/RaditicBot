const { PermissionsBitField, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Manage roles for a user')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a role to a user')
        .addUserOption(option => option.setName('user').setDescription('The user to add the role to').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('The role to add to the user').setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a role from a user')
        .addUserOption(option => option.setName('user').setDescription('The user to remove the role from').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('The role to remove from the user').setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('addall')
        .setDescription('Add a role to everyone in the guild')
        .addRoleOption(option => option.setName('role').setDescription('The role to add to everyone').setRequired(true))
    )
    .addSubcommand(subcommand => 
      subcommand
        .setName('removeall')
        .setDescription('Remove a role from everyone in the guild')
        .addRoleOption(option => option.setName('role').setDescription('The role to remove from everyone').setRequired(true))
    ),

  async execute({ interaction }) {
    const subcommand = interaction.options.getSubcommand();
    const role = interaction.options.getRole('role');

    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: '❌ | I do not have permission to manage roles.', ephemeral: true });
    }

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: '❌ | You do not have permission to manage roles.', ephemeral: true });
    }

    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({ content: '❌ | I could not manage the role as that role is above me in the server hierarchy.', ephemeral: true });
    }

    if (subcommand === 'add') {
      const user = interaction.options.getUser('user');
      const member = interaction.guild.members.cache.get(user.id);

      if (member.roles.cache.has(role.id)) {
        return interaction.reply({ content: '❌ | This user already has that role.', ephemeral: true });
      }

      await member.roles.add(role).catch(err => {
        console.error(err);
        return interaction.reply({ content: '❌ | There was an error adding the role.', ephemeral: true });
      });

      return interaction.reply({ content: `✅ | Successfully added the role <@&${role.id}> to ${user.tag}.`, ephemeral: true });
    }

    if (subcommand === 'remove') {
      const user = interaction.options.getUser('user');
      const member = interaction.guild.members.cache.get(user.id);

      if (!member.roles.cache.has(role.id)) {
        return interaction.reply({ content: '❌ | This user does not have that role.', ephemeral: true });
      }

      await member.roles.remove(role).catch(err => {
        console.error(err);
        return interaction.reply({ content: '❌ | There was an error removing the role.', ephemeral: true });
      });

      return interaction.reply({ content: `✅ | Successfully removed the role <@&${role.id}> from ${user.tag}.`, ephemeral: true });
    }

    if (subcommand === 'addall') {
      const embed = new EmbedBuilder()
        .setDescription(`Giving the role <@&${role.id}> to everyone in this guild...`)
        .setColor('#A020F0')
        .setTimestamp();

      const initialMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

      const members = await interaction.guild.members.fetch();
      const promises = members.map(async member => {
        if (!member.roles.cache.has(role.id)) {
          await member.roles.add(role).catch(console.error);
        }
      });

      await Promise.all(promises);

      const embed2 = new EmbedBuilder()
        .setDescription(`✅ | Successfully given the role <@&${role.id}> to everyone in this guild.`)
        .setColor('#A020F0')
        .setTimestamp();

      await initialMessage.edit({ embeds: [embed2] });
    }

    if (subcommand === 'removeall') {
      const embed = new EmbedBuilder()
        .setDescription(`Removing the role <@&${role.id}> from everyone in this guild...`)
        .setColor('#A020F0')
        .setTimestamp();

      const initialMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

      const members = await interaction.guild.members.fetch();
      const promises = members.map(async member => {
        if (member.roles.cache.has(role.id)) {
          await member.roles.remove(role).catch(console.error);
        }
      });

      await Promise.all(promises);

      const embed2 = new EmbedBuilder()
        .setDescription(`✅ | Successfully removed the role <@&${role.id}> from everyone in this guild.`)
        .setColor('#A020F0')
        .setTimestamp();

      await initialMessage.edit({ embeds: [embed2] });
    }
  },
};