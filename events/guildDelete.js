const mongoose = require('mongoose');
const Guild = require('../models/guild');
const discord = require('discord.js');


module.exports = async (client, guild) => {
    Guild.findOneAndDelete({
        guildID: guild.id
    }, (err, res) => {
        if(err) console.error(err)
        console.log('I have been removed from a server!');
    });
}