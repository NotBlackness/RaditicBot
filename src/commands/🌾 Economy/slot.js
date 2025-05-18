const { EmbedBuilder } = require('discord.js');
const User = require('../../Schemas/userAccount');
const Cooldown = require('../../Schemas/CooldownSlot');
const { emoji, color } = require('../../config.js');

module.exports = {
  usage: 'slot <amount>',
  name: 'slot',
  description: 'Play a slot machine game.',
  async execute({ msg, args }) {
    try {
      const existingUser = await User.findOne({ userId: msg.author.id });

      if (!existingUser) {
      return msg.reply("It seems like you have not registered an account yet. Use `register` command to create one.");
      }

      const cooldown = await Cooldown.findOne({ userId: msg.author.id });

      if (cooldown && cooldown.cooldownExpiration > Date.now()) {
        const timeLeft = Math.floor((cooldown.cooldownExpiration - Date.now()) / 1000); // Convert to seconds

        // Send cooldown message with remaining time using Discord time formatting
        return msg.reply(`⏳ | **${msg.author.displayName}**, Hang tight! You can use this command again **<t:${Math.floor(Date.now() / 1000) + timeLeft}:R>**.`).then((message) => {
          setTimeout(() => {
            message.delete();
          }, 3000)
        });
      }

      const timeout = 20000; // 20 seconds in milliseconds

      if (!args[0]) {
        return msg.reply(`Wrong argument! Usage: \`\`slot <amount>\`\``);
      }

      const user = msg.author;
      let amount = args[0].toLowerCase() === 'all' ? (await User.findOne({ userId: user.id })).balance : parseInt(args[0]);

      amount = Math.min(amount, 250000);

      if (isNaN(amount) || amount <= 0) {
        return msg.reply('Amount must be a positive number');
      }

      const fruits = ['🍎', '🍇', '🍒', '🍓'];

      const currentBalance = existingUser.balance;

      if (currentBalance < amount) {
        return msg.reply(`You don't have enough ${emoji.radigem} RadiGems to make that bet`);
      }


      const outcome = [];
      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * fruits.length);
        outcome.push(fruits[randomIndex]);
      }

      const winnings = calculateWinnings(outcome, amount);

      if (winnings > 0) {
        existingUser.balance += winnings;
        existingUser.save();
      } else {
        // Deduct the bet amount from user's balance
        existingUser.balance -= amount;
        existingUser.save();
      }

      const outcomeMessage = new EmbedBuilder()
        .setTitle('Slot Machine')
        .setColor(color.default)
        .setTimestamp()
        .setDescription(`[${outcome[0]}] [${outcome[1]}] [${outcome[2]}]\nYou bet ${emoji.radigem} **${amount.toLocaleString()} RadiGems** and...`);

      const sentMessage = await msg.reply({ embeds: [outcomeMessage] });

      // Randomizing the outcome after 5 seconds
      let interval;
      setTimeout(async () => {
        clearInterval(interval); // Stop the scrolling animation

        const result = outcome.map(fruit => `[${fruit}]`).join(' ');

        if (winnings > 0) {
          outcomeMessage.setDescription(`${result}\nCongratulations! You won ${emoji.radigem} **${winnings.toLocaleString()} RadiGems** :D`);
        } else {
          outcomeMessage.setDescription(`${result}\nYou lost ${emoji.radigem} **${amount.toLocaleString()} RadiGems**! Better luck next time :c`);
        }

        await sentMessage.edit({ embeds: [outcomeMessage] });
      }, 5000);

      // Updating the slot machine every second until outcome is determined
      let index = 0;
      interval = setInterval(() => {
        index = (index + 1) % fruits.length;
        const newSlot = `[${fruits[index]}] [${fruits[(index + 1) % fruits.length]}] [${fruits[(index + 2) % fruits.length]}]\nYou bet ${emoji.radigem} **${amount.toLocaleString()} RadiGems** and...`;
        outcomeMessage.setDescription(newSlot);
        sentMessage.edit({ embeds: [outcomeMessage] });
      }, 1000);

      // Set cooldown
      await Cooldown.findOneAndUpdate({ userId: user.id }, { cooldownExpiration: Date.now() + timeout }, { upsert: true, new: true });

    } catch (error) {
      console.error(error);
      msg.reply('An error occurred while processing your request.');
    }
  },
};

function calculateWinnings(outcome, betAmount) {
  const strawberryProbability = 0.05;
  const strawberryMultiplier = 4;
  const otherFruitsMultiplier = 2;

  // Check if all three fruits are the same
  if (outcome[0] === outcome[1] && outcome[1] === outcome[2]) {
    if (outcome[0] === '🍓' && Math.random() < strawberryProbability) {
      return betAmount * strawberryMultiplier;
    } else {
      return betAmount * otherFruitsMultiplier;
    }
  } else {
    return 0;
  }
}