const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../../Schemas/userAccount.js');
const { color, emoji } = require('../../config');

module.exports = {
  usage: "register",
  name: "register",
  description: "Register an account to start earning RG!",
  async execute({ msg }) {
    try {
      const existingUser = await User.findOne({ userId: msg.author.id });

      if (existingUser) {
        return msg.reply("You already have an account registered!");
      } else {
        const reward = 1000;
        
        const termsEmbed = new EmbedBuilder()
          .setTitle('Terms and Services')
          .setColor(color.default)
          .setDescription('By using the Raditic Bot, you agree to the following terms: RadiGems (RG) is the virtual currency within the Raditic Bot economy, intended solely for in-bot activities and has no real-world value. Users earn RG through various actions and may spend it on in-bot items or privileges. Any attempt to exploit, manipulate, or engage in unauthorized trading of RG is strictly prohibited and may result in penalties, including loss of RG or account suspension. The bot owner reserves the right to modify the economy system, including earning rates and available items, at any time without notice. The Raditic Bot is provided "as-is," and the bot owner is not liable for any losses or damages arising from its use. Continued use of the bot constitutes acceptance of these terms.\n\nIf you have any questions or concerns, feel free to join our [Support Server](https://discord.gg/reyZznSqqx) and ask for any assistance.')
          .setTimestamp();

        const acceptButton = new ButtonBuilder()
          .setCustomId("accept_terms")
          .setLabel("Accept")
          .setEmoji("✅")
          .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(acceptButton);

        const termsMessage = await msg.reply({
          embeds: [termsEmbed],
          components: [row],
        });

        const filter = (i) => i.customId === "accept_terms" && i.user.id === msg.author.id;

        const collector = termsMessage.createMessageComponentCollector({
          filter,
          time: 10000,
        });

        collector.on('collect', async (i) => {
          if (msg.author.id !== i.user.id) {
            return i.reply("You can't use these buttons!");
          }

          await i.update({
            embeds: [termsEmbed],
            components: [],
          });

          const newUser = new User({
            userId: i.user.id,
            userName: i.user.username,
            balance: reward,
          });

          await newUser.save();

          const successMessage = `🎉 | Your journey has started! You have been given ${emoji.radigem} ${reward.toLocaleString()} RG as a welcome gift.`;

          await i.followUp({ content: successMessage, embeds: [] });
          collector.stop();
        });

        collector.on('end', async (collected) => {
          if (collected.size === 0) {
            await termsMessage.edit({
              embeds: [termsEmbed],
              components: [],
            });
            msg.channel.send("You did not accept the terms within the given time!");
          }
        });
      }
    } catch (err) {
      console.error("Error occurred", err);
      msg.reply("An error occurred while creating your account!");
    }
  },
};