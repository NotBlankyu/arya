<<<<<<< HEAD
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
=======
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
>>>>>>> 9893fba4676f88c7f2e88756d481f74b2c487dc5
  }