const socket = io()
export const canvas = document.getElementById("canvas")
,           ctx = canvas.getContext("2d")
,           mapSize = 3000

import { QuadTree } from "./modules/collision/quadTree.js"
import { PlayerSpaceship } from "./modules/entities/spaceship.js"
import { Camera } from "./modules/camera.js"
import { Minimap } from "./modules/minimap.js"
import { MessageBox } from "./modules/messageBox.js"

canvas.width = window.innerWidth
canvas.height = window.innerHeight

export var players = new Map()
,      objects = []
,       myId = null
,       camera = new Camera()
,       minimap = new Minimap(10, 10, 125, mapSize)
,       messages = []
,       qt = new QuadTree(mapSize, 20)

document.getElementById("join").addEventListener("click", () => {
    const nameInp = document.getElementById("setName")
    const name = nameInp.value.trim()

    if (name == null) {
        name = "Guest #" + Math.floor(Math.random()*10000)
    }
    socket.emit("playerJoin", name)
    document.getElementById("setName").style.display = "none"
    document.getElementById("join").style.display = "none"
    document.getElementById("gameTitle").style.display = "none"
})


socket.on("playerUpd", (plrs) => {
    if (plrs != null) {
        players.clear()
        qt.points = []
        plrs.forEach((plr) => {
            let newPlr = new PlayerSpaceship(plr.x, plr.y, 3, plr.border , 25, plr.speed, plr.rotation, plr.name)
            players.set(plr.id, newPlr)
            qt.points.push(newPlr)
        })

        minimap.entities.clear()
        plrs.forEach((plr) => {
            minimap.entities.set(plr.id, new PlayerSpaceship(plr.x, plr.y, 3, plr.border, 25, plr.speed, plr.rotation, plr.name))
        })


        if (!myId) {
            myId = socket.id
        }
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
    minimap.entities.clear()
    plrs.forEach((plr) => {
        minimap.entities.set(plr.id, new PlayerSpaceship(plr.x, plr.y, 3, plr.border, 25, plr.speed, plr.rotation, plr.name))
    })
})

document.getElementById("msg").addEventListener("keydown", (e) => {
    if (e.keyCode == 13) {
        let val = document.getElementById("msg").value
        socket.emit("sendChatMessage", val, {id: myId})
        document.getElementById("msg").value = ""
    }
})
document.getElementById("msg").addEventListener("focusin", () => {
    if (players.has(myId)) {
        let player = players.get(myId)
        player.isTyping = true
    }
})
document.getElementById("msg").addEventListener("focusout", () => {
    if (players.has(myId)) {
        let player = players.get(myId)
        player.isTyping = false
    }
})

socket.on("newMessage", (msg, id) => {
   if (id != null) {
        if (players.has(id)) {
            let plr = players.get(id)
            messages.push(new MessageBox(0.1, msg, plr));
            console.log("Added new MessageBox:", messages.length);
        }
   }
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
    if (myId != null) {
        if (players.has(myId)) {
            let myPlayer = players.get(myId);
            myPlayer.move();
            socket.emit("move", { id: myId, x: myPlayer.x, y: myPlayer.y, rotation: myPlayer.rotation, name: myPlayer.name});
        }
    }
}
setInterval(() => {
    updateMyPlayerPosition()
    messages.forEach(msg => {
        msg.moveUp()
        msg.expire()
    })

    if (qt.points.length > 1) {
        qt.findAndCheckCollisions()
    }

    if (qt.collisions.length > 0) {
        console.log("collisions are found")
        // hence this is a matrix, we'll get each array
        qt.collisions.forEach((collision) => {
            collision.forEach((p) => {
                for (let i = 0; i < collision.length; i++) {
                    let other = collision[i]
                    // don't collide if we're the same player
                    if (p === other) {
                        continue;
                    }

                    // now we can collide with others, since we're already in collision, we'll only push
                    let angle = Math.atan2(other.y - p.y, other.x - p.x)
                    p.velX -= 1 * Math.cos(angle)
                    p.velY -= 1 * Math.sin(angle)
                    other.velX += 1 * Math.cos(angle)
                    other.velY += 1 * Math.sin(angle)
                }
            })
        })
    }
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


    messages.forEach((message) => {
        message.render()
    })
    players.forEach((plr) => {
        plr.render()
    })


    requestAnimationFrame(render)
}
render()