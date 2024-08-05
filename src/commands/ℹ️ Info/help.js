// commands/help.js
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { color, emoji, getPrefix } = require('../../config');

module.exports = {
  usage: 'help',
  name: 'help',
  description: 'Shows list of available commands',
  async execute({ msg, client }) {
    const customEmojis = {
      // all custom emojis to help embed
      "MiniGames": "1245777255683063942",
      "Moderation": "1245777326323535936",
      "Utils": "1245777409005850688",
      "Info": "1245777371689255034",
      "homepage": "1245777449149796445"
    };

    const prefix = await getPrefix(msg.guild.id);
    const commands = client.commands.map(command => command);
    const commandNames = [];
    const categories = [];

    for (const command of commands) {
      commandNames.push(`\`${command.name}\``);

      if (command.category.includes('🛠️ Developer-only')) continue;
      const name = command.category.split(' ')[1];
      const guildEmoji = client.emojis.cache.get(customEmojis[name]);
      const emoji = (guildEmoji ? { name: guildEmoji.name, id: guildEmoji.id, animated: guildEmoji.animated } : false) || { name: command.category.split(' ')[0] } || { name: '❔' };
      if (categories.find(category => category.name === name)) continue;
      categories.push({ name, emoji });
    }

    const embeds = [];
    for (const category of categories) {
      const commandsInCategory = commands.filter(command => command.category.split(' ')[1] === category.name);
      const commandList = commandsInCategory.map(command => ({ name: `${command.name} | \`\`${prefix}${command.usage}\`\``, value: command.description || 'No description', inline: false }));
      const categoryEmbed = new EmbedBuilder()
        .setColor(`${color.default}`)
        .setTitle(`${category.emoji.id ? `<${category.emoji.animated ? 'a' : ''}:${category.emoji.name}:${category.emoji.id}>` : category.emoji.name} ${category.name} Commands`)
        .setDescription(`> ${emoji.search} **__Available ${category.name} commands list__**`)
        .setAuthor({
          name: msg.guild.name,
          iconURL: msg.guild.iconURL({ dynamic: true })
        })
        .setFooter({ text: `Requested by ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL({ dynamic: true }) })
        .addFields(commandList)
        .setTimestamp();
      embeds.push(categoryEmbed);
    }

    const homepageEmoji = client.emojis.cache.get(customEmojis['homepage']);
    const options = [{ label: 'HomePage', description: 'Back to HomePage', emoji: (homepageEmoji ? { name: homepageEmoji.name, id: homepageEmoji.id, animated: homepageEmoji.animated } : false) || { name: '🏠' }, value: 'homepage' }, ...categories.map(({ name, emoji }, index) => {
      const data = {
        label: name,
        description: `Bot's ${name} commands`,
        emoji,
        value: `${index}`
      };
      return data;
    })];

    const row = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('helpCommand')
          .setPlaceholder('Select a category')
          .addOptions(options)
      );

    const helpEmbed = new EmbedBuilder()
      .setColor(`${color.default}`)
      .setTitle('Help Menu')
      .setAuthor({
        name: msg.guild.name,
        iconURL: msg.guild.iconURL({ dynamic: true })
      })
      .setFooter({ text: `Requested by ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL({ dynamic: true }) })
      .setDescription(`${emoji.dot} *An all-in-one Discord bot to enhance your server with versatile features and interactive fun.*\n\n**\`\`\`<> - Required Arguments | [] - Optional Arguments\`\`\`**\n\n${emoji.search} **__My Available Commands Category__**\n> ${(homepageEmoji ? `<${homepageEmoji.animated ? 'a' : ''}:${homepageEmoji.name}:${homepageEmoji.id}>` : '🏠')} : **HomePage**\n> ${categories.map(({ name, emoji }) => `${emoji.id ? `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>` : emoji.name} : **${name}**`).join('\n> ')}\n\n**Links:**\n__[Invite Me](https://discord.com/oauth2/authorize?client_id=1233698268584870010&permissions=8&scope=bot+applications.commands)__ • __[Support Server](https://discord.com/invite/xwG8rtzmzA)__ • __[Top.gg](https://top.gg/bot/1233698268584870010)__ • __[Website](https://raditic-bot.netlify.app/)__`)
      .setTimestamp();

    const response = await msg.channel.send({ embeds: [helpEmbed], components: [row] });
    try {
      const collector = response.createMessageComponentCollector({ time: 480000 });
      collector.on('collect', async i => {
        if (i.customId !== 'helpCommand') return;
        if (i.user.id !== msg.author.id) return i.reply({ content: `That's not your help menu! Create one with \`\`${prefix}help\`\``, ephemeral: true });
        const value = i.values[0];
        if (value !== 'homepage') {
          await i.update({ embeds: [embeds[value]], components: [row] });
        } else if (value === 'homepage') {
          await i.update({ embeds: [helpEmbed], components: [row] });
        }
      });
      collector.on('end', async () => {
        try {
          await response.edit({ content: 'Help menu timed out. Try using r.help again.', components: [] });
        } catch (error) {
          console.error('Error updating message:', error);
        }
      });
    } catch (error) {
      console.error(error);
    }
  },
};