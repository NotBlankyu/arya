const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const ytsr = require('ytsr');
const ytpl = require('ytpl');
const moment = require('moment');
const dotenv = require('dotenv');
const humanizeDuration = require("humanize-duration");

dotenv.config({
  path: `${__dirname}/.env`
});

const prefix = process.env.prefix
const owner_id = process.env.owner_id

const client = new Discord.Client();

const queue = new Map();

client.once("ready", () => {
      client.user.setActivity('to your feelings', { type: 'LISTENING' })
  .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
  .catch(console.error);
  console.log("Ready!");

});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(`${client.user}`)||message.content.startsWith(`<@!${client.user.id}>`)) return message.channel.send(`Hi my name is arya and my prefix is **${process.env.prefix}**`);
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.split(" ");

  const serverQueue = queue.get(message.guild.id);

  switch(args[0]){
    case `${prefix}play`:
      if(!args[1])return message.channel.send('Please specify a video')
      execute(message, serverQueue, client);
      break;
    case `${prefix}skip`:
      skip(message, serverQueue);
      break;
    case `${prefix}stop`:
      stop(message, serverQueue);
      break;
    case `${prefix}queue`:
      queueList(message.guild,message);
      break;
    case `${prefix}loop`:
      loop(message, serverQueue);
      break;
    case `${prefix}help`:
      help(message);
      break;
    case `${prefix}botinfo`:
      botinfo(message,client);
      break;
    case `${prefix}song`:
      song(message.guild,message);
      break;
    case `${prefix}clear`:
      clear(message.guild,message);
      break;
    case `${prefix}remove`:
      remove(message.guild,message);
      break;
    case `${prefix}invite`:
      invite(message);
      break;
    case `${prefix}status`:
      status(message, args);
      break;
    default: 
      message.channel.send("You need to enter a valid command!");
  }

  
});

async function execute(message, serverQueue, client) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  let songInfo = 0
  let playlistSongs = []
  let song

  if(!ytdl.validateURL(args[1])){ //check if is a link, if not execute ytsr or ytpl
    try {
      playlistID = await ytpl.getPlaylistID(args[1])
       await ytpl(playlistID).then(playlist => {
          for (let i = 0; i < playlist.estimatedItemCount && i < 100; i++) {
            if(playlist.items[i].duration){
              playlistSongs.push({
                title: playlist.items[i].title,
                url: playlist.items[i].shortUrl
              })
            }
            
          }
        }).catch(err => {
            console.error(err);
        });
    } catch (err) {
      searchArgs = args.slice(1).join(' ')
      searchResult = await ytsr(searchArgs);
      musicLink = searchResult.items[0].url
      songInfo = await ytdl.getInfo(musicLink);
      song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url
      };
    }
    
  }else{                          //gets the info from the link if it is a yt link
    songInfo = await ytdl.getInfo(args[1]);
    song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url
    };
  }
  
  

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      msgToDel: null,
      connection: null,
      queueEmbeds: [],
      songs: [],
      volume: 5,
      playing: true,
      looping: false
    };

    queue.set(message.guild.id, queueContruct);

    if(await playlistSongs[0]){
      for (let i = 0; i < playlistSongs.length; i++) {
        queueContruct.songs.push(playlistSongs[i]);
      }
    }else{
      queueContruct.songs.push(song);
    }
    

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0], message, client);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    if(await playlistSongs[0]){
      for (let i = 0; i < playlistSongs.length; i++) {
        serverQueue.songs.push(playlistSongs[i]);
      }
      return message.channel.send(new Discord.MessageEmbed().setDescription(`The **[Playlist](${args[1]})** has been added to the queue!`));
    }else{
      serverQueue.songs.push(song);
      return message.channel.send(new Discord.MessageEmbed().setDescription(`**[${song.title}](${song.url})** has been added to the queue!`));
    }
    
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

async function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      if(serverQueue.looping){
        serverQueue.songs.push(song)
        serverQueue.songs.shift();
      }else{
        serverQueue.songs.shift();
      }
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  if(serverQueue.msgToDel){
    serverQueue.textChannel.messages.fetch(serverQueue.msgToDel).then(message => message.delete())
  }
  msg = await serverQueue.textChannel.send( new Discord.MessageEmbed().setDescription(`Started playing: **[${song.title}](${song.url})**`) );
  serverQueue.msgToDel = msg.id
}

function queueList(guild,message) {
  const serverQueue = queue.get(guild.id);
  if(!serverQueue){
    return message.channel.send("A queue doesn't exist in the moment.")
  }
  var queueText = ''
  serverQueue.queueEmbeds = []
  for(var i = 0; i < serverQueue.songs.length; ++i){
    queueText += `${i + 1}. [${serverQueue.songs[i].title}](${serverQueue.songs[i].url})\n`;
  }
  const [first, ...rest] = Discord.Util.splitMessage(queueText, { maxLength: 2048 })
          
  const embed2 = new Discord.MessageEmbed()
  .setTitle('Music Queue')
  .setDescription(`${first}`)
  serverQueue.queueEmbeds.push(embed2)
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
  serverQueue.queueEmbeds.push(embed3)
}
const filter1 = (reaction, user) => {
  return reaction.emoji.name === '➡️' && user.id === message.author.id;
};
const filter2 = (reaction, user) => {
  return reaction.emoji.name === '⬅️' && user.id === message.author.id;
}; 

message.channel.send(serverQueue.queueEmbeds[0]).then(msg => {
msg.react('➡️')
const collector1 = msg.createReactionCollector(filter1, { time: 30000 });
collector1.on('collect', (reaction, user) => {
  i2 += 1
  msg.edit(serverQueue.queueEmbeds[i2])
  msg.reactions.removeAll();
  if(i2+1 == serverQueue.queueEmbeds.length){
    msg.react('⬅️')
  }else{
    msg.react('⬅️')
    msg.react('➡️')
  }
  
});
const collector2 = msg.createReactionCollector(filter2, { time: 30000 });
collector2.on('collect', (reaction, user) => {
  i2 -= 1
  msg.edit(serverQueue.queueEmbeds[i2])
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
function loop(message, serverQueue) {
  if(serverQueue.looping){
    serverQueue.looping = false
    message.channel.send('Loop Off')
  }else{
    serverQueue.looping = true
    message.channel.send('Currently looping')
  }
}

function help(message) {
  const helpEmbed = new Discord.MessageEmbed()
    .setTitle('Help')
    .setDescription('Here you can find every command available right now!\nIf you want more info go [here](https://arya-music.ml/)')
    .addField('Commands','-play⠀⠀⠀⠀     -queue\n-skip⠀⠀⠀⠀⠀⠀-loop\n-help⠀⠀⠀⠀⠀⠀-stop\n-botinfo⠀⠀⠀⠀-song\n-remove')
message.channel.send(helpEmbed)

}

function botinfo(message,client) {
  let serverSize = client.guilds.cache.size
  let userSize = client.users.cache.size
  let channelsSize = client.channels.cache.size
  let creationDate = moment(client.user.createdAt).locale('en-gb').format('LLL')
  const apiPing = Math.round(client.ws.ping);
  const embed = new Discord.MessageEmbed()
  .setTitle('BotInfo')
  .setThumbnail(client.user.avatarURL())
  .setDescription('Hi my name is arya')
  .addField('Server Count:',serverSize)
  .addField('User Count:',userSize)
  .addField('Channels Count:',channelsSize)
  .addField('Created at:',creationDate)
  .addField('Latency:',apiPing)
  .addField('Owner','『　』#8283')
  message.channel.send(embed)
}

async function song(guild,message) {
  const serverQueue = queue.get(guild.id);
  if(!serverQueue){
    return message.channel.send("No song playing.")
  }
  songInfo = await ytdl.getInfo(serverQueue.songs[0].url);


  embed = new Discord.MessageEmbed()
  .setTitle("Song Playing")
  .setThumbnail(songInfo.videoDetails.thumbnails[3].url)
  .setDescription(`**Title:** ${songInfo.videoDetails.media.song}\n**Artist:** ${songInfo.videoDetails.media.artist}\n**Lenght:** ${humanizeDuration(songInfo.videoDetails.lengthSeconds*1000)}\n[Open in browser](${serverQueue.songs[0].url})`)
  

  message.channel.send(embed)
}

function clear(guild,message) {
  const serverQueue = queue.get(guild.id);
  if(!serverQueue){
    return message.channel.send("No songs playing.")
  }
  serverQueue.songs = [];
  message.channel.send("Queue cleared!");
  serverQueue.connection.dispatcher.end();

}

function remove(guild,message) {
  const serverQueue = queue.get(guild.id);
  const args = message.content.split(" ");
  if(!args[1]){
    message.channel.send("Use a/remove (index of song)")
  }

  if(!serverQueue){
    return message.channel.send("No songs playing.")
  }
  if(args[1]==1){
    serverQueue.connection.dispatcher.end();
  }else{
    serverQueue.songs.splice(args[1]-1,1)
  }

  message.channel.send("Track removed!");

}

function invite(message){
  const embed = new Discord.MessageEmbed()
  .setDescription("Hi click [here](https://discord.com/api/oauth2/authorize?client_id=705053632961446008&permissions=3196928&scope=bot) to invite me!")
  
  message.channel.send(embed)
}

function status(message,args){
  if(message.member.id != owner_id) return
  const statusText = args.slice(1).join(' ')
  client.user.setActivity(statusText, { type: 'LISTENING' })
  .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
  .catch(console.error);
}


client.login(process.env.token);

