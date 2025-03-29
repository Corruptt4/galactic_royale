
export class Rect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
    }

    contains(point) {
        return (point.x >= this.x-this.w &&
            point.x <= this.x+this.w &&
            point.y >= this.y-this.h &&
            point.y <= this.y+this.h
        )
    }

    intersects(point) {
        return !(
            point.x - point.size > this.x + this.w ||
            point.x + point.size < this.x - this.w ||
            point.y - point.size > this.y + this.h ||
            point.y + point.size < this.y - this.h 
        )
    }
}

export class QuadTree {
    constructor(boundary, capacity) {
        this.boundary = boundary
        this.capacity = capacity
        this.points = []
        this.divided = false;
        this.collisions = []
    }
    subdivide() {
        let { x, y, w, h } = this.boundary;
        let halfW = w / 2;
        let halfH = h / 2;

        let ne = new Rect(x + halfW, y - halfH, halfW, halfH);
        let nw = new Rect(x - halfW, y - halfH, halfW, halfH);
        let se = new Rect(x + halfW, y + halfH, halfW, halfH);
        let sw = new Rect(x - halfW, y + halfH, halfW, halfH);
        this.northeast = new QuadTree(ne, this.capacity)
        this.northwest = new QuadTree(nw, this.capacity)
        this.southeast = new QuadTree(se, this.capacity)
        this.southwest = new QuadTree(sw, this.capacity)
    }
    reset() {
        this.points = []
        this.divided = false
        this.northeast = null
        this.northwest = null
        this.southeast = null
        this.southwest = null
    }

    findAndCheckCollisions() {
        this.points.forEach((p) => {
            let group = [p]
            for (let i = 0; i < this.points.length; i++) {
                if (p !== this.points[i] && this.checkCollision(p, this.points[i])) {
                    if (!group.includes(this.points[i])) {
                        group.push(this.points[i])
                    }
                }
            }

            if (group.length > 1) {
                this.collisions.push(group)
            }
        })
        if (this.divided) {
            this.collisions.push(...this.northwest.findAndCheckCollisions());
            this.collisions.push(...this.northeast.findAndCheckCollisions());
            this.collisions.push(...this.southwest.findAndCheckCollisions());
            this.collisions.push(...this.southeast.findAndCheckCollisions());
        }

        return this.collisions;
    }
    checkCollision(a, b) {
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let distance = dx * dx + dy * dy
        let radius = a.size + b.size
        return distance < (Math.pow(radius, 2)*((a.type == "player" && b.type == "player" && !a.isSpactating && !b.isSpectating) ? 0.8 : 1));
    }

    insert(point) {
        if (!this.boundary.contains(point)) {
            return false;
        }

        if (this.points.length < this.capacity) {
            this.points.push(point)
        } else {
            this.subdivide()
            this.divided = true
            if (this.northeast.boundary.intersects(point)) {
                this.northeast.insert(point)
            }
            if (this.northwest.boundary.intersects(point)) {
                this.northwest.insert(point)
            }
            if (this.southeast.boundary.intersects(point)) {
                this.southeast.insert(point)
            }
            if (this.southwest.boundary.intersects(point)) {
                this.southwest.insert(point)
            }
        }
    }
}