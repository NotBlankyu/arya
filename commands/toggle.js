const Discord = require("discord.js");
const db = require('quick.db')
module.exports.run = async (client, message, args) => {
if(db.get(`guild_${message.guild.id}`)){
    if(db.get(`guild_${message.guild.id}.toggle`)){
        db.set(`guild_${message.guild.id}`, { toggle: false })
        message.channel.send('Playing next msg disabled')
       }else{
        db.set(`guild_${message.guild.id}`, { toggle: true })
        message.channel.send('Playing next msg enabled')
       }
}else{
    db.set(`guild_${message.guild.id}`, { toggle: false })
    message.channel.send('Playing next msg disabled')
}
    };