import { SpaceshipBody  } from "../definition.js";

export class PlayerSpaceship extends SpaceshipBody {
    constructor(x, y, sides, border, size, speed, rotation, name) {
        super(x, y, sides, border, size, speed, rotation, name)
    }
    key(e, pressed) {
        this.keys[e.keyCode] = pressed
    }
}