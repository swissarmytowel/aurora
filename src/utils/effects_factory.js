import tilemapPng from '../../assets/animations/vfx'

export default class EffectsFactory {

    constructor(scene) {
        this.scene = scene;
        scene.loa
        this.cyberSpritesheets =  ['aurora', 'blue', 'yellow', 'green', 'punk'];
        this.slimeSpriteSheet = 'slime';

        // const slimeStateTable = new StateTable(this);
        // slimeStateTable.addState(new StateTableRow('searching', this.foundTarget, 'jumping'));
        // slimeStateTable.addState(new StateTableRow('jumping', this.lostTarget, 'searching'));

        let animationLibrary =  new Map();
        this.cyberSpritesheets.forEach(
            function (element) {
                animationLibrary.set(element, new AnimationLoader(scene,
                    element,
                    cyberpunkConfigJson,
                    element).createAnimations());
            }
        );
        animationLibrary.set(this.slimeSpriteSheet,
            new AnimationLoader(scene, this.slimeSpriteSheet, slimeConfigJson, this.slimeSpriteSheet).createAnimations());
        this.animationLibrary = animationLibrary;
    }

    buildCharacter(spriteSheetName, x, y, params = {}) {
        switch (spriteSheetName) {
            case 'aurora':
            case 'blue':
            case 'punk':
            case 'yellow':
            case 'green':
                if (params.player)
                    return this.buildPlayerCharacter(spriteSheetName, x, y);
                else
                    return this.buildCyberpunkCharacter(spriteSheetName, x, y, params);
            case "slime":
                return this.buildSlime(x, y, params);
        }
    }

    buildPlayerCharacter(spriteSheetName, x, y) {

        let character = new Human(this.scene, x, y, spriteSheetName, 2);
        character.animationSets = this.animationLibrary.get(spriteSheetName);
        character.addBehaviour(new UserControlled(100, this.scene.input.keyboard.createCursorKeys()));

        //todo: not here
        character.footstepsMusic = this.scene.sound.add('footsteps', {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        });
        //todo uncomment at your won risk - these footsteps will get you insane
        // character.footstepsMusic.play();
        return character;

    }

    buildCyberpunkCharacter(spriteSheetName, x, y, params) {
        let human = new Human(this.scene, x, y, spriteSheetName, 2);
        human.setCollideWorldBounds(true);
        human.animationSets = this.animationLibrary.get(spriteSheetName);
        human.speed = 40;
        return human;
    }

    buildSteeringDrivenHuman(spriteSheetName, x, y, steerings)
    {
        let human = this.buildCyberpunkCharacter(spriteSheetName, x, y, {});
        human.addBehaviour(new SteeringDriven(steerings));
        return human;
    }
    buildSlime(x, y, params) {
        const slimeType = params.slimeType || 1;
        let slime = new Slime(this.scene, x, y, this.slimeSpriteSheet, 9 * slimeType);
        slime.animations = this.animationLibrary.get(this.slimeSpriteSheet).get(this.slimeNumberToName(slimeType));
        slime.setCollideWorldBounds(true);
        slime.speed = 20;
        return slime;
    }
    slimeNumberToName(n)
    {
        switch (n) {
            case 0: return 'Blue';
            case 1: return 'Green';
            case 2: return 'Orange';
            case 3: return 'Pink';
            case 4: return 'Violet';
        }
    }
}