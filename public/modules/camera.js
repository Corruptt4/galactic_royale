export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
    }

    follow(player) {
        this.x = player.x - canvas.width / 2;
        this.y = player.y - canvas.height / 2;
    }

    apply(ctx) {
        ctx.scale(this.zoom, this.zoom); 
        ctx.translate(-this.x, -this.y); 
    }
}
