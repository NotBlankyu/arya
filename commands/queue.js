const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const music = require('./play.js')
module.exports.run = async (client, message, args) => {
  if(music.queue){
    music.queue(message);  
  }else{
    music.noQueue(message);
  }   
  }