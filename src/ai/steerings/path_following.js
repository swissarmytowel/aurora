import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'

export default class PathFollowing extends Steering {

    constructor(owner, route, force = 1) {
        super(owner, [], force);
        this.route = route;
    }

    calculateImpulse () {
        return new Vector2(-20, Math.random(130));;
    }
}
