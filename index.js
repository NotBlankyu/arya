
const { Client } = require("discord.js")

const Discord = require("discord.js")
const client = new Discord.Client()
const config = require('./config.json')
  client.on('message', message => {
    if (message.author.bot) return;
    if (message.channel.type == 'dm') return;
    if (!message.content.toLowerCase().startsWith(config.prefix)) return;
    if (message.content.startsWith(`<@!${client.user.id}>`) || message.content.startsWith(`<@${client.user.id}>`)) return;

   const args = message.content
       .trim().slice(config.prefix.length)
       .split(/ +/g);
   const command = args.shift().toLowerCase();

   try {
       const commandFile = require(`./commands/${command}.js`)
       
       commandFile.run(client, message, args);
   } catch (err) {
    console.log(err).then(message.channel.send("I can't find this command ``"+`${command}`+'``.'))
 }
});
client.on("ready", () => {
  let activity = "Lo-fi."
  let type = 'LISTENING'
  client.user.setActivity(activity, { type: type })
  .catch(console.error);
  client.user
      .setStatus("dnd") // idle, dnd, online, invisible
      .catch(console.error);
console.log("Estou Online!")
});


client.login(process.env.TOKEN)
