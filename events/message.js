const Guild = require('../models/guild');
const discord = require('discord.js');

module.exports = async (client, message) => {
    let prefix = (process.env.PREFIX);
    if (message.author.bot) return;
    if (message.content.startsWith(`${client.user}`)||message.content.startsWith(`<@!${client.user.id}>`)) return message.channel.send(`Hi my name is arya and my prefix is **${process.env.PREFIX}**`);
    if (!message.content.startsWith(prefix)) return;
    if (!message.member) message.member = await message.guild.fetchMember (message);
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();
        if (cmd.length === 0) return;
    
        let command = client.commands.get(cmd);
        if (!command){ 
          command = client.commands.get(client.aliases.get(cmd));
          }
    
        if (command){
            command.run(client, message, args);
        }else message.reply(`Sorry but i can't find this command.`)
      
     
}