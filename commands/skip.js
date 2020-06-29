const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const music = require('./play.js')
module.exports.run = async (client, message, args) => {
    var skip = music.Skip();
      
      if(!message.member.voice.channel){
       return message.channel.send("Please enter a channel.")
      }
      message.member.voice.channel.join().then(function(connection){
      skip
      })    
  }