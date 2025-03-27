const socket = io()
export const canvas = document.getElementById("canvas")
,           ctx = canvas.getContext("2d")
,           mapSize = 1000

import { PlayerSpaceship } from "./modules/entities/spaceship.js"

canvas.width = window.innerWidth
canvas.height = window.innerHeight

var players = new Map()
,      objects = []
,       myId = null

socket.on("playerUpd", (plrs) => {
    players.clear()
    plrs.forEach((plr) => {
        players.set(plr.id, new PlayerSpaceship(plr.x, plr.y, 3, plr.border , 25, plr.speed, plr.rotation))
    })

    if (!myId) {
        myId = socket.id
    }
})

socket.on("move", (plrs) => {
    plrs.forEach((plrD) => {
        if (players.has(plrD.id)) {
            let plr = players.get(plrD.id)
            plr.x = plrD.x
            plr.y = plrD.y
            plr.rotation = plrD.rotation
        }
    })
})

window.addEventListener("keydown", (e) => {
    if (players.has(myId)) {
        players.get(myId).key(e, true)
    }
})
window.addEventListener("keyup", (e) => {
    if (players.has(myId)) {
        players.get(myId).key(e, false)
    }
})
function updateMyPlayerPosition() {
    if (players.has(myId)) {
        let myPlayer = players.get(myId);
        myPlayer.move();

        socket.emit("move", { id: myId, x: myPlayer.x, y: myPlayer.y, rotation: myPlayer.rotation });
    }
}
setInterval(() => {
    updateMyPlayerPosition()
}, 1000/60)
// renderer
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    players.forEach((plr) => {
        plr.render()
    })

    requestAnimationFrame(render)
}
render()