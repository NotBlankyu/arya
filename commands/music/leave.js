const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const music = require('./play.js')
const Guild = require('../../models/guild');
module.exports={
  name: 'leave',
      category: 'Music',
      description: 'Clears queue and leave VC',
      usage: `a/leave`,
  
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
      if(!message.member.voice.channel){
       return message.channel.send("Please enter a channel.")
      }
      if(music.leave){
        music.leave(message);
      }else{
        return message.channel.send("I'm not playing right now!")
      }
      
       
  }
}