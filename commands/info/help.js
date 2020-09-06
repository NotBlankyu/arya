const Discord = require('discord.js')
module.exports={
    name: 'help',
        category: 'info',
        description: 'List with all the available commands.',
        usage: `a/help`,
    
    run : async (client, message, args) => {
const helpEmbed = new Discord.MessageEmbed()
    .setTitle('Help')
    .setDescription('Here you can find every command available right now!\nIf you want more info go [here](https://arya-music.ml/)')
    .addField('Commands','-play⠀⠀⠀⠀⠀⠀-pause\n-resume⠀⠀⠀⠀-queue\n-skip⠀⠀⠀⠀⠀⠀-loop\n-help⠀⠀⠀⠀⠀⠀-leave\n-lock⠀⠀⠀⠀⠀⠀-unlock\n-info')
message.channel.send(helpEmbed)



}
}