const Discord = require('discord.js');
const ms = require('ms');
const client = require(process.cwd() + '/src/index.js');
const { snipes } = require('../index.js');

client.on("messageDelete", async (msg) => {
  // Check if msg.author exists
  if (!msg.author) return;

  // Add message delete event handling logic here
  const userTimestamps = client.messageTimestamps.get(msg.author.id) || [];
  const index = userTimestamps.indexOf(msg.createdTimestamp);
  if (index !== -1) {
    userTimestamps.splice(index, 1);
    client.messageTimestamps.set(msg.author.id, userTimestamps);
  }

  // snipe command
  client.snipes.set(msg.channel.id, {
    content: msg.content,
    author: msg.author,
    image: msg.attachments.first() ? msg.attachments.first().proxyURL : null,
    avatarURL: msg.author.displayAvatarURL({ format: 'png', dynamic: true }),
    timestamp: msg.createdTimestamp
  });
});