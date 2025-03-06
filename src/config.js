// config.js
const { readFileSync } = require('fs');
const prefixSchema = require('./Schemas/prefixSchema');

async function getPrefix(guildId) {
  const prefixData = await prefixSchema.findOne({ guildId });
  return prefixData ? prefixData.prefix : "r."; // Default prefix 'r.'
}

module.exports = {
  token: process.env.token || readFileSync('src/token.txt', 'utf-8'),
  topggAPI: process.env.topggAPI || readFileSync('src/topggAPI.txt', 'utf-8'),
  getPrefix, // Exporting the function to fetch prefix dynamically
  clientId: process.env.clientId || "1229438321395109929",
  ownerIds: ["1081995719210172497", "1229341293176557570", "1153611682250227764"], // Array of owner IDs
  mainOwnerId: "1153611682250227764",
  mongoURL: process.env.mongoURL || readFileSync('src/mongoURL.txt', 'utf-8'),
  color: {
    default: "#ffffff",
    red: "#ff0000",
    green: "#008000"
  },
  emoji: {
    search: "<:Search:1286945870272659467>",
    minigames: "<:Games:1286944581245599776>",
    utility: "<:Settings:1286944591609729034>",
    moderation: "<:Moderation:1286944601600426004>",
    dot: "<:dot:1243787726701068391>",
    home: "<:Home:1286944548907651103>",
    info: "<:Info:1286944562924752896>",
    radigem: "<:RadiGem:1274250432062951517>",
    fun: "<:Fun:1286944571699232790>",
    music: "<:Music:1289450219355897937>"
  },
  lavalink_url: process.env.lavalink_url || readFileSync('src/lavalink-url.txt', 'utf-8'),
  lavalink_auth: process.env.lavalink_auth || readFileSync('src/lavalink-auth.txt', 'utf-8'),
};