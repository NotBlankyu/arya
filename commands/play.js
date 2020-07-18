const ytdl = require('ytdl-core');
const ytsr = require('ytsr')
const ytpl = require('ytpl')
const Discord = require('discord.js')
var { getData } = require("spotify-url-info");
const Guild = require('../models/guild');
var servers = {}
var loop = {}
module.exports.run = async (client, message, args) => {
  let guild = await Guild.findOne({ 
    guildID: message.guild.id
  }, (err, guild) => {
    if(err) console.log(err);
})
if(guild.musicChannel){
  if(message.channel.id != guild.musicChannel){
    if(guild.musicChannel != "0" ){
      return message.channel.send(`Please use this command in <#${guild.musicChannel}>`)
    }
    
  }
}
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
            if(!guild.toggle){
              message.channel.send("Playing next song!")
            }
            
          }else if(server.queue[1]){
            server.queue.shift();
            if(!guild.toggle){
              message.channel.send("Playing next song!")
            }
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
      const searchArgs = args.join("")
      let playlistID 
      let test
      async function addPlaylist(type){
        ytpl(playlistID, function(err, playlist) {
          if(err) throw err;
          for(var i = 0; i < playlist.total_items; ++i){
            server.queue.push(playlist.items[i].url);
          }
          if(playlist.total_items<server.queue.length){
             test = 1
          }else{
            test = 2
          }
          console.log(test)
        });
      }
      if(ytpl.validateURL(args[0])){
        playlistID = await ytpl.getPlaylistID(args[0])
        addPlaylist() 
      }else if(!ytdl.validateURL(args[0])){
        try{
          data = await getData(args[0])
          if(data){
            searchResult = await ytsr(data.name+data.artists[0].name);
            musicLink = searchResult.items[0].link
            server.queue.push(musicLink);
          }else{
        }
        }catch{
          searchResult = await ytsr(searchArgs);
          musicLink = searchResult.items[0].link
          server.queue.push(musicLink);
        }
        
      }else{
        server.queue.push(args[0]);
      }

      if(!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection){
        if(!server.queue[1]){
        play(connection,message)    
        message.channel.send("Playing!")
        }else if(2 == test){
          play(connection,message)    
        message.channel.send("Playing and added to the queue!")
        }else {
          message.channel.send("Added to the queue!")
          
        }
       }).catch(err => 
        {
          console.log(err)
          message.channel.send("An error happen please make sure i have the permissions to join!")
          server.queue.shift();  
        })
      
       module.exports.Skip = function(guild){
        if(message.member.voice.channel != message.guild.voice.channel)return message.channel.send('Your not in the same channel as me!')
        var server = servers[guild];
        if(server.dispatcher) server.dispatcher.end();
    }
       module.exports.queue = function(message){  
        
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
        queue(message);
     
      }   
      module.exports.loopAll = function(message){
        if(message.member.voice.channel != message.guild.voice.channel)return message.channel.send('Your not in the same channel as me!')
        function loopAll() { 
          loopQueue.queue = server.queue.slice()
          message.channel.send('Looping the entire queue')
        }
        loopAll()
        }
        module.exports.loopSingle = function(message){
          if(message.member.voice.channel != message.guild.voice.channel)return message.channel.send('Your not in the same channel as me!')
          function loopSingle() { 
          loopQueue.queue.push(server.queue[0])
          message.channel.send('Looping the current track')
          }
          loopSingle()
        }
        module.exports.loopOff = function(message){
          if(message.member.voice.channel != message.guild.voice.channel)return message.channel.send('Your not in the same channel as me!')
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
          if(message.member.voice.channel != message.guild.voice.channel)return message.channel.send('Your not in the same channel as me!')
          var server = servers[guild];
          if(server.dispatcher) server.dispatcher.resume();
            } 
        module.exports.leave = function(message){
          if(message.member.voice.channel != message.guild.voice.channel)return message.channel.send('Your not in the same channel as me!')
          var server = servers[message.guild.id];
          try {
            if(message.guild.me.voice.channel){
              server.queue = []
              loopQueue.queue = []
              server.dispatcher.end();
            }else{
              
              return message.channel.send("I'm not playing right now!")
            }  
          }catch (e){
            console.log(e)
          }
          }
        
  }
  module.exports.noQueue = function(message){  
message.channel.send('No queue right now')

}  
