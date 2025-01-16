const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../../Schemas/userAccount.js');
const { color } = require('../../config');

module.exports = {
  usage: "delete-account",
  name: "delete-account",
  description: "Delete your Raditic Bot account and all associated data.",
  async execute({ msg }) {
    try {
      const existingUser = await User.findOne({ userId: msg.author.id });

      if (!existingUser) {
        return msg.reply("You do not have an account to delete!");
      }

      const confirmEmbed = new EmbedBuilder()
        .setTitle('Account Deletion Confirmation')
        .setColor(color.red)
        .setDescription(
          "⚠️ **Are you sure you want to delete your account?**\n" +
          "This action is irreversible and will delete all your RadiGems (RG), inventory, and progress.\n\n" +
          "If you are certain, press the 'Confirm' button below. Otherwise, press 'Decline' to cancel."
        )
        .setTimestamp();

      const confirmButton = new ButtonBuilder()
        .setCustomId("confirm_delete")
        .setLabel("Confirm")
        .setEmoji("🗑️")
        .setStyle(ButtonStyle.Danger);

      const declineButton = new ButtonBuilder()
        .setCustomId("decline_delete")
        .setLabel("Decline")
        .setEmoji("❌")
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(confirmButton, declineButton);

      const confirmMessage = await msg.reply({
        embeds: [confirmEmbed],
        components: [row],
      });

      const filter = (i) =>
        ["confirm_delete", "decline_delete"].includes(i.customId) && i.user.id === msg.author.id;

      const collector = confirmMessage.createMessageComponentCollector({
        filter,
        time: 180000,
      });

      collector.on('collect', async (i) => {
        if (msg.author.id !== i.user.id) {
          return i.reply({ content: "You can't use these buttons!", ephemeral: true });
        }

        if (i.customId === "confirm_delete") {
          await i.update({
            embeds: [confirmEmbed],
            components: [],
          });

          await User.deleteOne({ userId: i.user.id });

          const successMessage = "✅ | Your account has been successfully deleted. We're sorry to see you go!";
          await i.followUp({ content: successMessage, embeds: [] });
        } else if (i.customId === "decline_delete") {
          await i.update({
            content: "❌ | Account deletion canceled. Your progress is safe!",
            embeds: [],
            components: [],
          });
        }

        collector.stop();
      });

      collector.on('end', async (collected) => {
        if (collected.size === 0) {
          await confirmMessage.edit({
            embeds: [confirmEmbed],
            components: [],
          });
          msg.channel.send("You did not respond to the account deletion prompt in time!");
        }
      });
    } catch (err) {
      console.error("Error occurred", err);
      msg.reply("An error occurred while trying to delete your account!");
    }
  },
};