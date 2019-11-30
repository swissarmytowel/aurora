import Steering from "../steerings/steering";
import Vector2 from 'phaser/src/math/Vector2';

export default class SteeringDriven {
    constructor(steerings, maxTimeAvoid = 20)
    {
        this.steerings =  steerings;
        this.maxTimeAvoid = maxTimeAvoid;
        this.currentTimeAvoid = 0;
        this.isAvoid = false;
        this.avoidVector = new Vector2(0, 0);
    }

    update()
    {
        const body = this.character.body;
        if(this.isAvoid)
        {
            if(this.currentTimeAvoid < this.maxTimeAvoid) {
                body.setVelocity(this.avoidVector.x, this.avoidVector.y);
                this.currentTimeAvoid++;
                return;
            } 
            else {
                this.currentTimeAvoid = 0;
                this.isAvoid = false;
            }
        }

        
        let impulse = Steering.calculateSteeringsSum(this);

        if(body.blocked.left || body.blocked.right || body.blocked.up || body.blocked.down) {
            this.isAvoid = true;

            const angle = impulse.angle();
            const length = impulse.length();

            // if character can move only down
            if(body.blocked.up && body.blocked.left && body.blocked.right)
                impulse = new Vector2(0, length);

            // if character can move only up
            else if(body.blocked.down && body.blocked.left && body.blocked.right)
                impulse = new Vector2(0, -length);

            // if character blocked from 2 sides
            else if(body.blocked.up || body.blocked.down) {
                if(body.blocked.left || angle <= Math.PI/2 || angle >= 3*Math.PI/2)
                    impulse = new Vector2(length, 0);
                else if(body.blocked.right || (angle => Math.PI/2 && angle <= 3*Math.PI/2))
                    impulse = new Vector2(-length, 0);
            }
            else if (body.blocked.left || body.blocked.right) {
                if(angle <= Math.PI/2 || angle >= 3*Math.PI/2)
                    impulse = new Vector2(0, -length);
                else if(angle >= Math.PI/2 && angle <= 3*Math.PI/2)
                    impulse = new Vector2(0, length);
            }

            this.avoidVector = impulse;
        }

        body.setVelocity(impulse.x, impulse.y);
    }
}
