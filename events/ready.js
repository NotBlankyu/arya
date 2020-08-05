module.exports = async (client) => {
    let activity = process.env.activityName
    let type = process.env.activityType
    client.user.setPresence(({
      status: 'dnd',
      activity: {
          name: activity,
          type: type,
          url: 'https://www.twitch.tv/dh3_'
      }
  }))
    
    
  console.log("Online!")
   };