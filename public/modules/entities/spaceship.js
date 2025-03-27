import { SpaceshipBody  } from "../definition.js";

export class PlayerSpaceship extends SpaceshipBody {
    constructor(x, y, sides, border, size, speed, rotation) {
        super(x, y, sides, border, size, speed, rotation)
    }
    key(e, pressed) {
        this.keys[e.keyCode] = pressed
    }
}