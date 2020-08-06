const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const music = require('./play.js')
const Guild = require('../../models/guild');
module.exports={
  name: 'queue',
      category: 'Music',
      description: 'List with music queue.',
      aliases: ['q'],
      usage: `a/queue`,
  
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
  if(music.queue){
    music.queue(message);  
  }else{
    music.noQueue(message);
  }   
  }
}