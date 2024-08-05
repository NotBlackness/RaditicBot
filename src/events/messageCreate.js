const { getPrefix, ownerIds } = require('../config');
const Discord = require('discord.js');
const client = require(process.cwd() + '/src/index.js');
const schema = require('../Schemas/autoresponder');
const afkSchema = require('../Schemas/afkSchema');
const counting = require('../Schemas/countingSchema');
const noPrefixSchema = require('../Schemas/noPrefixSchema');

client.on("messageCreate", async msg => {
  if (!msg.content || msg.author.bot || !msg.guild) return;

  const currentPrefix = await getPrefix(msg.guild.id);
  const botMention = `<@${client.user.id}>`;
  const botMentionWithExclamation = `<@!${client.user.id}>`;

  if (msg.content === botMention || msg.content === botMentionWithExclamation) {
    return msg.reply(`Who pinged me? Oh hey **${msg.author.username}**! My prefix for this server is **${currentPrefix}**. Type r.help for more information.`);
  }

  // AutoResponder
  const data = await schema.findOne({ guildId: msg.guild.id });
  if (data) {
    for (const d of data.autoresponses) {
      if (msg.content.toLowerCase().includes(d.trigger.toLowerCase())) {
        await msg.reply(d.response);
        break; // Ensure it stops processing further once an autoresponse is triggered
      }
    }
  }

  // AFK System
  const check1 = await afkSchema.findOne({
    Guild: msg.guild.id,
    User: msg.author.id,
  });

  if (check1) {
    await afkSchema.deleteMany({
      Guild: msg.guild.id,
      User: msg.author.id,
    });

    await msg.reply({
      content: `Welcome back, ${msg.author}! I have removed your AFK.`,
    });
  } else {
    const mentionedUsers = msg.mentions.users;

    mentionedUsers.forEach(async (user) => {
      const Data = await afkSchema.findOne({
        Guild: msg.guild.id,
        User: user.id,
      });

      if (Data) {
        const reason = Data.Reason || "I'm AFK!";
        await msg.reply({
          content: `${user.tag} is currently AFK! - Reason: **${reason}**`,
        });
      }
    });
  }

  // Counting system
  const countingData = await counting.findOne({ Guild: msg.guild.id });
  if (countingData) {
    if (msg.channel.id === countingData.Channel) {
      const number = Number(msg.content);

      if (number !== countingData.Number) {
        return msg.react('❌');
      } else if (countingData.LastUser === msg.author.id) {
        msg.react('❌');
        await msg.reply('❌ Someone else has to count that number!');
      } else {
        msg.react('✅');

        countingData.LastUser = msg.author.id;
        countingData.Number++;
        await countingData.save();
      }
    }
  }

  // Prefix system
  let messageContent = msg.content;
  let prefixLength = null;

  const noPrefixUser = await noPrefixSchema.findOne({ userId: msg.author.id });
  let commandName, args;

    if (messageContent.startsWith(botMention) || messageContent.startsWith(botMentionWithExclamation)) prefixLength = messageContent.startsWith(botMention) ? botMention.length : botMentionWithExclamation.length;
    if (!prefixLength && messageContent.toLowerCase().startsWith("r.")) prefixLength = "r.".length;
    if (!prefixLength && messageContent.toLowerCase().startsWith(currentPrefix.toLowerCase())) prefixLength = currentPrefix.length;
  
  if (prefixLength) {
    messageContent = msg.content.slice(prefixLength).trim();
    args = messageContent.split(/ +/);
    commandName = args.shift().toLowerCase();
  } else if (noPrefixUser) {
    const messageArray = messageContent.trim().split(/ +/);
    commandName = messageArray.shift().toLowerCase();
    args = messageArray;
  } else {
    return;
  }

  const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
  if (command) {
    try {
      await command.execute({ client, Discord, args, prefix: currentPrefix, msg });
    } catch (error) {
      console.error('Error executing command:', error);
      return msg.reply('There was an error executing that command!');
    }
  } else {
    console.log(`Command not found: ${commandName}`);
  }
});