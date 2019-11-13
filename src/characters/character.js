export default class Character extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, name, frame) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);
    }

    update() {
      this.updateAnimation();
    };
    updateAnimation() {

    };
}
