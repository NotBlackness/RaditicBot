const { MatchPairs } = require('discord-gamecord');
const { color } = require('../../config');

module.exports = {
  usage: 'matchpairs',
  name: 'matchpairs',
  aliases: ['match-pairs', 'marching-pairs', 'matchingpairs'],
  description: 'Play a math pairs game.',
  async execute({msg}) {
    const Game = new MatchPairs({
      message: msg,
      isSlashGame: false,
      embed: {
        title: 'Match pairs',
        color: `${color.default}`,
        description: 'Click on the button to match emojis with their pairs.'
      },
      timeoutTime: 60000,
      emojis: ['🍉', '🍇', '🍒', '🥭', '🍎', '🥕', '🍐', '🥝' , '🍓', '🫐', '🍍', '🍊'],
      winMessage: 'You won the game! You turned a total of `{totalTurned}`.',
      loseMessage: 'You lost the game.',
      playerOnlyMessage: 'Only {player} can use these buttons.'
      
    });
    Game.startGame();
    Game.on('gameOver', result => {
      return;
    });
  }
}