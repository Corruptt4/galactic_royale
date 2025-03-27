const socket = io()
export const canvas = document.getElementById("canvas")
,           ctx = canvas.getContext("2d")
,           mapSize = 3000

import { PlayerSpaceship } from "./modules/entities/spaceship.js"
import { Camera } from "./modules/camera.js"
import { Minimap } from "./modules/minimap.js"

canvas.width = window.innerWidth
canvas.height = window.innerHeight

var players = new Map()
,      objects = []
,       myId = null
,       camera = new Camera()
,       minimap = new Minimap(10, 10, 125, mapSize)


socket.on("playerUpd", (plrs) => {
    players.clear()
    minimap.update(plrs)
    plrs.forEach((plr) => {
        players.set(plr.id, new PlayerSpaceship(plr.x, plr.y, 3, plr.border , 25, plr.speed, plr.rotation))
    })

    minimap.entities.clear()
    plrs.forEach((plr) => {
        minimap.entities.set(plr.id, new PlayerSpaceship(plr.x, plr.y, 3, plr.border, 25, plr.speed, plr.rotation))
    })

    if (!myId) {
        myId = socket.id
    }
    console.log(players.size)
})

socket.on("move", (plrs) => {
    minimap.entities.clear()
    plrs.forEach((plr) => {
        minimap.entities.set(plr.id, new PlayerSpaceship(plr.x, plr.y, 3, plr.border, 25, plr.speed, plr.rotation))
    })
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

    if (players.has(myId)) {
        let mySpaceship = players.get(myId)
        camera.follow(mySpaceship)
    }
    minimap.x = 10
    minimap.y = 10
    minimap.render()
    camera.apply(ctx)

    players.forEach((plr) => {
        plr.render()
    })


    requestAnimationFrame(render)
}
render()