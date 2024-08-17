const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const User = require('../../Schemas/userAccount.js');
const { emoji, color } = require('../../config.js');

module.exports = {
  usage: 'give <@user> <amount>',
  name: 'give',
  description: 'Give CP coins to another user',
  async execute({ client, msg, args }) {
    const user = await User.findOne({ userId: msg.author.id });
    
    if (!user) {
      return msg.reply(``);
    }
    if (!args[0] || !args[1]) {
      return msg.reply('Please provide the user mentioned and the amount to give.');
    }

    const member = msg.mentions.members.first();

    if (!member) {
      return msg.reply('User not found.');
    }
    if (member.id === msg.author.id) {
      return msg.reply("You can't give RadiGems to yourself.");
    }
    if (member.user.bot) {
      return msg.reply("You can't give RadiGems to bots.");
    }

    const amount = parseInt(args[1]);
    if (isNaN(amount) || amount <= 0 || amount > 1000000) {
      return msg.reply('Invalid amount. Please provide a valid amount..');
    }

    if (user.balance < amount) {
      return msg.reply(`You don't have enough ${emoji.radigem} RadiGems to give.`);
    }

    const targetUser = await User.findOne({ userId: member.user.id });
    if (!targetUser) {
      return msg.reply('Target user doesn\'t have an account yet.');
    }

    const confirmRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_give')
          .setLabel('Confirm')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅'),
        new ButtonBuilder()
          .setCustomId('cancel_give')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('❌'),
      );

    const confirmEmbed = new EmbedBuilder()
      .setTitle('Give Confirmation')
      .setColor(color.default)
      .setDescription(`${msg.author}, are you sure you want to give ${emoji.radigem} **__${amount.toLocaleString()}__ RadiGems** to ${member}? You can't undo it later.`);

    const confirmMsg = await msg.reply({
      embeds: [confirmEmbed],
      components: [confirmRow],
    });

    const filter = i => i.user.id === msg.author.id;
    const collector = confirmMsg.createMessageComponentCollector({ filter, time: 180000 });

    collector.on('collect', async i => {
      if (i.customId === 'confirm_give') {
        user.balance -= amount;
        targetUser.balance += amount;
        await user.save();
        await targetUser.save();
        await i.update({
          content: `${member}, ${msg.author} gave you ${emoji.radigem} **__${amount.toLocaleString()}__** RadiGems!**`,
          components: [],
          embeds: [],
        });
      } else if (i.customId === 'cancel_give') {
        await i.update({
          content: 'Give command cancelled.',
          components: [],
          embeds: [],
        });
      }
      collector.stop();
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        confirmMsg.edit({
          content: 'Give command timed out. Please try again.',
          components: [],
        });
      }
    });
  },
};