const { TicTacToe } = require('discord-gamecord');
const { color } = require('../../config');

module.exports = {
  usage: 'tic-tac-toe <@opponent>',
  name: 'tic-tac-toe',
  aliases: ['ttt'],
  description: 'Play a Tic Tac Toe game.',
  async execute({ msg, args }) {
    // Check if an opponent was mentioned
    const replacedArg = args[0].replace(/[<@!>]/g, '');
    const opponent = msg.guild.members.cache.get(replacedArg);
    if (!opponent || opponent.user.bot || opponent.id === msg.author.id) {
      return msg.reply('Please mention a valid opponent (a user, not a bot, and not yourself) to start a Tic Tac Toe game.');
    }

    const Game = new TicTacToe({
      message: msg,
      opponent: opponent.user,
      embed: {
        title: 'Tic Tac Toe',
        color: `${color.default}`,
        statusTitle: 'Status',
        overTitle: 'Game Over'
      },
      emojis: {
        xButton: '❌',
        oButton: '⭕',
        blankButton: '⬛'
      },
      mentionUser: true,
      timeoutTime: 60000,
      xButttonStyle: 'DANGER',
      oButtonStyle: 'PRIMARY',
      turnMessage: '{emoji} | It\'s turn of player **{player}**',
      winMessage: '{emoji} | **{player}** won the TicTacToe Game.',
      tieMessage: 'The game tied! No one won the game.',
      timeoutMessage: 'The game went undefined! No one won the game.',
      playerOnlyMessage: 'Only {player} and {opponent} can use these buttons.'
    });

    Game.startGame();
    Game.on('gameOver', result => {
      return;
    });
  }
};