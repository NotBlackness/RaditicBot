// config.js
const { readFileSync } = require('fs');
const prefixSchema = require('./Schemas/prefixSchema');

async function getPrefix(guildId) {
  const prefixData = await prefixSchema.findOne({ guildId });
  return prefixData ? prefixData.prefix : "r."; // Default prefix 'r.'
}

module.exports = {
  token: process.env.token || readFileSync('src/token.txt', 'utf-8'),
  getPrefix, // Exporting the function to fetch prefix dynamically
  clientId: process.env.clientId || "1229438321395109929",
  ownerIds: ["1081995719210172497", "1229341293176557570", "1153611682250227764"], // Array of owner IDs
  mainOwnerId: "1153611682250227764",
  mongoURL: process.env.mongoURL || readFileSync('src/mongoURL.txt', 'utf-8'),
  color: {
    default: "#8e00e7",
    red: "#ff0000",
    green: "#008000"
  },
  emoji: {
    search: "<:search:1245782174221733918>",
    minigames: "<:minigames:1245777255683063942>",
    utility: "<:utility:1245777409005850688>",
    moderation: "<:moderation:1245777326323535936>",
    dot: "<:dot:1243787726701068391>",
    home: "<:home:1245777449149796445>",
    info: "<:info:1245777371689255034>"
  },
};