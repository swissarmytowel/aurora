import Steering from "./steering.js";
import Pursuit from './pursuit.js'
import Evade from './evade.js'
import Vector2 from 'phaser/src/math/Vector2'

export default class Interpose extends Steering {

    constructor (owner, agent1, agent2, force = 1, ownerSpeed, agent1Speed, agent2Speed) {
        super(owner, [agent1, agent2], force);
        this.ownerSpeed = ownerSpeed;
        this.agent1Speed = agent1Speed;
        this.agent2Speed = agent2Speed;
    }

    calculateImpulse () {

        const pursuitSteering = new Pursuit(this.objects[0], this.objects[1], 1, this.agent1Speed, this.agent2Speed);
        const evadeSteering = new Evade(this.objects[1], this.objects[0]);
        
        let midPoint = new Vector2( (this.objects[0].x + this.objects[1].x)/2,
                                      (this.objects[0].y + this.objects[1].y)/2);
        
        const timeToReachMidPoint = midPoint.distance(this.owner) / this.ownerSpeed;
        const evadePoint = evadeSteering.calculateImpulse();
        const pursuitPoint = pursuitSteering.calculateImpulse();
        
        let direction1 = ((evadePoint.x - this.objects[1].x) > 0)? 1: -1;
        let direction2 = ((evadePoint.y - this.objects[1].y) > 0)? 1: -1;
        const agent1NextPos = new Vector2(this.objects[1].x + this.agent1Speed*timeToReachMidPoint*direction1, this.objects[1].y + this.agent1Speed*timeToReachMidPoint*direction2);
        
        direction1 = ((pursuitPoint.x - this.objects[0].x) > 0)? 1: -1;
        direction2 = ((pursuitPoint.y - this.objects[0].y) > 0)? 1: -1;
        const agent2NextPos = new Vector2(this.objects[0].x + this.agent1Speed*timeToReachMidPoint*direction1, this.objects[0].y + this.agent1Speed*timeToReachMidPoint*direction2);
        
        midPoint.x = (agent1NextPos.x + agent2NextPos.x)/2;
        midPoint.y = (agent1NextPos.y + agent2NextPos.y)/2;
        direction1 = ((midPoint.x - this.owner.x)>0) ? 1: -1;
        direction2 = ((midPoint.y - this.owner.y)>0) ? 1: -1;
        
        return new Vector2( this.ownerSpeed*timeToReachMidPoint*direction1,
                            this.ownerSpeed*timeToReachMidPoint*direction2);
        
    }
}
