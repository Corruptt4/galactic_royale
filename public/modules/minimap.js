import { ctx, myId } from "../main.js"

export class Minimap {
    constructor(x, y, size, worldSize) {
        this.x = x;
        this.y = y;
        this.size = size*2;
        this.cameraX = null;
        this.cameraY = null;
        this.scaleDown = size/worldSize
        this.entities = new Map();
    }
    update(entities) {
        this.entities.clear();
        entities.forEach((plr) => {
            this.entities.set(plr.id, plr);
        });
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
            ctx.fillStyle = (e.id == myId) ? "rgb(255,255,255)" : e.border
            ctx.arc(this.x+(e.x)*this.scaleDown, this.y+(e.y)*this.scaleDown, 1.25, 0, Math.PI * 2)
            ctx.fill()
            ctx.closePath()
        })
    }
}