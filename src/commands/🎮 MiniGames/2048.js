const { TwoZeroFourEight } = require('discord-gamecord');
const { color } = require('../../config');

module.exports = {
  usage: '2048',
  name: '2048',
  aliases: ['twozerofoureight', 'two-zero-four-eight', 'tzfe'],
  description: 'Play a 2048 game.',
  async execute({msg}) {
    const Game = new TwoZeroFourEight({
      message: msg,
      isSlashGame: false,
      embed: {
        title: '2048',
        color: `${color.default}`
      },

      emojis: {
        up: '⬆️',
        down: '⬇️',
        left: '⬅️',
        right: '➡️'
      },
      timeoutTime: 60000,
      ButtonStyle: 'PRIMARY',
      playerOnlyMessage: 'Only {player} can use these buttons.'
    });

    Game.startGame();
    Game.on('gameOver', result => {
      return;
    });
  }
}