const mongoose = require('mongoose');
const Guild = require('../models/guild');
const discord = require('discord.js');


module.exports = async (client, member) => {
    guild = new Guild({
        _id: mongoose.Types.ObjectId(),
        guildID: guild.id,
        guildName: guild.name,
      });
      
      guild.save()
      .then(result => console.log(result))
      .catch(err => console.error(err));
      
      console.log('I have joined a new server!');
}