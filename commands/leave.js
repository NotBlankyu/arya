const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const music = require('./play.js')
module.exports.run = async (client, message, args) => {
    
      
      if(!message.member.voice.channel){
       return message.channel.send("Please enter a channel.")
      }
      if(music.leave){
        music.leave(message);
      }else{
        return message.channel.send("I'm not playing right now!")
      }
      
       
  }