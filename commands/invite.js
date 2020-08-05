const Discord = require('discord.js')


module.exports.run = async (client, message, args) => {
    const Embed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Invite me!')
	.setURL('https://discord.com/api/oauth2/authorize?client_id=705053632961446008&permissions=3196928&scope=bot')
	.setTimestamp()
	.setFooter('Arya', 'https://i.imgur.com/nx7Olli.jpg');

	message.channel.send(Embed);
  }


