const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const music = require('./play.js')
module.exports.run = async (client, message, args) => {
    if(!message.member.voice.channel){
        return message.channel.send("Please enter a channel.")
       }
    if(message.member.voice.channel != message.guild.voice.channel)return message.channel.send('Your not in the same channel as me!')   
       music.resume(message.guild.id);
       message.channel.send("Unpaused")
        
  }