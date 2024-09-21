const User = require('../../Schemas/userAccount.js');
const Bank = require('../../Schemas/bankSchema.js');
const { emoji } = require('../../config.js');

module.exports = {
  usage: "deposit <amount>",
  name: "deposit",
  description: "Deposit RadiGems into your bank account.",
  async execute({ msg, args }) {
    try {
      const user = await User.findOne({ userId: msg.author.id });
      if (!user) {
        return msg.reply("It seems like you have not registered an account yet. Use the `register` command to create one.");
      }

      let amount = parseInt(args[0]);
      if (isNaN(amount) || amount <= 0) {
        return msg.reply('Please enter a valid amount to deposit.');
      }

      const userBalance = user.balance;

      if (amount > userBalance) {
        amount = userBalance;  // Cap the deposit to the user's available balance if they try to deposit more
      }

      let bank = await Bank.findOne({ userId: msg.author.id });
      if (!bank) {
        bank = new Bank({
          userId: msg.author.id,
          userName: msg.author.username,
          balance: 0,
        });
      }

      user.balance -= amount;
      bank.balance += amount;

      await user.save();
      await bank.save();

      return msg.reply(`${msg.author.username}, you successfully deposited ${emoji.radigem} **__${amount.toLocaleString()} RadiGem** to your bank.`);
    } catch (error) {
      console.error(error);
      msg.reply('An error occurred while executing this command.');
    }
  },
};