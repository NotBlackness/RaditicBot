const { Trivia } = require('discord-gamecord');
const { color } = require('../../config');

module.exports = {
  usage: 'trivia [easy/medium/hard]',
  name: 'trivia',
  description: 'Play a trivia game.',
  async execute({msg, args}) {
    let difficulty;
    if (args[0] === 'easy') {
      difficulty = 'easy';
    } else if (args[0] === 'medium') {
      difficulty = 'medium';
    } else if (args[0] === 'hard') {
      difficulty = 'hard';
    } else {
      difficulty = 'medium';
    };

    const Game = new Trivia({
      message: msg,
      isSlashGame: false,
      embed: {
        title: 'Trivia',
        color: `${color.default}`,
        description: 'You have 60 seconds to guess the answer.'
      },
      timeoutTime: 60000,
      buttonStyle: 'PRIMARY',
      trueButtonStyle: 'SUCCESS',
      falseButtonStyle: 'DANGER',
      mode: 'multiple', //multiple/single
      difficulty: difficulty,
      winMessage: 'You won! The correct answer is {answer}',
      loseMessage: 'You lost! The correct answer is {answer}',
      errMessage: 'Unable to fetch questions.',
      playerOnlyMessage: 'Only {player} can use these buttons.'
    });

    Game.startGame();
    Game.on('gameOver', result => {
      return;
});
}
}