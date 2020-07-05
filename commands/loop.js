const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const music = require('./play.js')
module.exports.run = async (client, message, args) => {
    switch (args[0]) {
        case "off" : music.loopOff(message)
          break;
        case "single" :music.loopSingle(message)
          break;
        case "all" : music.loopAll(message)
          break; 
        default: message.channel.send('use !loop all/single/off')   
    }
  }