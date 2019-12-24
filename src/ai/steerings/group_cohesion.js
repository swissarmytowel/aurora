import Vector2 from 'phaser/src/math/Vector2'
import Steering from './steering';
import {arrive} from "./path_following";

export default class CohesionSteering extends Steering {
    constructor(owner, objects, force = 1, distance = 100, deceleration = 0.3, maxSpeed = 100, privateSpace = 30) {
        super(owner, objects, force);
        this.distance = distance;
        this.maxSpeed = maxSpeed;
        this.deceleration = deceleration;
        this.privateSpace = privateSpace;// Math.min(this.distance / 2, privateSpace);
    }

    calculateImpulse() {
        let count = 0;
        let target = new Vector2(0, 0);
        this.objects.forEach(obj => {
            if (this.isValidNeighbourPair(obj, this.owner)) {
                target = target.add(obj);
                count++;
            }
        });
        // return count > 0 ? arrive.bind(this)(this.owner, target.scale(1/count)) : new Vector2(0, 0);
        if(count > 0 ){
            target =  target.scale(1 / count);
            if(target.distance(this.owner) > this.privateSpace){
                return arrive.bind(this)(this.owner, target);
            }
        }
        return new Vector2(0, 0);
    }

    isValidNeighbourPair(first, second){
        const distance = (new Vector2(first.x, first.y)).distance(new Vector2(second.x, second.y));
        return distance > 0 && distance < this.distance;
    }
}