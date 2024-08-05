const { Wordle } = require('discord-gamecord');
const { color } = require('../../config');

module.exports = {
  usage: 'wordle',
  name: 'wordle',
  description: 'Play a wordle game.',
  async execute({msg}) {
    const Game = new Wordle({
      message: msg,
      isSlashGame: false,
      embed: {
        title: 'Wordle',
        color: `${color.default}`
      },
      customWord: null,
      timeoutTume: 60000,
      winMessage: 'You won! The word was **{word}**.',
      loseMessage: 'You lost! The word was **{word}**.',
      playerOnlyMessage: 'Only {player} can use these buttons.'
    });

    Game.startGame();
    Game.on('gameOver', result => {
      return;
    });
  }
}