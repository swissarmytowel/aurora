import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'

export default class Wander extends Steering {

    constructor(owner, force = 1, wanderRadius = 25, wanderDistance = 100, wanderJitter = 5) {
        super(owner, [], force);
        this.radius = wanderRadius;
        this.distance = wanderDistance;
        this.jitter = wanderJitter;
    }

    calculateImpulse () {
        const radius = this.radius;

        const angle = Phaser.Math.RND.realInRange(0.0, Math.PI * 2);
        const target = new Vector2(Math.cos(angle) * radius,
                                    Math.sin(angle) * radius);

        const jitter = this.jitter;
        target.add(new Vector2(Phaser.Math.RND.realInRange(-jitter, jitter), 
                                Phaser.Math.RND.realInRange(-jitter, jitter)) );

        target.scale(radius / target.length())

        target.add(new Vector2(this.distance, 0))

        const ownerAngle = this.owner.body.velocity.angle();
        const x = target.x * Math.cos(ownerAngle) - target.y * Math.sin(ownerAngle);
        const y = target.x * Math.sin(ownerAngle) + target.y * Math.cos(ownerAngle);

        return new Vector2(x, y);;
    }
}
