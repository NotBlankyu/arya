
const { Client } = require("discord.js")
const mongoose = require('mongoose');
const Guild = require('./models/guild');
const Discord = require("discord.js")
const client = new Discord.Client()
require('dotenv').config()
const prefix = process.env.PREFIX
  client.on('message', message => {
    if (message.author.bot) return;
    if (message.channel.type == 'dm') return;
    if (message.content.startsWith(`<@!${client.user.id}>`) || message.content.startsWith(`<@${client.user.id}>`)) return message.channel.send('Hi my prefix is a/');
    if (!message.content.toLowerCase().startsWith(prefix)) return; 

   const args = message.content
       .trim().slice(prefix.length)
       .split(/ +/g);
   const command = args.shift().toLowerCase();

   try {
       const commandFile = require(`./commands/${command}.js`)
       
       commandFile.run(client, message, args);
   } catch (err) {
    message.channel.send("I can't find this command ``"+`${command}`+'``.')
    console.log(err)
 }
});
client.on("ready", () => {
  let activity = process.env.activityName
  let type = process.env.activityType
  client.user.setPresence(({
    status: 'dnd',
    activity: {
        name: activity,
        type: type,
        url: 'https://www.twitch.tv/dh3_'
    }
}))
  
  
console.log("Estou Online!")
});
client.on("guildCreate", guild => {
guild = new Guild({
  _id: mongoose.Types.ObjectId(),
  guildID: guild.id,
  guildName: guild.name,
});

guild.save()
.then(result => console.log(result))
.catch(err => console.error(err));

console.log('I have joined a new server!');

});
client.on("guildDelete", guild => {
  Guild.findOneAndDelete({
    guildID: guild.id
}, (err, res) => {
    if(err) console.error(err)
    console.log('I have been removed from a server!');
});
  });
client.mongoose = require('./utils/mongoose');
client.mongoose.init();
client.login(process.env.TOKEN)
