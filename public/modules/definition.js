import { ctx, mapSize, notifs, socket } from "../main.js"
import {contextFunctions} from "../modules/contextFunctions.js"
import { Notification } from "./messageBox.js";

function darkenRGB(rgb, darken) {
    if (typeof rgb !== "string") {
        console.error("Invalid input to darkenRGB:", rgb);
        return "rgb(0, 0, 0)";
    }

    let match = rgb.match(/\d+/g)
    if (!match || match.length < 3) return rgb; 
    
    let r = Math.max(0, parseInt(match[0], 10) - darken);
    let g = Math.max(0, parseInt(match[1], 10) - darken);
    let b = Math.max(0, parseInt(match[2], 10) - darken);

    return `rgb(${r}, ${g}, ${b})`;
}
export class Projectile {
    constructor(x, y, speed, damage, color, owner) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.damage = damage;
        this.color = owner.border;
        this.owner = owner;
    }
    draw() {
        ctx.beginPath()
    }
}
export class SpaceshipBody {
    constructor(x, y, sides, border, size, speed, rotation, name, type, team, health) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.sides = sides;
        this.isSpectating = false;
        this.border = border;
        this.rotation = rotation;
        this.speed = speed;
        this.rotSpeed = speed/100
        this.rotVel = 0
        this.type = type
        this.velX = 0;
        this.team = team;
        this.health = health
        this.maxHealth = health
        this.bodyDamage = 5
        this.name = name
        this.isTyping = false;
        this.collisionArray = []
        this.camera = {
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight,
        }
        this.velY = 0;
        this.friction = 0.96
        this.keys = {}
    }
    // Oh no, they died.
    mortality() {
        if (this.health < 0) {
            let killers = []
            for (let i = 0; i < this.collisionArray.length; i++) {
                if (this.collisionArray[i].owner !== this.owner) {
                    killers.push(this.collisionArray[i].owner)
                }
            }
            let killerString = ""
            killers.forEach((killer, index) => {
                if (index < killers.length) {
                    killerString += killer.name + ","
                }
                if (index == killers.length) {
                    killerString += "and " + killer.name
                }
            })
            let notif = new Notification(-600, mapSize/2, this.name + " has been killed by " + killerString + "!")
            notifs.push(notif)
            this.isSpectating = true
        }
    }
    key(e, pressed) {
        this.keys[e.keyCode] = pressed
    }
    render() {
        ctx.save()
        ctx.beginPath()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.moveTo(0, 0)
        ctx.lineTo(this.size, 0)
        contextFunctions("Polygon", this.size, 0, 0, this.sides, 0)
        ctx.lineJoin = "round"
        ctx.strokeStyle = this.border
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.closePath()
        ctx.restore()

        ctx.beginPath()
        let hpPercent = this.health/this.maxHealth
        ctx.strokeStyle = this.border
        ctx.arc(this.x, this.y, this.size*1.1, 0, (Math.PI*2)*hpPercent)
        ctx.stroke()
        ctx.closePath()

        ctx.beginPath()
        ctx.fillStyle = "white"
        ctx.strokeStyle = "black"
        ctx.font = "15px sans-serif"
        ctx.textAlign = "center"
        ctx.strokeText(this.name, this.x, this.y - this.size)
        ctx.fillText(this.name, this.x, this.y - this.size)
        ctx.closePath()
    }
    move() {
        /** KEY CODES
         * w -- 87
         * a -- 65
         * s -- 83
         * d -- 68
         * 
         * arrowUp -- 38
         * arrowDown -- 40
         * arrowLeft -- 37
         * arrowRight -- 39
         */

        if (!this.isTyping) {
            if (this.keys[65]) {
                this.velX -= this.speed
            }
            if (this.keys[68]) {
                this.velX += this.speed
            }
            if (this.keys[87]) {
                this.velY -= this.speed
            }
            if (this.keys[83]) {
                this.velY += this.speed
            }
            if (this.keys[81]) {
                this.rotVel -= this.rotSpeed
            }
            
            if (this.keys[69]) {
                this.rotVel += this.rotSpeed
            }
        }
        if (this.keys[13]) {
            if (!this.isTyping) {
                document.getElementById("msg").focus()
            }
        }

        this.velX *= this.friction
        this.velY *= this.friction
        this.rotVel *= this.friction

        this.rotation += this.rotVel
        this.x += this.velX
        this.y += this.velY
    }
}

export class Planet {
    constructor(x, y, radius, color, orbitRadius, orbitSpeed, axisRotation, star) {
        this.x = star.x+star.size
        this.y = star.y+star.size
        this.size = radius
        this.color = color
        this.type = "object"
        this.angle = 0
        this.orbitAngle = 0
        this.axisRotation = axisRotation
        this.orbitRadius = orbitRadius
        this.orbitSpeed = orbitSpeed
    }
    spin() {
        this.angle += this.axisRotation
    }
    render() {
        ctx.save()
        ctx.beginPath()
        ctx.rotate(this.angle)
        ctx.translate(this.x, this.y)
        ctx.fillStyle = this.color
        ctx.strokeStyle = darkenRGB(this.color, 15)
        contextFunctions("Circle", this.radius, 0, 0, 0, 0)
        ctx.clip()
        contextFunctions("Circle", this.radius, 0, 0, 0, 0)
        ctx.fill()
        ctx.stroke()
        for (let i = 0; i < 8; i++) {
            let random = -this.radius/2 + Math.random() * this.radius
            let random2 = -this.radius/2 + Math.random() * this.radius
            ctx.arc(random, random2, this.radius/10, 0, Math.Pi * 2)
            ctx.fillStyle = darkenRGB(this.color, 15)
            ctx.fill()
        }
        ctx.closePath()
        ctx.restore()
    }
}

export class Star {
    constructor(x, y, size, temperature, planets) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.type = "object"
        this.planets = planets;
        this.temperature = temperature;
        this.respectiveColor = "rgb(0, 0, 255)"
    }
    render() {
        ctx.save()
        ctx.shadowColor = this.respectiveColor
        ctx.shadowBlur = this.size
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        ctx.translate(this.x, this.y)
        ctx.beginPath()
        ctx.fillStyle = this.respectiveColor
        ctx.strokeStyle = darkenRGB(this.respectiveColor, 15)
        ctx.arc(0, 0, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
        ctx.restore()
    }
}