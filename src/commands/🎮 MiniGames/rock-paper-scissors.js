const { RockPaperScissors } = require('discord-gamecord');
const { color } = require('../../config');

module.exports = {
  usage: 'rock-paper-scissors <@opponent>',
  name: 'rock-paper-scissors',
  aliases: ['rps', 'rock-paper-scissor'],
  description: 'Play a Rock Paper Scissors game with your friend.',
  async execute({ msg, args }) {
    try {
      // Check if an opponent was mentioned
      if (!args[0]) {
        return msg.reply('Please mention an opponent to start a Rock Paper Scissors game.');
      }

      const replacedArg = args[0].replace(/[<@!>]/g, '');
      const opponent = msg.guild.members.cache.get(replacedArg);
      
      if (!opponent || opponent.user.bot || opponent.id === msg.author.id) {
        return msg.reply('Please mention a valid opponent (a user, not a bot, and not yourself) to start a Rock Paper Scissors game.');
      }

      const Game = new RockPaperScissors({
        message: msg,
        opponent: opponent.user,
        embed: {
          title: 'Rock Paper Scissors',
          color: color.default,
          description: 'Press a button to make your choice.'
        },
        buttons: {
          rock: 'Rock',
          paper: 'Paper',
          scissors: 'Scissors'
        },
        emojis: {
          rock: '🪨',
          paper: '📰',
          scissors: '✂️'
        },
        timeoutTime: 60000,
        buttonStyle: 'PRIMARY',
        pickMessage: 'You chose {emoji}',
        winMessage: '**{player}** won the game! Congratulations! 🎉',
        tieMessage: 'The game tied! No one won the game.',
        timeoutMessage: 'The game timed out! No one won the game.',
        playerOnlyMessage: 'Only **{player}** and **{opponent}** can use these buttons.'
      });

      Game.startGame();
      Game.on('gameOver', result => {
        // Optional: Handle any post-game actions here if needed.
      });

    } catch (error) {
      console.error('Error starting Rock Paper Scissors game:', error);
      msg.reply('There was an error starting the Rock Paper Scissors game.');
    }
  }
};