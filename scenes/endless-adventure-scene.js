import buildLevel from "../src/utils/endless-adventure-layer-builder";

let EndlessAdventureScene = new Phaser.Class({

    Extends: Phaser.Scene,


    initialize: function ProceduralScene() {
        Phaser.Scene.call(this, {key: 'EndlessAdventureScene'});
    },

    preload: function () {
        scene.characterFactory = new CharacterFactory(this);
        this.load.image("islands-tiles", tilemapPng);
    },
    
    create: function () {
        this.characterFactory.loadAnimations();

        this.level++;
        this.hasPlayerReachedStairs = false;

        this.gameObjects = [];
        let width = 100; let height = 100; let maxRooms = 100;
        const layers = buildLevel(width, height, maxRooms, this);
        this.groundLayer = layers["Ground"];
        this.stuffLayer = layers["Stuff"];

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
        if (this.hasPlayerReachedStairs) return;

        this.player.update();

        // Find the player's room using another helper method from the dungeon that converts from
        // dungeon XY (in grid units) to the corresponding room object
        const playerTileX = this.groundLayer.worldToTileX(this.player.x);
        const playerTileY = this.groundLayer.worldToTileY(this.player.y);
        // if (!isNaN(playerTileX))
        // {
        //     const playerRoom = this.dungeon.getRoomAt(playerTileX, playerTileY);
        //     this.tilemapVisibility.setActiveRoom(playerRoom);
        // }



    },
    tilesToPixels(tileX, tileY) {
        return [tileX*this.tileSize, tileY*this.tileSize];
    }
});

export default EndlessAdventureScene