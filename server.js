const express = require("express")
,   { createServer } = require("node:http")
,   app = express()
,   server = createServer(app)
, { Server } = require("socket.io")
, io = new Server(server)
, { join } = require("node:path")
, mapSize = 1000

var players = []

// app.get('/', (req, res) => {
//     res.sendFile(join(__dirname, "public/index.html"))
// })
app.use(express.static('public'))

io.on("connection", (socket) => {
    players.push({ id: socket.id, x: Math.random()*mapSize, y: Math.random()*mapSize, speed: 0.2, rotation: 0, border: `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})` })

    io.emit("playerUpd", players)

    socket.on("move", (updatedPlayer) => {
            const player = players.find(p => p.id === updatedPlayer.id)
            if (player) {
                player.x = updatedPlayer.x
                player.y = updatedPlayer.y
                player.rotation = updatedPlayer.rotation
            }
        io.emit("move", players) 
    })

    socket.on("disconnect", () => {
        players = players.filter(player => player.id != socket.id)
    })
})

module.exports = (req, res) => {
    res.socket.server = createServer(app);
    io.attach(res.socket.server);
    res.socket.server.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  };