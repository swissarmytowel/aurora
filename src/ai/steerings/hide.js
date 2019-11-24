import Steering from "./steering.js";
import Vector2 from "phaser/src/math/Vector2";
import Evade from "./evade";
import { arrive } from "./path_following";

export default class Hide extends Steering {
  constructor(
    owner,
    target,
    force = 1,
    obstacles = [],
    ownerMaxSpeed = 100,
    deceleration = 0.3,
    radius = 50,
    observationRadius = 400
  ) {
    super(owner, [target], force);
    this.obstacles = obstacles;
    this.maxSpeed = ownerMaxSpeed;
    this.deceleration = deceleration;
    this.radius = radius;
    this.observationRadius = observationRadius;
  }

  calculateImpulse() {
    const target = this.objects[0];
    const owner = this.owner;
    const ownerV = new Vector2(owner.x, owner.y);
    const targetV = new Vector2(target.x, target.y);

    if (ownerV.clone().distance(targetV) > this.observationRadius)
      return new Vector2(0, 0);

    let distToClosest = Number.MAX_VALUE;
    let bestHidingSpot;
    for (let i = 0; i < this.obstacles.length; i++) {
      const hidingSpot = Hide.getHidingPosition(
        this.obstacles[i].clone(),
        this.radius,
        targetV.clone()
      );
      const dist = hidingSpot.clone().distanceSq(ownerV);
      if (dist < distToClosest) {
        distToClosest = dist;
        bestHidingSpot = hidingSpot;
      }
    }

    if (distToClosest === Number.MAX_VALUE) {
      return new Evade(owner, target).calculateImpulse();
    }

    const _arrive = arrive.bind(this);
    return _arrive(owner, bestHidingSpot);
  }

  static getHidingPosition(posOb, radiusOb, posTarget) {
    const distanceFromBoundary = 30.0;
    const distAway = radiusOb + distanceFromBoundary;
    const toOb = posOb
      .clone()
      .subtract(posTarget)
      .normalize();
    return toOb.scale(distAway).add(posOb);
  }
}
