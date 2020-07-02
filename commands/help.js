const Discord = require('discord.js')


module.exports.run = async (client, message, args) => {
const helpEmbed = new Discord.MessageEmbed()
    .setTitle('Help')
    .setDescription('Here you can find every\n command available right now!')
    .addField('Commands','-play⠀⠀⠀⠀⠀⠀-pause\n-resume⠀⠀⠀⠀-queue\n-skip⠀⠀⠀⠀⠀⠀-loop\n-help')
message.channel.send(helpEmbed)



}