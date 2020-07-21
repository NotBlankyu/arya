const ytdl = require('ytdl-core');
const ytsr = require('ytsr')
const ytpl = require('arya-ytpl')
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
        server.dispatcher.on("finish",async function(){
          if(loopQueue.queue[0]){
            loopQueue.queue.push(loopQueue.queue[0])
            loopQueue.queue.shift()
            play(connection,message)
            if(!guild.toggle){
              playingEmbed()
            }

          }else if(server.queue[1]){
            server.queue.shift();
            if(!guild.toggle){
              playingEmbed()
            }
            play(connection, message);
          }else{
            connection.disconnect();
            server.queue.shift();
            server.toDelete = []
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
        queue: [],
        toDelete: []
      }
      if(!loop[message.guild.id]) loop[message.guild.id] = {
        queue: []
      }
      var server = servers[message.guild.id];
      var loopQueue = loop[message.guild.id];
      const searchArgs = args.join("")
      let playlistID 
      let test
      async function playingEmbed(){
        if(server.toDelete[0]){
          client.channels.cache.get(message.channel.id).messages.fetch(server.toDelete[0]).then(message => message.delete())
        }
        const info = await ytdl.getInfo(server.queue[0]);
        const playingEmbed = new Discord.MessageEmbed()
        .setDescription(`Playing [${info.title}](${server.queue[0]})`)
        msg = await message.channel.send(playingEmbed)
        server.toDelete.shift()
        server.toDelete.push(msg.id)
        
        
      }
      async function queueingEmbed(){
        const info = await ytdl.getInfo(server.queue[server.queue.length - 1]);
        const playingEmbed = new Discord.MessageEmbed()
        .setDescription(`Added [${info.title}](${server.queue[server.queue.length - 1]}) to the queue!`)
        message.channel.send(playingEmbed)/*.then(msg => {
          msg.delete({ timeout: 15000 });
        })*/
      }
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
        });
      }
      if(ytpl.validateURL(args[0])){
        playlistID = await ytpl.getPlaylistID(args[0])
        addPlaylist() 
      }else if(!ytdl.validateURL(args[0])){
        try{
          data = await getData(args[0])
          if(data.tracks){
            message.channel.send('Loading tracks <a:8527_discord_loading:734395335446888529>')
            for(var i = 0; i <20 && i < data.tracks.total ; ++i){
              name = data.tracks.items[i].track.name
              artist = data.tracks.items[i].track.artists[0].name
              search = name+" "+artist
              searchResult = await ytsr(search);
              musicLink = await searchResult.items[0].link
              server.queue.push(musicLink);
              }
              if( 20 < server.queue.lenght || data.tracks.total < server.queue.length){
                test = 1
             }else{
               test = 2
             }
          }else if(data){
            searchResult = await ytsr(data.name+data.artists[0].name);
            musicLink = searchResult.items[0].link
            server.queue.push(musicLink);
          }else{
        }
        }catch(err){
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
        playingEmbed()
        }else if(2 == test){
          play(connection,message)    
        message.channel.send("Playing and added to the queue!")
        }else {
         queueingEmbed()
        }
       }).catch(err => 
        {
          message.channel.send("An error happen please make sure i have the permissions to join!")
          server.queue.shift();  
        })
      
       module.exports.Skip = function(guild){
        var server = servers[guild];
        if(server.dispatcher) server.dispatcher.end();
    }
       module.exports.queue = function(message){  
        
          async function queue() {
          if(!server.queue[0])return message.channel.send('No queue right now')
          var queue =''
          var msg = await message.channel.send(`Fetching queue info <a:8527_discord_loading:734395335446888529>`);
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
