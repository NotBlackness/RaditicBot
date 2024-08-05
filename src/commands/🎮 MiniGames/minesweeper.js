const { Minesweeper } = require('discord-gamecord');
const { color } = require('../../config');

module.exports = {
  usage: 'minesweeper',
  name: 'minesweeper',
  description: 'Play a minesweeper game',
  async execute({msg}) {
    const Game = new Minesweeper({
      message: msg,
      isSlashGame: false,
      embed: {
        title: 'Minesweeper',
        color: `${color.default}`,
        description: 'Click on the buttons to reveal the blocks except mines.'
      },
      emojis: { flag: '🚩', mine: '💣' },
      mines: 4,
      timeoutTime: 60000,
      winMessage: 'You won the Game! You successfully avoided all the mines.',
      loseMessage: 'You lost the Game! Beaware of the mines next time.',
      playerOnlyMessage: 'Only {player} can use these buttons.'
    })
    Game.startGame();
    Game.on('gameOver', result => {
      return;
    })
  },
};