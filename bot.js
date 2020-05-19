const Discord = require('discord.js');
const auth = require('./auth.json');
var mongo = require('mongoose');
const client = new Discord.Client();
const User = require('./database/UserTemplate');

// Initialize MongoDB
mongo.connect(auth.mongo);

mongo.connection.on('connected' , () =>{
    console.log("MongoDB has been connected");
});
mongo.connection.on('err' , (err) =>{
    if (err){
        console.log("MongoDB Error has occured: "+err);
        return
    }
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!\n\n`);
});

client.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
  });
  
  client.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
  });


client.on('message', msg => {

    if (msg.author.bot) return;

    if (msg.content.includes("++") || msg.content.includes("--")) {
        let initialargs = msg.content.substring(1).split(' ');
        
        let args = initialargs[0].substring(0).split('+');
        var matches = args[0].match(/@!(\d+)>/); 
        if(matches){
            let ID=matches[0].match(/(\d+)/);
            let taggedID=ID[0];
            if(taggedID){
                var newKarma = 0;
                if(msg.content.includes("--")){
                    newKarma--;
                }else{
                    newKarma++;
                }

                User.findOne({
                    UserID: taggedID,
                }, (err, result) => {
                if (err) {
                } else {
                    if(result){
                        newKarma += result["karma"];
                            User.findOneAndUpdate({
                                UserID: taggedID,
                                cooldownExpire: {$lt: Date.now()}
                            }, {
                                $set: {
                                    karma: newKarma,
                                    cooldownExpire: Date.now() + 3600000
                                }
                                }, (err, result1) => {
                                    
                                    if(result1){
                                        msg.channel.send("<@"+taggedID+">" + " now has " + newKarma + " karma!");
                                    }else{
                                        msg.channel.send("You can only modify users karma every hour! They are currently at " + result["karma"] + "  Karma.")
                                    }
                                });
                        }else{
                            var newUser = new User({
                                UserID: taggedID,
                                karma: newKarma,
                                cooldownExpire: Date.now() + 3600000
                            });
                            newUser.save((err,result)=>{});
                            msg.channel.send("<@"+taggedID+">" + " now has " + newKarma + " karma!");
                        }
                    }
                });
            }
        }
    }

});


client.login(auth.token);