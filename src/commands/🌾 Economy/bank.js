const UserAccount = require('../../Schemas/userAccount');
const Bank = require('../../Schemas/bankSchema');
const { emoji } = require('../../config.js');

module.exports = {
  usage: 'bank <balance/withdraw <amount>/deposit <amount>>',
  name: 'bank',
  description: 'Manage your bank account.',
  async execute({ msg, args }) {
    const user = await UserAccount.findOne({ userId: msg.author.id });
    if (!user) {
      return msg.reply("It seems like you have not registered an account yet. Use `register` command to create one.");
    }

    if (!args[0]) {
      return msg.reply('Please specify a subcommand: `balance`, `deposit <amount>`, `withdraw <amount>`.');
    }

    const subcommand = args[0].toLowerCase();

    if (subcommand === 'balance') {
      try {
        const bank = await Bank.findOne({ userId: msg.author.id });
        const bankBalance = bank ? (bank.balance || 0) : 0;

        msg.reply(`Your bank balance is ${emoji.radigem} **__${bankBalance.toLocaleString()}__ RadiGem**.`);
      } catch (error) {
        console.error('Bank error', error);
        msg.reply('An error occurred while checking your bank balance!');
      }
    } else if (subcommand === 'withdraw') {
      try {
        const amount = parseInt(args[1]);

        if (isNaN(amount) || amount <= 0) {
          return msg.reply('Please enter a valid amount to withdraw.');
        }

        let bank = await Bank.findOne({ userId: msg.author.id });
        if (!bank) {
          bank = new Bank({ userId: msg.author.id, userName: msg.author.username, balance: 0 });
        }

        if (amount > bank.balance) {
          return msg.reply(`You don't have enough ${emoji.radigem} RadiGem in your bank to withdraw.`);
        }

        user.balance += amount;
        bank.balance -= amount;

        await user.save();
        await bank.save();

        msg.reply(`**${msg.author.username}**, you successfully withdrew ${emoji.radigem} **__${amount.toLocaleString()}__ RadiGem** from your bank.`);
      } catch (error) {
        console.error(error);
        msg.reply('An error occurred while executing this command.');
      }
    } else if (subcommand === 'deposit') {
      try {
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) {
          return msg.reply('Please enter a valid amount to deposit.');
        }

        const userBalance = user.balance;
        if (amount > userBalance) {
          return msg.reply(`You don't have enough ${emoji.radigem} RadiGem to deposit.`);
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

        return msg.reply(`${msg.author.username}, you successfully deposited ${emoji.radigem} **__${amount.toLocaleString()}__ RadiGem** to your bank.`);
      } catch (error) {
        console.error(error);
        msg.reply('An error occurred while executing this command.');
      }
    } else {
      return msg.reply('Invalid subcommand. Please use one of the following: `balance`, `deposit <amount>`, `withdraw <amount>`.');
    }
  },
};