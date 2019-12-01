import CharacterFactory from "../src/characters/character_factory";

import Level from "../src/utils/level-generator.js"


let EndlessAdventureScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function ProceduralScene() {
        Phaser.Scene.call(this, {key: 'EndlessAdventureScene'});
    },

    preload: function () {

        this.characterFactory = new CharacterFactory(this);
    },

    create: function () {
        this.characterFactory.loadAnimations();

        this.gameObjects = [];


        //метод генерации уровня получает пустой список дескрипторов и его изменяет
        //но возвращает - динамический слой с уже полным уровнем
        
        let level = new Level(10, 10, 5, 0.3);
        level.generateLevel();
        level.print();

        this.player = this.characterFactory.buildCharacter('aurora', x, y, {player: true});
        const camera = this.cameras.main;
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        camera.startFollow(this.player);

        this.input.keyboard.once("keydown_D", event => {
            // Turn on physics debugging to show player's hitbox
            this.physics.world.createDebugGraphic();

            const graphics = this.add
                .graphics()
                .setAlpha(0.75)
                .setDepth(20);
        });
    },

    update: function () {
        if (this.gameObjects) {
            this.gameObjects.forEach( function(element) {
                element.update();
            });
        }

        this.player.update();  
    }

});
export default EndlessAdventureScene