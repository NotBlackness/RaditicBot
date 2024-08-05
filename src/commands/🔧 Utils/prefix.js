// prefix.js
const { getPrefix, bannedPrefix } = require('../../config.js');
const prefixSchema = require('../../Schemas/prefixSchema');
const { PermissionsBitField } = require('discord.js');

module.exports = {
  usage: 'prefix [new_prefix]',
  name: 'prefix',
  description: 'Change the bot prefix or check the bots current prefix.',
  async execute({ args, msg }) {
    const currentPrefix = await getPrefix(msg.guild.id);
    const newPrefix = args[0];
    if (!newPrefix) {
      return msg.reply(`The current prefix for this server is: \`\`${currentPrefix}\`\``);
    }

    const formattedPrefix = newPrefix.toLowerCase(); // Convert the provided prefix to lowercase

    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return msg.reply('You do not have admin permission to use this command.');
    }

    
    try {
      
        let prefixData = await prefixSchema.findOne({ guildId: msg.guild.id });

      if (!prefixData) {
        prefixData = await prefixSchema.create({
          guildId: msg.guild.id,
          prefix: formattedPrefix // Save the lowercase prefix
        });
      } else {
        if (prefixData.prefix === formattedPrefix) {
          return msg.reply(`The prefix "${formattedPrefix}" is already set in this server.`);
        }
      }

      prefixData.prefix = formattedPrefix; // Save the lowercase prefix
      await prefixData.save();

      return msg.reply(`Prefix has been changed to: \`\`${formattedPrefix}\`\``);
    } catch (error) {
      console.error('Error changing prefix:', error);
      return msg.reply('An error occurred while changing the prefix.');
    }
  },
};