const { emoji } = require('../../config.js');
const Cooldown = require('../../Schemas/CooldownDaily');
const User = require('../../Schemas/userAccount.js');

module.exports = {
  usage: 'daily',
  name: 'daily',
  description: 'Claim your daily RadiGems.',
  async execute({msg}) {
    try {
      const user = await User.findOne({ userId: msg.author.id });

      if (!user) {
      return msg.reply("It seems like you have not registered an account yet. Use `register` command to create one.");
      }

      let cooldown = await Cooldown.findOne({ userId: msg.author.id });
      if (cooldown && cooldown.cooldownExpiration > Date.now()) {
        const remainingTime = cooldown.cooldownExpiration - Date.now();
        const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
        const seconds = Math.floor((remainingTime / 1000) % 60);

        const timeLeftFormatted = `**${hours}** hours, **${minutes}** minutes, **${seconds}** seconds.`;
        return await msg.reply(`You have already claimed your daily, come back after ${timeLeftFormatted}`);
      }

      const randomReward = Math.floor(Math.random() * 4501) + 1000; // Random reward between 100 and 4500
      user.balance += randomReward;
      await user.save();

      const newCooldown = {
        userId: msg.author.id,
        cooldownExpiration: Date.now() + 24 * 60 * 60 * 1000,
      };

      cooldown = await Cooldown.findOneAndUpdate(
        { userId: msg.author.id },
        newCooldown,
        { upsert: true, new: true }
      );

      await msg.reply(`You have claimed your daily ${emoji.radigem} **${randomReward.toLocaleString()} RadiGems**.`)
    } catch (err) {
      console.error('Daily Reward Error', err);
      msg.reply('An error ocurred while processing your daily.');
    }
  },
};