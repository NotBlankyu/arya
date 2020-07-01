const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const music = require('./play.js')
module.exports.run = async (client, message, args) => {
    
      
      if(!message.member.voice.channel){
       return message.channel.send("Please enter a channel.")
      }
      
      music.Skip(message.guild.id);
       
  }