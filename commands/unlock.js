const Discord = require("discord.js");
const mongoose = require('mongoose');
const Guild = require('../models/guild');
module.exports.run = async (client, message, args) => {
    if(!message.member.hasPermission('MANAGE_CHANNELS'))return message.channel.send("You don't seem to have enough permissions(MANAGE_CHANNELS)")
    Guild.findOne({ 
        guildID: message.guild.id
      }, async (err, guild) => {
        if(err) console.log(err);
        if(!guild){
          message.channel.send(`The bot isn't locked, to lock it use the lock command`)
        }else{
            if(guild.musicChannel != 0){
              message.channel.send(`Bot unlocked from <#${guild.musicChannel}>`)
              guild.musicChannel = "0"
              return guild.save().catch(err =>console.log(err));
            }
        message.channel.send(`The bot isn't locked, to lock it use the lock command.`)  
              
      }
    })
}