import { ctx, messages } from "../main.js"

export class MessageBox {
    constructor(upScroll, text, user) {
        this.x = user.x
        this.y = user.y-40
        this.upScroll = upScroll
        this.text = text
        this.user = user
        this.timer = 180
        this.opacity = 1
    }
    render() {
        ctx.beginPath()
        ctx.fillStyle = `rgb(255, 255, 255)`
        ctx.font = "15px Arial"
        ctx.textAlign = "center"
        let width = ctx.measureText(this.text).width
        ctx.roundRect(this.x-width/2, this.y-20, width+20, 15, 6)
        ctx.fill()
        ctx.fillStyle = "black"
        ctx.fillText(this.text, this.x, this.y-7.5)
        ctx.closePath()
    }
    moveUp() {
        this.y -= this.upScroll
    }
    expire() {
        this.timer -= 1
        this.opacity -= 1/180
        if (this.timer <= 0) {
            messages.splice(messages.indexOf(this), 1)
        }
    }
}