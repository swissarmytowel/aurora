import Character from "./character";


export default class Human extends Character {
    addBehaviour(behaviour) {
        behaviour.character = this;
        this.behaviuors.push(behaviour);
    }

    update() {
        this.behaviuors.forEach(x => x.update());
        this.updateAnimation();
    };

    updateAnimation() {
        try {

            const animations = this.animationSets.get('Walk');
            const animsController = this.anims;
            const x = this.body.velocity.x;
            const y = this.body.velocity.y;


            if (this.footstepsMusic !== undefined) {
                if (x !== 0 || y !== 0 && this.footstepsMusic.isPaused)
                    this.footstepsMusic.resume();
            }


            if (x < 0) {
                animsController.play(animations[0], true);
            } else if (x > 0) {
                animsController.play(animations[1], true);
            } else if (y < 0) {
                animsController.play(animations[2], true);
            } else if (y > 0) {
                animsController.play(animations[3], true);
            } else {
                //todo: probably not here
                if (this.footstepsMusic !== undefined) {
                    this.footstepsMusic.pause();
                }

                const currentAnimation = animsController.currentAnim;
                if (currentAnimation) {
                    const frame = currentAnimation.getLastFrame();
                    this.setTexture(frame.textureKey, frame.textureFrame);
                }
                // todo: check with steering
                // this.alignStanding();
            }
        } catch (e) {

        }
    }

    alignStanding() {
        if (this.body.velocity.length() !== 0) {
            this.viewDirection.x = this.body.velocity.x;
            this.viewDirection.y = this.body.velocity.y;
            this.viewDirection.normalize();
        }
        if (this.viewDirection.x >= this.viewDirection.y) {
            this.setFrame(this.viewDirection.x >= 0 ? 16 : 9);
        } else {
            this.setFrame(this.viewDirection.y > 0 ? 1 : 26);
        }

    }
}
