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
            server.queueNames.shift();
            if(!guild.toggle){
              playingEmbed()
            }
            play(connection, message);
          }else{
            connection.disconnect();
            server.queue.shift();
            server.queueNames.shift();
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
        toDelete: [],
        queueNames: [],
        queuePage: []
      }
      if(!loop[message.guild.id]) loop[message.guild.id] = {
        queue: []
      }
      var server = servers[message.guild.id];
      var loopQueue = loop[message.guild.id];
      const searchArgs = args.join("")
      let playlistID 
      var test
      async function playingEmbed(){
        if(server.toDelete[0]){
          client.channels.cache.get(message.channel.id).messages.fetch(server.toDelete[0]).then(message => message.delete())
        }
        const playingEmbed = new Discord.MessageEmbed()
        .setDescription(`Playing [${server.queueNames[0]}](${server.queue[0]})`)
        msg = await message.channel.send(playingEmbed)
        server.toDelete.shift()
        server.toDelete.push(msg.id)
        
        
      }
      async function queueingEmbed(){
        const name = server.queueNames[server.queueNames.length - 1];
        const playingEmbed = new Discord.MessageEmbed()
        .setDescription(`Added [${name}](${server.queue[server.queue.length - 1]}) to the queue!`)
        message.channel.send(playingEmbed)/*.then(msg => {
          msg.delete({ timeout: 15000 });
        })*/
      }
      
      function addPlaylist(type){
         ytpl(playlistID, function(err, playlist) {
           try{
          if(err) throw err;
          for(var i = 0; i <40 && i < playlist.total_items; ++i){
            server.queue.push(playlist.items[i].url);
            server.queueNames.push(playlist.items[i].title)
          }
          if(playlist.total_items<server.queue.length){
             test = 1
          }else{
            test = 2
          }
        }catch{
          if(err) return message.channel.send("I can't read this playlist.(Probably private)")
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
              server.queueNames.push(name)
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
            server.queueNames.push(data.name)
            server.queue.push(musicLink);
          }else{
        }
        }catch(err){
          searchResult = await ytsr(searchArgs);
          musicLink = searchResult.items[0].link
          server.queueNames.push(searchResult.items[0].title)
          server.queue.push(musicLink);
        }
        
      }else{  
        info = await ytdl.getInfo(args[0])
        server.queueNames.push(info.title) 
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
        var server = servers[message.guild.id];
        server.queuePage = []
          async function queue() {
          if(!server.queue[0])return message.channel.send('No queue right now')
          var queue =''
          for(var i = 0; i < server.queue.length; ++i){
            queue += `${i + 1}. [${server.queueNames[i]}](${server.queue[i]})\n`;
          }
          const [first, ...rest] = Discord.Util.splitMessage(queue, { maxLength: 2048 })
          
            const embed2 = new Discord.MessageEmbed()
            .setTitle('Music Queue')
            .setDescription(`${first}`)
            server.queuePage.push(embed2)
          if (!rest.length) {
            // Send just the embed with the first element from the array
            return message.channel.send(embed2)
          }
          let i2 = 0;
          
          for (const text of rest) {
            // Add new description to the base embed
            embed3 = new Discord.MessageEmbed()
            .setTitle('Music Queue')
            .setDescription(`${text}`)
            server.queuePage.push(embed3)
          }
          
          const filter1 = (reaction, user) => {
            return reaction.emoji.name === '➡️' && user.id === message.author.id;
          };
          const filter2 = (reaction, user) => {
            return reaction.emoji.name === '⬅️' && user.id === message.author.id;
          }; 
        
        message.channel.send(server.queuePage[0]).then(msg => {
          msg.react('➡️')
          const collector1 = msg.createReactionCollector(filter1, { time: 30000 });
          collector1.on('collect', (reaction, user) => {
            i2 += 1
            msg.edit(server.queuePage[i2])
            msg.reactions.removeAll();
            if(i2+1 == server.queuePage.length){
              msg.react('⬅️')
            }else{
              msg.react('⬅️')
              msg.react('➡️')
            }
            
        });
        const collector2 = msg.createReactionCollector(filter2, { time: 30000 });
          collector2.on('collect', (reaction, user) => {
            i2 -= 1
            msg.edit(server.queuePage[i2])
            msg.reactions.removeAll();
            if(i2==0){
              msg.react('➡️')
            }else{
            msg.react('⬅️')
            msg.react('➡️')
          }
        });
        });
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
              server.queueNames = []
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
