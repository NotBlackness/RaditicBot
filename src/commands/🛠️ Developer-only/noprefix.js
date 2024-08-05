const noPrefixSchema = require('../../Schemas/noPrefixSchema');
const { EmbedBuilder } = require('discord.js');
const { mainOwnerId, color } = require('../../config');

module.exports = {
  name: 'noprefix',
  aliases: ['np', 'no-prefix'],
  description: 'Manage no prefix users',
  async execute({ msg, args }) {
    if (msg.author.id !== mainOwnerId) return;

    if (!args[0]) {
      return msg.reply('Please provide a valid subcommand: `add`, `remove`, `list`').then((reply) => {
        setTimeout(() => {
          reply.delete();
        }, 3000);
      });
    }

    const subcommand = args[0].toLowerCase();

    if (subcommand === 'add') {
      if (args.length < 2) {
        return msg.reply('Please mention a user to add.').then((reply) => {
          setTimeout(() => {
            reply.delete();
          }, 3000);
        });
      }

      const replacedArg = args[1].replace(/[<@!>]/g, '');
      const user = await msg.guild.members.fetch(replacedArg).catch(() => null);

      if (!user) {
        return msg.reply('Could not find that user. Please mention a valid user.').then((reply) => {
          setTimeout(() => {
            reply.delete();
          }, 3000);
        });
      }

      try {
        const existingUser = await noPrefixSchema.findOne({ userId: user.id });

        if (existingUser) {
          return msg.reply('User is already in the no-prefix list.').then((reply) => {
            setTimeout(() => {
              reply.delete();
            }, 3000);
          });
        }

        const newUser = new noPrefixSchema({ userId: user.id });
        await newUser.save();
        msg.reply(`Successfully added ${user.user.tag} to the no-prefix list.`).then((reply) => {
          setTimeout(() => {
            reply.delete();
          }, 3000);
        });
      } catch (error) {
        msg.reply("An error occurred.").then((reply) => {
          setTimeout(() => {
            reply.delete();
          }, 3000);
        });
        console.error(error);
      }
    } else if (subcommand === 'remove') {
      if (args.length < 2) {
        return msg.reply('Please mention a user to remove.').then((reply) => {
          setTimeout(() => {
            reply.delete();
          }, 3000);
        });
      }

      const replacedArg = args[1].replace(/[<@!>]/g, '');
      const user = await msg.guild.members.fetch(replacedArg).catch(() => null);

      if (!user) {
        return msg.reply('Could not find that user. Please mention a valid user.').then((reply) => {
          setTimeout(() => {
            reply.delete();
          }, 3000);
        });
      }

      try {
        const removedUser = await noPrefixSchema.findOneAndDelete({ userId: user.id });

        if (!removedUser) {
          return msg.reply('User is not in the no-prefix list.').then((reply) => {
            setTimeout(() => {
              reply.delete();
            }, 3000);
          });
        }

        msg.reply(`Successfully removed ${user.user.tag} from the no-prefix list.`).then((reply) => {
          setTimeout(() => {
            reply.delete();
          }, 3000);
        });
      } catch (error) {
        msg.reply("An error occurred.").then((reply) => {
          setTimeout(() => {
            reply.delete();
          }, 3000);
        });
        console.error(error);
      }
    } else if (subcommand === 'list') {
      try {
        const users = await noPrefixSchema.find({});
        if (users.length === 0) {
          return msg.reply("The no-prefix list is empty.").then((reply) => {
            setTimeout(() => {
              reply.delete();
            }, 3000);
          });
        }

        const userList = users.map(user => `<@${user.userId}>`).join('\n');

        const DMEmbed = new EmbedBuilder()
          .setTitle('No Prefix Users')
          .setDescription(userList)
          .setColor(color.default);

        // Send embed to the main owner
        const owner = await msg.client.users.fetch(mainOwnerId);
        if (owner) owner.send({ embeds: [DMEmbed] });

        msg.reply("A message to your DM has been sent.").then((reply) => {
          setTimeout(() => {
            reply.delete();
          }, 3000);
        });
      } catch (error) {
        msg.reply("An error occurred.").then((reply) => {
          setTimeout(() => {
            reply.delete();
          }, 3000);
        });
        console.error(error);
      }
    } else {
      msg.reply('Invalid subcommand. Please use `add`, `remove`, or `list`.').then((reply) => {
        setTimeout(() => {
          reply.delete();
        }, 3000);
      });
    }
  },
};