import Vector2 from 'phaser/src/math/Vector2'
import Steering from './steering';

export default class GroupSeparation extends Steering {
    constructor (owner, objects, force = 1, distance=100) {
        super(owner, objects, force);
        this.owner = owner;
        this.objects = objects;
        this.force = force;
        this.distance = distance;
    }

    calculateImpulse () {
        
        let steeringForce = new Vector2(0, 0);

        this.objects.forEach(o => {
            let neighbour = new Vector2(o.x, o.y);
            const d = neighbour.distance(this.owner);

            if(d <= this.distance)
            {
                const toAgent = new Vector2(this.owner.x - neighbour.x, this.owner.y - neighbour.y);
                steeringForce.x += toAgent.x ;
                steeringForce.y += toAgent.y;
            }
        });        
        return steeringForce;
    }

}
