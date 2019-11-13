import Vector2 from 'phaser/src/math/Vector2'
import Steering from './steering';

export default class GroupAligment extends Steering {
    constructor (owner, objects, force = 1) {
        super(owner, objects, force);
        this.owner = owner;
        this.objects = objects;
        this.force = force;
    }

    calculateImpulse () {
        let dir = new Vector2(0, 0);

        this.objects.forEach(o => {
            const x = Math.abs(o.body.velocity.x) > 1 ? o.body.velocity.x : 0;
            const y = Math.abs(o.body.velocity.y) > 1 ? o.body.velocity.y : 0;
            dir.add(new Vector2(x, y));
        });

        if (this.objects.length > 0) {
            dir = dir.scale(1/this.objects.length)
        }

        console.log(dir)
        return dir;
    }

}
