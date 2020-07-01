const ytdl = require('ytdl-core');
const Discord = require('discord.js')
var servers = {}
var loop = {}
module.exports.run = async (client, message, args) => {
  
    function play(connection, message){
        
        var server = servers[message.guild.id];
        var loopQueue = loop[message.guild.id];
        if(loopQueue.queue[0]){
          server.dispatcher = connection.play(ytdl(loopQueue.queue[0]), {filter:"audioonly"},{highWaterMark: 1<<25});
        }else{
        server.dispatcher = connection.play(ytdl(server.queue[0]), {filter:"audioonly"},{highWaterMark: 1<<25});
        }
        server.dispatcher.on("finish",function(){
          if(loopQueue.queue[0]){
            loopQueue.queue.push(loopQueue.queue[0])
            loopQueue.queue.shift()
            play(connection,message)
            message.channel.send("Playing next song!")
          }else if(server.queue[1]){
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
      if(!loop[message.guild.id]) loop[message.guild.id] = {
        queue: []
      }
      var server = servers[message.guild.id];
      var loopQueue = loop[message.guild.id];
      
      server.queue.push(args[0]);
        
      if(!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection){
        if(!server.queue[1]){
        play(connection,message)    
        message.channel.send("Playing!")
        }else message.channel.send("Added to queue!")
       }).catch(err => 
        {
          console.log(err)
          message.channel.send("Make sure i have the permissions to join!")
          server.queue.shift();  
        })
      
       module.exports.Skip = function(guild){
        var server = servers[guild];
        if(server.dispatcher) server.dispatcher.end();
    }
       module.exports.queue = function(){  
        
          async function queue() {
          if(!server.queue[0])return message.channel.send('No queue right now')
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
      module.exports.loopAll = function(){
        function loopAll() { 
          loopQueue.queue = server.queue.slice()
          console.log(loopQueue)
          message.channel.send('Looping the entire queue')
        }
        loopAll()
        }
        module.exports.loopSingle = function(){
          function loopSingle() { 
          loopQueue.queue.push(server.queue[0])
          message.channel.send('Looping the current track')
          }
          loopSingle()
        }
        module.exports.loopOff = function(){
          function loopOff() { 
          loopQueue.queue = []
          message.channel.send('Loop off')
          }
          loopOff()
        }
        module.exports.pause = function(guild){  
          var server = servers[guild];
        if(server.dispatcher) server.dispatcher.pause();
          } 
        module.exports.resume = function(guild){  
          var server = servers[guild];
          if(server.dispatcher) server.dispatcher.resume();
            } 
            
        
      
        
  }
  module.exports.noQueue = function(message){  
message.channel.send('No queue right now')

}   