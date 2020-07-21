const Discord = require('discord.js')
module.exports.run = async (client, message, args) => {
    let serverSize = client.guilds.cache.size
    let userSize = client.users.cache.size
    let channelsSize = client.channels.cache.size
    message.channel.send(`Users count: ${userSize}\nServers count: ${serverSize}\nChannels count: ${channelsSize}`)
}