import { ctx } from "../main.js"

export class MessageBox {
    constructor(upScroll, text, user) {
        this.x = user.x
        this.y = user.y
        this.upScroll = upScroll
        this.text = text
        this.user = user
    }
    render() {
        this.y = this.user.y + 20
        ctx.beginPath()
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
        ctx.font = "15px Arial"
        let width = ctx.measureText(this.text)
        ctx.roundRect(this.x-10, this.y, width+20, 15, 6)
        ctx.fill()
        ctx.closePath()
    }
    moveUp() {
        this.y += this.upScroll
    }
}