const { Snake } = require('discord-gamecord');
const { color } = require('../../config');

module.exports = {
  usage: 'snake',
  name: 'snake',
  description: 'Play a snake game.',
  async execute({msg, args, client}) {
    const Game = new Snake({
      message: msg,
      isSlashGame: false,
      embed: {
        title: 'Snake Game',
        overTitle: 'Game Over',
        color: '#A020F0'
      },
      emojis: {
        board: '⬛',
        food: '🍎',
        up: '⬆️',
        down: '⬇️',
        left: '⬅️',
        right: '➡️',
      },
      stopButton: 'Stop',
      timeoutTime: 60000,
      snake: { head: '🟢', body: '🟩', tail: '🟩', over: '💀' },
      foods: ['🍎', '🍇', '🍊', '🫐', '🥕', '🥝', '🌽'],
      playerOnlyMessage: 'Only {player} can use this buttons.'

    });

    Game.startGame();
    Game.on('gameOver', result => {
      return;
    });
  },
};