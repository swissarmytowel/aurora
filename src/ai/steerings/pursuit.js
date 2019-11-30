import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'

export default class Pursuit extends Steering {

    constructor (owner, target, force = 1, ownerSpeed, targetSpeed) {
        super(owner, [target], force);
        this.ownerSpeed = ownerSpeed;
        this.targetSpeed = targetSpeed
    }

    static seek(owner, target, maxSpeed) {
        const desiredVelocity = new Vector2(target.x - owner.x, target.y-owner.y)
        .normalize().scale(maxSpeed);
        const prevVelocity = new Vector2(owner.body.x-owner.body.prev.x, owner.body.y-owner.body.prev.y);
        return desiredVelocity.subtract(prevVelocity);
    }

    calculateImpulse () {
        const searcherDirection = this.owner.body.velocity;
        const target = this.objects[0];
        const targetPos = new Vector2(target.x, target.y);
        const targetDirection = target.body.velocity;
        const toTarget = new Vector2(this.owner.x - target.x, this.owner.y - target.y);
        const relativeHeading = searcherDirection.dot(targetDirection);

        if (toTarget.dot(targetDirection) < 0 || relativeHeading > -0.95)
            return Pursuit.seek(this.owner, targetPos, this.ownerSpeed);

        if (isNaN(toTarget.x))
            return  new Vector2(0, 0);
        
        const lookAheadTime = toTarget.length / (this.ownerSpeed + this.targetSpeed)
        
        return Pursuit.seek(this.owner, 
            targetPos.add(target.body.velocity.clone().scale(lookAheadTime)), 
            this.ownerSpeed);
    }
}