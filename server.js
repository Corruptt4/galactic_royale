const { create } = require("node:domain");

const express = require("express")
,   { createServer } = require("node:http")
,   app = express()
,   server = createServer(app)

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, "index.html"))
})

server.listen(3000, () => {
    console.log('Server is running on port 3000')
})