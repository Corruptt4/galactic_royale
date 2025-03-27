import { ctx } from "../main.js"

export class Minimap {
    constructor(x, y, size, entities, worldSize) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.scaleDown = size/worldSize
        this.entities = entities;
    }
    render() {
        ctx.beginPath()
        ctx.fillStyle = "rgb(55,55,55)"
        ctx.strokeStyle = "rgb(75,75,75)"
        ctx.roundRect(this.x, this.y, this.size, this.size, 5)
        ctx.lineWidth = 3
        ctx.stroke()
        ctx.fill()
        ctx.closePath()
        
        this.entities.forEach((e) => {
            ctx.beginPath()
            ctx.fillStyle = e.border
            ctx.arc(this.x+e.x*this.scaleDown, this.x+e.y*this.scaleDown, 1.25, 0, Math.PI * 2)
            ctx.fill()
            ctx.closePath()
        })
    }
}