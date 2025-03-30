const express = require("express")
,   { createServer } = require("node:http")
,   app = express()
,   server = createServer(app)
, { Server } = require("socket.io")
, io = new Server(server, {
    connectionStateRecovery: {}
})
, { join } = require("node:path")
, mapSize = 1000
, port = 3030

// Bot notifications
var sendConnectionMessage = false
,      sendChatMessage = false
,      playerName = null
,      playerMessage = null

var players = []
, playerHPs = new Map()
, system = null
, spawnedStar = false

// app.get('/', (req, res) => {
//     res.sendFile(join(__dirname, "public/index.html"))
// })
app.use(express.static('public'))
// x, y, radius, color, orbitRadius, orbitSpeed, axisRotation
/**
 * new Star(mapSize/2, mapSize/2, 250, 8500, [
    new Planet(0, 0, 15, "rgb(165, 122, 182)", 280, 0.002, 0.05),
    new Planet(0, 0, 15, "rgb(165, 255, 255)", 390, 0.0006, 0.08),
    new Planet(0, 0, 15, "rgb(188, 255, 76)", 553, 0.0003, 0.02),
    new Planet(0, 0, 15, "rgb(85, 85, 255)", 763, 0.000115, 0.01),
])
 */

// Welcome new player.
io.on("connection", (socket) => {
    io.emit("getPlayers", (players, playerHPs))
    console.log(playerHPs)
   if (!spawnedStar) {
        system = {
            x: mapSize/2,
            y: mapSize/2,
            size: 200,
            temperature: 8300,
            planets: [
                {
                    x: mapSize/2,
                    y: mapSize/2,
                    size: 15,
                    color: "rgb(165, 122, 182)",
                    orbitRadius: 15,
                    orbitSpeed: 0.0009,
                    axisRotation: 0.05
                }, 
                {
                    x: mapSize/2,
                    y: mapSize/2,
                    size: 20,
                    color: "rgb(165, 255, 255)",
                    orbitRadius: 20,
                    orbitSpeed: 0.0003,
                    axisRotation: 0.08
                },
                {
                    x: mapSize/2,
                    y: mapSize/2,
                    size: 10,
                    color: "rgb(188, 255, 76)",
                    orbitRadius: 25,
                    orbitSpeed: 0.0001,
                    axisRotation: 0.02
                },
                {
                    x: mapSize/2,
                    y: mapSize/2,
                    size: 5,
                    color: "rgb(85, 85, 255)",
                    orbitRadius: 50,
                    orbitSpeed: 0.00005,
                    axisRotation: 0.01
                }
            ]
        }
        io.emit("updateStars", (system))
        spawnedStar = false
   }
    socket.on("updateStar", (star) => {
        system.x = star.x
        system.y = star.y
        system.size = star.size
        system.temperature = star.temperature
        star.planets.forEach((planet) => {
            system.forEach((planet2) => {
                planet2.x = planet.x
                planet2.y = planet.y
                planet2.size = planet.size
                planet2.color = planet.color
                planet2.orbitRadius = planet.orbitRadius
                planet2.orbitSpeed = planet.orbitSpeed
                planet2.axisRotation = planet.axisRotation
            })
        })
    })
    socket.on("handlePlayer", (player) => {
        players.find(p => p.id === player.id)
        io.emit("playerUpd", players)
    })
    socket.on("playerJoin", (name) => {
        let team = (Math.random() < 0.5) ? 1 : 0
        let teamColors = [
            "rgb(255, 0, 0)",
            "rgb(0, 0, 255)"
        ]
        if (!name) {
            name = "Guest #" + Math.floor(Math.random()*9) + Math.floor(Math.random()*9) + Math.floor(Math.random()*9) + Math.floor(Math.random()*9)
        }
        players.push({ 
            id: socket.id, 
            x: Math.random()*mapSize, 
            y: Math.random()*mapSize, 
            speed: 0.2, 
            rotation: 0, 
            border: teamColors[team],
            name: name,
            team: team+1,
            health: 500,
            damage: 10,
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
        io.emit("disconnection", socket.id)
        players = players.filter(player => player.id != socket.id)
    })
})

server.listen(port, () => {
    console.log("Server is running on port", port)
})


const { Client, GatewayIntentBits, EmbedBuilder  } = require("discord.js")
const { spawn } = require("node:child_process")
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
    "I only notify, not say stuff. Wait, I said something.",
    "Have you heard of my hate to pings?",
    "No. I am not listening to your ping.",
    "Not checking this ping. Wait, I already did that."
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