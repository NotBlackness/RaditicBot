const client = require(process.cwd() + '/src/index.js');
const reactions = require('../Schemas/reactionroleSchema');

client.on('messageReactionAdd', async (reaction, user) => {
  if (!reaction.message.guildId) return;
  if (user.bot) return;

  let cID = `<a:${reaction.emoji.name}:${reaction.emoji.id}>`;

  if (!reaction.emoji.id) cID = reaction.emoji.name;

  const data = await reactions.findOne({ guildId: reaction.message.guildId, messageId: reaction.message.id, Emoji: cID });

  if (!data) return;


  const guild = client.guilds.cache.get(reaction.message.guildId);
  const member = guild.members.cache.get(user.id);

  try {
    await member.roles.add(data.Role);
  } catch (e) {
    console.error('Error occured Reaction Role', e)
  } 
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (!reaction.message.guildId) return;
  if (user.bot) return;

  let cID = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;

  if (!reaction.emoji.id) cID = reaction.emoji.name;

  const data = await reactions.findOne({ guildId: reaction.message.guildId, messageId: reaction.message.id, Emoji: cID });

  if (!data) return;


  const guild = client.guilds.cache.get(reaction.message.guildId);
  const member = guild.members.cache.get(user.id);

  try {
    await member.roles.add(data.Role);
  } catch (e) {
    console.error('Error occured Reaction Role', e)
  } 
});
