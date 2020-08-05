const Discord = require("discord.js");
const mongoose = require('mongoose');
const Guild = require('../../models/guild');
module.exports={
  name: 'lock',
      category: 'Config',
      description: 'Block the command from working in other chats',
      usage: `a/lock`,
  
  run : async (client, message, args) => {
    if(!message.member.hasPermission('MANAGE_CHANNELS'))return message.channel.send("You don't seem to have enough permissions")
    Guild.findOne({ 
        guildID: message.guild.id
      }, (err, guild) => {
        if(err) console.log(err);
        //if there isn't create it
        if(!guild){
          const newGuild = new Guild({
        _id: mongoose.Types.ObjectId(),
        guildID: message.guild.id,
        guildName: message.guild.name,
        musicChannel: message.channel.id
          })
          newGuild.save().catch(err => console.log(err));
          message.channel.send(`Bot locked to ${message.channel}`)
        }else{
              guild.musicChannel = message.channel.id
              guild.save().catch(err =>console.log(err));
              message.channel.send(`Bot locked to ${message.channel}`)
      }
    })



  }
}