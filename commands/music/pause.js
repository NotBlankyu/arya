const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const music = require('./play.js')
const Guild = require('../../models/guild');
module.exports={
  name: 'pause',
      category: 'Music',
      description: 'Pauses the music playing.',
      usage: `a/pause`,
  
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
    if(message.member.voice.channel != message.guild.voice.channel)return message.channel.send("You'r not in the same channel as me!")
       
       music.pause(message.guild.id);
       message.channel.send("Paused") 
  }
}