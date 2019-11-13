import Vector2 from 'phaser/src/math/Vector2'
import Steering from "../ai/steerings/steering.js"

export default class Human extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, name, frame) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.steerings = [];
    }

    update() {

        // todo: human logic
        //const state =  this.stateTable.getNextState();
        //decisionMaker.perform(state);


        const impulse = Steering.calculateSteeringsSum(this);
        this.body.setVelocity(impulse.x, impulse.y); 
        this.updateAnimation();
    }

    setStateTable(stateTable) {
        this.stateTable = stateTable;
     }

     setDecisionMaker(decisionMaker)
     {
         this.decisionMaker = decisionMaker;
     }

     updateAnimation() {
        const animations = this.animationSets.get('Walk');
        const animsController = this.anims;
        const x = this.body.velocity.x;
        const y = this.body.velocity.y;
        if (x < 0) {
            animsController.play(animations[0], true);
        } else if (x > 0) {
            animsController.play(animations[1], true);
        } else if (y < 0) {
            animsController.play(animations[2], true);
        } else if (y > 0) {
            animsController.play(animations[3], true);
        } else {
            const currentAnimation = animsController.currentAnim;
            if (currentAnimation) {
                const frame = currentAnimation.getLastFrame();
                this.setTexture(frame.textureKey, frame.textureFrame);
            }
        }
    }
}