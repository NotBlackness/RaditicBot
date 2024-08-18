const User = require('../../Schemas/userAccount.js');
const Bank = require('../../Schemas/bankSchema.js');
const { emoji } = require('../../config.js');

module.exports = {
  usage: "withdraw <amount>",
  name: "withdraw",
  description: "Withdraw RadiGems from your bank account.",
  async execute({ msg, args }) {
    try {
      const user = await User.findOne({ userId: msg.author.id });
      if (!user) {
        return msg.reply("It seems like you have not registered an account yet. Use the `register` command to create one.");
      }

      let amount;

      if (args[0].toLowerCase() === "all") {
        amount = 250000;  // Withdraw the maximum allowed amount
      } else {
        amount = parseInt(args[0]);

        if (isNaN(amount) || amount <= 0) {
          return msg.reply('Please enter a valid amount to withdraw.');
        }

        if (amount > 250000) {
          amount = 250000;  // Cap the withdrawal to 250,000 if the user tries to withdraw more
        }
      }

      let bank = await Bank.findOne({ userId: msg.author.id });
      if (!bank) {
        bank = new Bank({ userId: msg.author.id, userName: msg.author.username, balance: 0 });
      }

      if (amount > bank.balance) {
        return msg.reply(`You don't have enough ${emoji.radigem} RadiGem in your bank to withdraw ${amount.toLocaleString()} RadiGems.`);
      }

      user.balance += amount;
      bank.balance -= amount;

      await user.save();
      await bank.save();

      msg.reply(`**${msg.author.username}**, you successfully withdrew ${emoji.radigem} **${amount.toLocaleString()} RadiGems** from your bank.`);
    } catch (error) {
      console.error(error);
      msg.reply('An error occurred while executing this command.');
    }
  },
};