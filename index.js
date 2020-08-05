
const { Client, Collection } = require('discord.js');
const mongoose = require('mongoose');
const Guild = require('./models/guild');
const Discord = require("discord.js")
const client = new Client();
const { config } = require('dotenv');
const fs = require('fs');
const nodemon = require('nodemon');

client.commands = new Collection();
client.aliases = new Collection();

client.categories = fs.readdirSync('./commands/');


config({
  path: `${__dirname}/.env`
});

['command'].forEach(handler => {
  require(`./handlers/${handler}`)(client);
});

fs.readdir('./events/', (err, files) => {
  if (err) return console.error;
  files.forEach(file => {
      if (!file.endsWith('.js')) return;
      const evt = require(`./events/${file}`);
      let evtName = file.split('.')[0];
      console.log(`Loaded event '${evtName}'`);
      client.on(evtName, evt.bind(null, client));
  });
});

client.mongoose = require('./utils/mongoose');
client.mongoose.init();
client.login(process.env.TOKEN)
