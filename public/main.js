export const socket = io()
export const canvas = document.getElementById("canvas")
,           ctx = canvas.getContext("2d")
,           mapSize = 1000

import { QuadTree, Rect } from "./modules/collision/quadTree.js"
import { PlayerSpaceship } from "./modules/entities/spaceship.js"
import { Camera } from "./modules/camera.js"
import { Minimap } from "./modules/minimap.js"
import { MessageBox } from "./modules/messageBox.js"
import { Star, Planet } from "./modules/definition.js"

canvas.width = window.innerWidth
canvas.height = window.innerHeight

export var players = new Map()
,      objects = []
,       myId = null
,       camera = new Camera()
,       minimap = new Minimap(10, 10, 125, mapSize)
,       messages = []
,       boundary = new Rect(-mapSize/2, -mapSize/2, mapSize, mapSize)
,       qt = new QuadTree(boundary, 20)
,       star = null
,       notifs = []

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


function updateStar() {
    socket.emit("starUpdate", (star))
}
socket.on("updateStars", (star2) => {
    star = new Star(star2.x, star2.y, star2.size, star2.temperature, [])
    for (let i = 0; i < star2.planets.length; i++) {
        let planet = star2.planets[i]
        let pln = new Planet(0, 0, planet.size, planet.color, planet.orbitRadius, planet.orbitSpeed, planet.axisRotation, star)
        star.planets.push(pln)
    }
})
socket.on("playerUpd", (plrs) => {
    if (plrs != null) {
        qt.points = []
        plrs.forEach((plr) => {
            if (!players.has(plr.id)) {
                let newPlr = new PlayerSpaceship(plr.x, plr.y, 3, plr.border , 25, plr.speed, plr.rotation, plr.name, "player", plr.team, plr.health)
                players.set(plr.id, newPlr)
            }
        })

        minimap.entities.clear()
        plrs.forEach((plr) => {
            minimap.entities.set(plr.id, new PlayerSpaceship(plr.x, plr.y, 3, plr.border, 25, plr.speed, plr.rotation, plr.name, "player", plr.team, plr.health))
        })

        if (!myId) {
            myId = socket.id
        }
    }
})
socket.on("getPlayers", (plrs, hps) => {
    plrs.forEach((plr) => {
        if (!players.has(plr.id)) {
            let newPlr = new PlayerSpaceship(plr.x, plr.y, 3, plr.border , 25, plr.speed, plr.rotation, plr.name, "player", plr.team, plr.health)
            players.set(plr.id, newPlr)
        }
    })
    plrs.forEach((plr) => {
        let sethp = hps.get(plr.id)
        plr.health = sethp
    })
    plrs.forEach((plr) => {
        minimap.entities.set(plr.id, new PlayerSpaceship(plr.x, plr.y, 3, plr.border, 25, plr.speed, plr.rotation, plr.name, "player", plr.team, plr.health))
    })
})
socket.on("disconnection", id => {
    if (players.has(id)) {
        players.delete(id)
    }
    if (minimap.entities.has(id)) {
        minimap.entities.delete(id)
    }
})

socket.on("move", (plrs) => {
    plrs.forEach((plrD) => {
        if (players.has(plrD.id)) {
            let plr = players.get(plrD.id)
            plr.x = plrD.x
            plr.y = plrD.y
            plr.rotation = plrD.rotation
            if (qt.points.includes(plr)) {
                qt.points.splice(qt.points.indexOf(plr), 1)
                qt.insert(plr)
            }
        }
    })
    qt.reset()
    if (qt.points.length < 1) {
        players.forEach((p)=> {
            qt.insert(p)
        })
        qt.insert(star)
    }
    
    if (qt.collisions.length > 0) {
        // hence this is a matrix, we'll get each array
        qt.collisions.forEach((collision) => {
            let updatedPlayers = []
            collision.forEach((p) => {
                for (let i = 0; i < collision.length; i++) {
                    let other = collision[i]
                    // don't collide if we're the same player
                    if (p === other) {
                        continue;
                    }
                    // now we can collide with others, since we're already in collision, we'll only push
                    if (p.type === "player" && other.type === p.type && !other.isSpectating && !p.isSpectating) {
                        let angle = Math.atan2(other.y - p.y, other.x - p.x)
                        if (p.team == other.team) {
                            p.velX -= 1 + Math.cos(angle)
                            p.velY -= 1 + Math.sin(angle)
                            other.velX += 1 + Math.cos(angle)
                            other.velY += 1 + Math.sin(angle)
                        } 
                         if (p.team != other.team) {
                            p.velX -= 1 + Math.cos(angle)
                            p.velY -= 1 + Math.sin(angle)
                            other.velX += 1 + Math.cos(angle)
                            other.velY += 1 + Math.sin(angle)
                            other.health -= p.bodyDamage
                            p.health -= other.bodyDamage
                        }
                        
                        p.move()
                        other.move()
                        
                        updatedPlayers.push(p);
                        updatedPlayers.push(other);
                    }
                    
                    if (!qt.checkCollision(p, other)) {
                        qt.collisions.splice(qt.collisions.indexOf(collision), 1)
                    }
                }
            })
        })
    }
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
    notifs.forEach(notif => {
        notif.move()
    })
    if (star) {
        updateStar()
    }
    if (qt.points.length > 1) {
        qt.findAndCheckCollisions()
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
    notifs.forEach(notif => {
        notif.render()
    })
    
    if (star) {
        star.render()
    }
    players.forEach((plr) => {
        if (!plr.isSpectating) {
            plr.render()
            plr.mortality()
        }
    })


    requestAnimationFrame(render)
}
render()