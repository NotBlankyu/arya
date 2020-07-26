const Discord = require('discord.js')
const moment = require("moment");
module.exports.run = async (client, message, args) => {
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
    .addField('Owner','[             ]#8283')
    message.channel.send(embed)
}