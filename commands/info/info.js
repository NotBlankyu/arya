const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const music = require('../music/play.js')
const Guild = require('../../models/guild');
const play = require("../music/play.js");
module.exports={
  name: 'info',
      category: 'info',
      description: 'Returns info about the current video.',
      aliases: ['i'],
      usage: `a/info`,
  
  run : async (client, message, args) => {
  let guild = await Guild.findOne({ 
    guildID: message.guild.id
  }, (err, guild) => {
    if(err) console.log(err);
})
if(guild){
if(guild.musicChannel){
  if(message.channel.id != guild.musicChannel){
    if(guild.musicChannel != "0" ){
      return message.channel.send(`Please use this command in <#${guild.musicChannel}>`)
    }
    
  }
}
}
 play.info(message)
  }
}