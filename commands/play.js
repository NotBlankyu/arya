<<<<<<< HEAD
const ytdl = require('ytdl-core');
const Discord = require('discord.js')
var servers = {}
module.exports.run = async (client, message, args) => {
  
    function play(connection, message){
        var server = servers[message.guild.id];
        server.dispatcher = connection.play(ytdl(server.queue[0]), {filter:"audioonly"},{highWaterMark: 1<<25});
        server.dispatcher.on("finish",function(){
          if(server.queue[1]){
            server.queue.shift();
            message.channel.send("Playing next song!")
            play(connection, message);
          }else{
            connection.disconnect();
            server.queue.shift();
            message.channel.send("Finished the queue leaving the channel now.")
          }
       });
      }
      
      if(!args[0]){
        message.channel.send("Please provide a link.");
        return
      }
      if(!message.member.voice.channel){
       return message.channel.send("Please enter a channel.")
      }
      if(!servers[message.guild.id]) servers[message.guild.id] = {
        queue: []
      }
      var server = servers[message.guild.id];
      server.queue.push(args[0]);
        
      if(!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection){
        if(!server.queue[1]){
        play(connection,message)    
        message.channel.send("Playing!")
        }else message.channel.send("Added to queue!")
       }).catch(err => 
        {
          message.channel.send("Make sure i have the permissions to join!")
          server.queue.shift();  
        })
      
       module.exports.Skip = function(){
        if(server.dispatcher) server.dispatcher.end();
    }
       module.exports.queue = function(){
        let list = ''
        let name
        
        if(server.queue){
          async function queue() {
          var queue =''
          var msg = await message.channel.send(`Fetching queue info...`);
          for(var i = 0; i < server.queue.length; ++i){
            const info = await ytdl.getInfo(server.queue[i]);
            queue += `${i + 1}. [${info.title}](${server.queue[i]})\n`;
          }
          
           const embed = new Discord.MessageEmbed()
            .setTitle('Music Queue')
            .setDescription(`${queue}`)
            msg.edit(embed)
            
        }
        queue();
      }
      }   
=======
const ytdl = require('ytdl-core');
const Discord = require('discord.js')
var servers = {}
module.exports.run = async (client, message, args) => {
  
    function play(connection, message){
        var server = servers[message.guild.id];
        server.dispatcher = connection.play(ytdl(server.queue[0]), {filter:"audioonly"},{highWaterMark: 1<<25});
        server.dispatcher.on("finish",function(){
          if(server.queue[1]){
            server.queue.shift();
            message.channel.send("Playing next song!")
            play(connection, message);
          }else{
            connection.disconnect();
            server.queue.shift();
            message.channel.send("Finished the queue leaving the channel now.")
          }
       });
      }
      
      if(!args[0]){
        message.channel.send("Please provide a link.");
        return
      }
      if(!message.member.voice.channel){
       return message.channel.send("Please enter a channel.")
      }
      if(!servers[message.guild.id]) servers[message.guild.id] = {
        queue: []
      }
      var server = servers[message.guild.id];
      server.queue.push(args[0]);
        
      if(!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection){
        if(!server.queue[1]){
        play(connection,message)    
        message.channel.send("Playing!")
        }else message.channel.send("Added to queue!")
       })
       module.exports.Skip = function(){
        if(server.dispatcher) server.dispatcher.end();
    }
       module.exports.queue = function(){
        let list = ''
        let name
        
        if(server.queue){
          async function queue() {
          var queue =''
          var msg = await message.channel.send(`Fetching queue info...`);
          for(var i = 0; i < server.queue.length; ++i){
            const info = await ytdl.getInfo(server.queue[i]);
            queue += `${i + 1}. [${info.title}](${server.queue[i]})\n`;
          }
          
           const embed = new Discord.MessageEmbed()
            .setTitle('Music Queue')
            .setDescription(`${queue}`)
            msg.edit(embed)
            
        }
        queue();
      }
      }   
>>>>>>> 9893fba4676f88c7f2e88756d481f74b2c487dc5
  }