const express = require("express")
,   { createServer } = require("node:http")
,   app = express()
,   server = createServer(app)
, { Server } = require("socket.io")
, io = new Server(server)

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, "index.html"))
})

io.on("connection", (socket) => {
    console.log("Someone entered.")
})

server.listen(3000, () => {
    console.log('Server is running on port 3000')
})