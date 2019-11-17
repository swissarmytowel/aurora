import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'

export default class Flee extends Steering {

    constructor(owner, target, force = 1, ownerMaxSpeed = 100, panicDistSq = 10000) {
        super(owner, [target], force);
        this.maxSpeed = ownerMaxSpeed;
        this.panicDistSq = panicDistSq;
    }

    calculateImpulse () {
        const target = this.objects[0];
        const owner = this.owner;
        if(new Vector2(owner.x-target.x, owner.y-target.y).lengthSq() > this.panicDistSq)
            return new Vector2(0, 0);
        const desiredVelocity = new Vector2(owner.x - target.x, owner.y-target.y).normalize().scale(this.maxSpeed);
        const prevVelocity = new Vector2(owner.body.x-owner.body.prev.x, owner.body.y-owner.body.prev.y);
        return desiredVelocity.subtract(prevVelocity); //must be owner.body.velocity, but it's value sets on [0, 0] every second frame
    }
}
