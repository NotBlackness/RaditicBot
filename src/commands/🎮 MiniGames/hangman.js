const { Hangman } = require('discord-gamecord');
const { color } = require('../../config');

module.exports = {
  usage: 'hangman',
  name: 'hangman',
  description: 'Play a hangman game.',
  async execute({msg}) {
    const words = ['apple', 'javascript', 'vampire', 'monkey', 'tiger', 'programmer', 'discord', 'river', 'pizza', 'sushi', 'programming'];
    const wordRandom = Math.floor(Math.random() * words.length);
     Game = new Hangman({
      message: msg,
      isSlashGame: false,
      embed: {
        title: 'Hangman',
        color: `${color.default}`
      },
      hangman: { hat: '🎩', head: '😟', shirt: '👕', pants: '🩳', boots: '👞👞' },
       customWord: words[wordRandom],
       timeoutTime: 60000,
       theme: 'winter',
       winMessage: 'You won! The word was **{word}**',
       loseMessage: 'You lost! The word was **{word}**',
       playerOnlyMessage: 'Only {player} can use this buttons.'

    });
    Game.startGame();
    Game.on('gameOver', result => {
      return;
    })
  },
};