import { ctx } from "../main.js"
export class SpaceshipBody {
    constructor(x, y, sides, border, size, speed, rotation) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.sides = sides;
        this.border = border;
        this.rotation = rotation;
        this.speed = speed;
        this.rotSpeed = speed/100
        this.rotVel = 0
        this.velX = 0;
        this.velY = 0;
        this.friction = 0.96
        this.keys = {}
    }
    key(e, pressed) {
        this.keys[e.keyCode] = pressed
    }
    render() {
        ctx.save()
        ctx.beginPath()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.moveTo(this.size * Math.cos(0), this.size * Math.sin(0))
        for (let i = 0; i < this.sides+1; i++) {
            ctx.lineTo(
                this.size * Math.cos((i * 2 * Math.PI) / this.sides),
                this.size * Math.sin((i * 2 * Math.PI) / this.sides)
            )
        }

        ctx.lineJoin = "round"
        ctx.strokeStyle = this.border
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.closePath()
        ctx.restore()
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

        this.velX *= this.friction
        this.velY *= this.friction
        this.rotVel *= this.friction

        this.rotation += this.rotVel
        this.x += this.velX
        this.y += this.velY
    }
}