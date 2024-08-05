const { ActivityType, ChannelType } = require('discord.js');
const colors = require('colors');
var AsciiTable = require('ascii-table');
var table = new AsciiTable();
table.setHeading('Mongo Database', 'Stats').setBorder('|', '=', "0", "0");
const mongoose = require('mongoose');
const { mongoURL } = require('../config.js');
const { AutoPoster } = require('topgg-autoposter');
const client = require(process.cwd() + '/src/index.js')

client.on("ready", async (client) => {
  const serverCount = client.guilds.cache.size;
  client.user.setActivity({
    name: 'r.help',
    type: ActivityType.Watching,
  });
  await client.application.commands.set(client.slashCommands.map(command => command.data));


  if (!mongoURL) {
    console.log(colors.magenta('Mongo Database • Disconnected'))
    console.log(colors.magenta('0===========================0'));
  } else {
    await mongoose.connect(mongoURL);
    console.log(colors.magenta('Mongo Database • Connected'))
    console.log(colors.magenta('0===========================0'));
  };
  if (!client.slashCommands) {
    console.log(colors.blue('Slash Commands • Not Registered'))
    console.log(colors.blue('0===========================0'));
  } else {
    console.log(colors.blue('Slash Commands • Registered'))
    console.log(colors.blue('0===========================0'));
  }
  if (client) {
    console.log(colors.red(`${client.user.tag} • Online`))
    console.log(colors.red('0===========================0'));
    } else {
      console.log(colors.red(`Client not found`));
    console.log(colors.red('0===========================0'));
  }
  const ap = AutoPoster("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzM2OTgyNjg1ODQ4NzAwMTAiLCJib3QiOnRydWUsImlhdCI6MTcxNjM2NjU1N30.92K9PMOQn_8p2nfntNEtK5SC7RPuMc1IIF7uDPd6hKI", client);

  ap.on('posted', () => {
    console.log('Stats posted on top.gg');
  })

  ap.on('error', () => {
    console.log('An error occured while posting stats on top.gg')
  })
  
  const userCount = client.users.cache.size;
  console.log(`userCount: ${userCount}\nserverCount: ${serverCount}`);
});