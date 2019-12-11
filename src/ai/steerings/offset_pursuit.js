import Steering from "./steering.js";
import Vector2 from "phaser/src/math/Vector2";
import Evade from "./evade";
import {arrive} from "./path_following";

export default class OffsetPursuit extends Steering {
    constructor(owner, leader, force = 1, offset, ownerMaxSpeed = 100, leaderSpeed = 100) {
        super(owner, [leader], force);
        this.offset = offset;
        this.maxSpeed = ownerMaxSpeed;
        this.leaderSpeed = leaderSpeed;
    }

    // Вопросы:
    // 1) что такое offset у лидера
    // 2) что такое leader->Side
    // 3) как реализовать PointToWorldSpace

    calculateImpulse() {
        const leader = this.objects[0];
        const owner = this.owner;

        const leaderHeading = leader.body.velocity;
        //const leaderSide = ...
        const leaderPos = new Vector2(leader.x, leader.y);

        //let worldOffsetPose = PointToWorldSpace(this.offset,
        //                                        leaderHeading,
        //                                        leader->Side(),
        //                                        leaderPos);

        const leaderAngle = leader.body.velocity.angle();
        const x = offset.x * Math.cos(leaderAngle) - offset.y * Math.sin(leaderAngle);
        const y = offset.x * Math.sin(leaderAngle) + offset.y * Math.cos(leaderAngle);
        let worldOffsetPose = new Vector2(x, y);

        let toOffset = worldOffsetPose.subtract(new Vector2(owner.x, owner.y));

        //the look-ahead time is proportional to the distance between the leader
        //and the pursuer; and is inversely proportional to the sum of both
        //agents’ velocities
        const lookAheadTime = toOffset.Length() / (this.ownerMaxSpeed + this.leaderSpeed);

        //const leaderVelocity = new Vector2(leader.body.x - leader.body.prev.x, leader.body.y - leader.body.prev.y);

        //now arrive at the predicted future position of the offset
        const _arrive = arrive.bind(this);
        const predictedPosition = worldOffsetPose.add(leader.body.velocity.clone().scale(lookAheadTime));
        return _arrive(owner, predictedPosition);
    }
}
