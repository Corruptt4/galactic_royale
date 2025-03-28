const express = require("express")
,   { createServer } = require("node:http")
,   app = express()
,   server = createServer(app)
, { Server } = require("socket.io")
, io = new Server(server)
, { join } = require("node:path")
, mapSize = 5000

var players = []

// app.get('/', (req, res) => {
//     res.sendFile(join(__dirname, "public/index.html"))
// })
app.use(express.static('public'))

// Welcome new player.
io.on("connection", (socket) => {
    players.push({ 
        id: socket.id, 
        x: Math.random()*mapSize, 
        y: Math.random()*mapSize, 
        speed: 0.2, 
        rotation: 0, 
        border: `rgb(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)})` 
    })

    io.emit("playerUpd", players)

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
        }
    });

    // Bye bye, have a nice day!
    socket.on("disconnect", () => {
        players = players.filter(player => player.id != socket.id)
        io.emit("playerUpd", players)
    })
})

server.listen(3000, () => {
    console.log("Server is running on port 3000")
})