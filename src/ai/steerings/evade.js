import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'

export default class Evade extends Steering {

    constructor(owner, pursuer, force = 1, ownerMaxSpeed=100, panicDistSquare = 10e3) {
        super(owner, [pursuer], force);
        this.panicDistSq = panicDistSquare;
        this.ownerMaxSpeed = ownerMaxSpeed;
    }

    static calculateFlee (owner, target, maxSpeed, panicDistSq) {
        if(new Vector2(owner.x-target.x, owner.y-target.y).lengthSq() > panicDistSq)
            return new Vector2(0, 0);
        const desiredVelocity = new Vector2(owner.x - target.x, owner.y-target.y).normalize().scale(maxSpeed);
        const prevVelocity = new Vector2(owner.body.x-owner.body.prev.x, owner.body.y-owner.body.prev.y);
        return desiredVelocity.subtract(prevVelocity);
    }

    calculateImpulse () {
        const pursuer = this.objects[0];
        const owner = this.owner;

        const toPursuer = new Vector2(pursuer.x - owner.x, pursuer.y-owner.y);

        const prevPursuerVelocity = new Vector2(pursuer.body.x-pursuer.body.prev.x, 
            pursuer.body.y-pursuer.body.prev.y); //must be pursuer.body.velocity

        const lookAheadTime = toPursuer.length() / 
                        (this.ownerMaxSpeed + prevPursuerVelocity.length());
                                    
        const targetPos = new Vector2(pursuer.x, pursuer.y).add(
                                (pursuer.body.velocity.clone())
                                .scale(lookAheadTime));

        // todo: if calculateFlee is appropriate method, then code below can be removed
        return Evade.calculateFlee(owner, targetPos, this.ownerMaxSpeed, this.panicDistSq);

        if(new Vector2(owner.x, owner.y).distanceSq(targetPos) > this.panicDistSq)
            return new Vector2(0, 0);

        const desiredVelocity = (new Vector2(owner.body.x, owner.body.y)
                                .subtract(targetPos)
                                .normalize())
                                .scale(this.ownerMaxSpeed);
                                    
        const prevVelocity = new Vector2(owner.body.x-owner.body.prev.x, owner.body.y-owner.body.prev.y)
        return desiredVelocity.subtract(prevVelocity); 
        //instead of prevVelocity must be owner.body.velocity, but it's value frequently sets on [0, 0]
    }
}