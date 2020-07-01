const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const music = require('./play.js')
module.exports.run = async (client, message, args) => {
    switch (args[0]) {
        case "off" : music.loopOff()
          break;
        case "single" :music.loopSingle()
          break;
        case "all" : music.loopAll()
          break;    
    }
  }