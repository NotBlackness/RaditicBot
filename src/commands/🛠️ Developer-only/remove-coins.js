const { emoji, mainOwnerId } = require('../../config');
const User = require('../../Schemas/userAccount.js');

module.exports = {
  name: 'remove-coins',
  aliases: ['rc'],
  description: 'Remove coins from a user',
  async execute({ msg, args, client }) {
    if (!mainOwnerId.includes(msg.author.id)) return;
    // Ensure the user is mentioned or fetch by ID
    const user = msg.mentions.members.first() || await client.users.fetch(args[0]);

    if (!user) return msg.reply('Please provide a valid user to remove coins.');
    // Define the maximum limit for removal
    const maxLimit = 10000000;
    // Parse the amount from arguments
    const amount = parseInt(args[1]);

    // Check if the amount is valid
    if (!amount || amount < 0 || amount > maxLimit) {
      return msg.reply(`Please provide a valid amount of coins. You can remove 1 to ${maxLimit.toLocaleString()} ${emoji.radigem} RG coins.`);
    }

    // Fetch the user's balance from the database
    const existingUser = await User.findOne({ userId: user.id });
    // Check if the user has an account
    if (!existingUser) return msg.reply(`**${user.displayName}** doesn't have an account yet.`);

    // Update the user's balance by decrementing the specified amount
    await User.updateOne({ userId: user.id }, { $inc: { balance: -amount } });

    // Notify the user of the successful removal of coins
    msg.reply(`Successfully removed *__${amount.toLocaleString()}__** ${emoji.radigem} RG coins from **${user.displayName}**'s balance.`);
    
  },
};