const Discord = require("discord.js");
const mongoose = require('mongoose');
const Guild = require('../../models/guild');

module.exports={
  name: 'toggle',
      category: 'Config',
      description: 'Toggles playing next message.',
      usage: `a/toggle`,
  
  run : async (client, message, args) => {
if(!message.member.hasPermission('MANAGE_MESSAGES'))return message.channel.send("You don't seem to have enough permissions(MANAGE_MESSAGES)")
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
    toggle: true
      })
      newGuild.save().catch(err => console.log(err));
      message.channel.send('Playing next msg disabled')
    }else{
      if(!guild.toggle){
          guild.toggle = true
          message.channel.send('Playing next msg disabled')
          guild.save().catch(err =>console.log(err));
      }else{
          guild.toggle = false
          message.channel.send('Playing next msg enabled')
          guild.save().catch(err =>console.log(err));
      }
      
      

  }
})
    }
  }