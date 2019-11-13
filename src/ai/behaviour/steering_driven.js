import Steering from "../steerings/steering";
export default class SteeringDriven {
    constructor(steerings)
    {
        this.steerings =  steerings;
    }

    update()
    {
        const impulse = Steering.calculateSteeringsSum(this);
        this.character.body.setVelocity(impulse.x, impulse.y);
    }
}