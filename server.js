const express = require("express")
,   { createServer } = require("node:http")
,   app = express()
,   server = createServer(app)
, { Server } = require("socket.io")
, io = new Server(server)
, { join } = require("node:path")

var players = []

// app.get('/', (req, res) => {
//     res.sendFile(join(__dirname, "public/index.html"))
// })
app.use(express.static('public'))

io.on("connection", (socket) => {
    players.push({ id: socket.id })

    io.emit("playerUpd", players)

    socket.on("disconnect", () => {
        players = players.filter(player => player.id != socket.id)
    })
})

server.listen(3000, () => {
    console.log('Server is running on port 3000')
})