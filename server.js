const express = require("express")
,   { createServer } = require("node:http")
,   app = express()
,   server = createServer(app)
, { Server } = require("socket.io")
, io = new Server(server)
, { join } = require("node:path")
, mapSize = 5000
, port = 3030

// Bot notifications
var sendConnectionMessage = false
,      sendChatMessage = false
,      playerName = null
,      playerMessage = null

var players = []

// app.get('/', (req, res) => {
//     res.sendFile(join(__dirname, "public/index.html"))
// })
app.use(express.static('public'))

// Welcome new player.
io.on("connection", (socket) => {
    socket.on("playerJoin", (name) => {
        players.push({ 
            id: socket.id, 
            x: Math.random()*mapSize, 
            y: Math.random()*mapSize, 
            speed: 0.2, 
            rotation: 0, 
            border: `rgb(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)})`,
            name: name
        })
        playerName = name
        sendConnectionMessage = true
        io.emit("playerUpd", players)
    })

    // Handle when the Player wants to move
    socket.on("move", (updatedPlayer) => {
        const player = players.find(p => p.id === updatedPlayer.id)
        if (player) {
            player.x = updatedPlayer.x
            player.y = updatedPlayer.y
            player.rotation = updatedPlayer.rotation
        }
        io.emit("move", players) 
    })


    socket.on("sendChatMessage", (msg, which) => {
        const player = players.find(p => p.id === which?.id);
        if (player && msg.trim() !== "") { 
            io.emit("newMessage", msg, player.id);
            sendChatMessage = true
            playerMessage = msg
            playerName = player.name
        }
    });

    // Bye bye, have a nice day!
    socket.on("disconnect", () => {
        players = players.filter(player => player.id != socket.id)
        io.emit("playerUpd", players)
    })
})

server.listen(port, () => {
    console.log("Server is running on port", port)
})


const { Client, GatewayIntentBits, EmbedBuilder  } = require("discord.js")
const { send } = require("node:process")
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] })

const token = 'MTM1NTAzNzc0NzAxNDAwODg2Mw.GbrqrN.HBZUpPtw9JDTyJz6bZpLOFOll2U53ts9zaFCek'
const startupChannelId = "1355040469532541088"
const prefix = "g."

client.once("ready", async () => {
    console.log("Bot is online!")


    const embed = new EmbedBuilder()
    .setTitle("Game up and running.")
    .setColor("#AFF823")
    .setDescription("Running on localhost:"+port)
    .setAuthor({
        name: client.user.username, 
        iconURL: client.user.displayAvatarURL()
    })
    const channel = await client.channels.fetch(startupChannelId)
    if (channel) {
        channel.send({ embeds: [embed] })
    }
    
    setInterval(() => {
        if (sendConnectionMessage) {
            let connectionEmbed = new EmbedBuilder()
            .setTitle("A player joined!")
            .setColor("#F8823A")
            .setDescription(playerName + " has joined the game! " + players.length + " players.")
            .setAuthor({
                name: client.user.username, 
                iconURL: client.user.displayAvatarURL()
            })
            
            if (channel) {
                channel.send("Game update!")
                channel.send({ embeds: [connectionEmbed] })
                sendConnectionMessage = false
                playerName = null;
            }
        }
    }, 200)
    setInterval(() => {
        if (sendChatMessage) {
            let connectionEmbed = new EmbedBuilder()
            .setTitle(playerName + ": " + playerMessage)
            .setColor("#AF662F")
            .setAuthor({
                name: client.user.username, 
                iconURL: client.user.displayAvatarURL()
            })
            
            if (channel) {
                channel.send("Game update!")
                channel.send({ embeds: [connectionEmbed] })
                sendChatMessage = false
                playerName = null;
            }
        }
    }, 200)
})
let messages = [
    "Not responding.",
    "Ping... ping... ping.",
    "Is that what you'll do? Ping me?",
    "I only notify, not say stuff. Wait, I said something."
]
client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    if (message.mentions.has(client.user)) {
        message.reply(messages[Math.floor(Math.random()*messages.length)])
    }
    // if (message.content.includes(prefix)) {
    //     if (message.content.includes("r")) {
    //         message.reply("@" + message.author.username)
    //     }
    // }

})

client.login(token)