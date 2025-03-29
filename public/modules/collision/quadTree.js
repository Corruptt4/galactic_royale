
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

    intersects(range) {
        return !(
            range.x - range.w > this.x + this.w ||
            range.x + range.w < this.x - this.w ||
            range.y - range.h > this.y + this.h ||
            range.y + range.h < this.y - this.h 
        )
    }
}

export class QuadTree {
    constructor(boundary, capacity) {
        this.setBounds = boundary
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

    query(range) {
        let found = []
        if (!this.boundary.intersects(range)) {
            return found;
        } else {
            for (let p of this.points) {
                if (range.contains(p)) found.push(p)
            }
            if (this.divided) {
                found = found.concat(this.northwest.query(range));
                found = found.concat(this.northeast.query(range));
                found = found.concat(this.southwest.query(range));
                found = found.concat(this.southeast.query(range));
            }
            return found
        }
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
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        return distance < ((a.size + b.size)*0.8);
    }

    insert(point) {
        this.boundary = new Rect(-this.setBounds/2, -this.setBounds/2, this.setBounds, this.setBounds)

        if (!this.boundary.contains(point)) {
            return false;
        }

        if (this.points.length < this.capacity) {
            this.points.push(point)
            return true
        }
        
        if (!this.divided) {
            this.subdivide();
            this.divided = true;
        }

        return (
            this.northeast.insert(point) ||
            this.northwest.insert(point) ||
            this.southeast.insert(point) ||
            this.southwest.insert(point)
        );
    }
}