import Vector2 from 'phaser/src/math/Vector2'

export default class Steering {
    constructor (owner, objects, force = 1) {
        this.owner = owner;
        this.objects = objects;
        this.force = force;
    }

    calculateImpulse () {
        return new Vector2(0, 0);
    }

    static calculateSteeringsSum(object) {
        return object.steerings? object.steerings.reduce( 
                    (sum, steering) => sum.add(steering.calculateImpulse()
                        .scale(steering.force)),
                    new Vector2(0, 0)) : 
            new Vector2(0, 0);
    }
}
