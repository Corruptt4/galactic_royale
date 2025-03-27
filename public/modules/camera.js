export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.zoom = 0.2;
    }

    follow(player) {
        this.x = player.x - canvas.width / 2;
        this.y = player.y - canvas.height / 2;
    }

    apply(ctx) {
        ctx.translate(-this.x, -this.y); 
        ctx.scale(this.zoom, this.zoom); 
    }
}
