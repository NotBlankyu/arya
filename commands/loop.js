const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const music = require('./play.js')
const Guild = require('../models/guild');
module.exports.run = async (client, message, args) => {
  let guild = await Guild.findOne({ 
    guildID: message.guild.id
  }, (err, guild) => {
    if(err) console.log(err);
})
if(guild.musicChannel){
  if(message.channel.id != guild.musicChannel){
    if(guild.musicChannel != "0" ){
      return message.channel.send(`Please use this command in <#${guild.musicChannel}>`)
    }   
  }

}
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