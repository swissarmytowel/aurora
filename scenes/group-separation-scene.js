import EasyStar from "easystarjs";

import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import dungeonRoomJson from '../assets/dungeon_room.json'
import CharacterFactory from "../src/characters/character_factory";
import GroupSeparation from "../src/ai/steerings/group_separation";
import SteeringDriven from "../src/ai/behaviour/steering_driven";

let GroupSeparationScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function GroupSeparationScene() {
        Phaser.Scene.call(this, {key: 'GroupSeparationScene'});
    },
    preload: function () {

        //loading map tiles and json with positions
        this.load.image("tiles", tilemapPng);
        this.load.tilemapTiledJSON("map", dungeonRoomJson);
        this.characterFactory = new CharacterFactory(this);
    },
    create: function () {
        this.characterFactory.loadAnimations();

        this.gameObjects = [];
        const map = this.make.tilemap({key: "map"});

        // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
        // Phaser's cache (i.e. the name you used in preload)
        const tileset = map.addTilesetImage("Dungeon_Tileset", "tiles");


        // Parameters: layer name (or index) from Tiled, tileset, x, y
        const belowLayer = map.createStaticLayer("Floor", tileset, 0, 0);
        const worldLayer = map.createStaticLayer("Walls", tileset, 0, 0);
        const aboveLayer = map.createStaticLayer("Upper", tileset, 0, 0);
        this.tileSize = 32;
        this.finder = new EasyStar.js();
        let grid = [];
        for(let y = 0; y < worldLayer.tilemap.height; y++){
            let col = [];
            for(let x = 0; x < worldLayer.tilemap.width; x++) {
                const tile = worldLayer.tilemap.getTileAt(x, y);
                col.push(tile ? tile.index : 0);
            }
            grid.push(col);
        }

        this.finder.setGrid(grid);
        this.finder.setAcceptableTiles([0]);

        worldLayer.setCollisionBetween(1, 500);
        aboveLayer.setDepth(10);

        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;

        // Creating characters
        this.characters = { }

        this.player = this.characterFactory.buildCharacter('aurora', 300, 250, {player: true});
        this.gameObjects.push(this.player);
        this.physics.add.collider(this.player, worldLayer);

        for (let i = 0; i < 5; i++) {
            this.characters['c' + i] = this.characterFactory.buildCharacter('punk', 350+Math.trunc(i/3)*100 + Math.random()*100-25, 150 + i*25 - Math.random()*50, { player: false });
            this.characters['c' + (i+5)] = this.characterFactory.buildCharacter('punk', 350-Math.trunc(i/3)*100 - Math.random()*100+25, 250 + i*25 + Math.random()*50 , { player: false });
        }

        const characters = Object.values(this.characters);

        characters.forEach(c => {
            this.gameObjects.push(c);
            this.physics.add.collider(c, worldLayer);
            this.physics.add.collider(c, this.player);
            const neighbor = characters.filter(o => o !== c);
            neighbor.push(this.player);
            c.addBehaviour(new SteeringDriven([new GroupSeparation(c, neighbor, 1, 125)]))
        });

        this.physics.add.collider(Object.values(this.characters));

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

    },
    tilesToPixels(tileX, tileY) {
        return [tileX*this.tileSize, tileY*this.tileSize];
    }
});

export default GroupSeparationScene
