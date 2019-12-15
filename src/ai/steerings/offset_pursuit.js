import Steering from "./steering.js";
import Vector2 from "phaser/src/math/Vector2";
import { arrive } from "./path_following";

export default class OffsetPursuit extends Steering {
    constructor(owner, leader, force = 1, offset, ownerMaxSpeed = 100, leaderSpeed = 100, deceleration = .3) {
        super(owner, [leader], force);
        this.offset = offset;
        this.maxSpeed = ownerMaxSpeed;
        this.leaderSpeed = leaderSpeed;
        this.deceleration = deceleration;
    }

    calculateImpulse() {
        const leader = this.objects[0];
        const owner = this.owner;

        const leaderHeading = leader.body.velocity;
        const leaderPos = new Vector2(leader.x, leader.y);

        let toOffset = (leaderPos.subtract(this.offset)).subtract(new Vector2(owner.x, owner.y));

        //the look-ahead time is proportional to the distance between the leader
        //and the pursuer; and is inversely proportional to the sum of both
        //agents’ velocities
        const lookAheadTime = toOffset.length() / (this.maxSpeed + this.leaderSpeed);

        //now arrive at the predicted future position of the offset
        const predictedPosition = toOffset.add(leaderHeading.clone().scale(lookAheadTime));

        const _arrive = arrive.bind(this);
        const newPose = _arrive(owner, predictedPosition);

        return newPose;
    }
}
