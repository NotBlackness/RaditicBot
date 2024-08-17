const { EmbedBuilder } = require('discord.js');
const User = require('../../Schemas/userAccount.js');
const { color, emoji } = require('../../config');

module.exports = {
  usage: "balance",
  name: "balance",
  aliases: ["bal", "wallet"],
  description: "Check your account balance.",
  async execute({msg}) {
    const user = await User.findOne({ userId: msg.author.id });
    if (!user) {
      return msg.reply("It seems like you have not registered an account yet. Use `register` command to create one.");
    } else {
      const balanceEmbed = new EmbedBuilder()
      .setAuthor({ name: `${msg.author.username}`, iconURL: msg.author.displayAvatarURL() })
      .setTitle(`${msg.author.displayName}'s balance`)
      .setDescription(`Balance: **${user.balance.toLocaleString()}** ${emoji.radigem} RG`)
      .setColor(color.default)
      .setTimestamp();

      await msg.reply({ embeds: [balanceEmbed] });
    }
  },
};