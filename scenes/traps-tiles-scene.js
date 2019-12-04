import EasyStar from "easystarjs";

import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import dungeonRoomJson from '../assets/dungeon_room.json'

import tilemapTraps from '../assets/tileset/Traps_Tileset.png'
import trapsJson from '../assets/traps_tileset.json'

import CharacterFactory from "../src/characters/character_factory";


import Wander from "../src/ai/steerings/wander"
import SteeringDriven from "../src/ai/behaviour/steering_driven";

let TrapsTilesScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function StartingScene() {
            Phaser.Scene.call(this, {key: 'TrapsTilesScene'});
        },
    characterFrameConfig: {frameWidth: 31, frameHeight: 31},

    preload: function () {

        //loading map tiles and json with positions
        this.load.image("tiles", tilemapPng);
        this.load.tilemapTiledJSON("map", dungeonRoomJson);
        this.load.image("tilesTraps", tilemapTraps);
        this.load.tilemapTiledJSON("mapTraps", trapsJson);
        this.characterFactory = new CharacterFactory(this);
    },
    create: function () {
        this.characterFactory.loadAnimations();

        this.gameObjects = [];
        const map = this.make.tilemap({key: "map"});

        // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
        // Phaser's cache (i.e. the name you used in preload)
        const tileset = map.addTilesetImage("Dungeon_Tileset", "tiles");
        const tilesetTraps = map.addTilesetImage("Traps_Tileset", "tilesTraps");

        // Parameters: layer name (or index) from Tiled, tileset, x, y
        const belowLayer = map.createStaticLayer("Floor", tilesetTraps, 0, 0);
        const worldLayer = map.createStaticLayer("Walls", tilesetTraps, 0, 0);
        const aboveLayer = map.createStaticLayer("Upper", tilesetTraps, 0, 0);
        this.tileSize = 32;
        this.finder = new EasyStar.js();
        let grid = [];
        for(let y = 0; y < worldLayer.tilemap.height; y++){
            let col = [];
            for(let x = 0; x < worldLayer.tilemap.width; x++) {
                const tile = worldLayer.tilemap.getTileAt(x, y);
                col.push(x % 2)
                //col.push(tile ? tile.index : 0);
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
        for(let i = 0; i < 10; i++)
        {
            let str = i%2 == 0? "punk" : "blue";
            this.wanderer = this.characterFactory.buildCharacter(str, 300, 100, {player: false});
            this.wanderer.addBehaviour(new SteeringDriven([ new Wander(this.wanderer) ])) ;
            this.gameObjects.push(this.wanderer);
            this.physics.add.collider(this.wanderer, worldLayer);
        }
        this.wanderer = this.characterFactory.buildCharacter('punk', 100, 100, {player: true});
        this.wanderer.addBehaviour(new SteeringDriven([ new Wander(this.wanderer) ])) ;
        this.gameObjects.push(this.wanderer);
        this.physics.add.collider(this.wanderer, worldLayer);

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
        if (this.gameObjects)
        {
            this.gameObjects.forEach( function(element) {
                element.update();
            });
        }

    },
    tilesToPixels(tileX, tileY)
    {
        return [tileX*this.tileSize, tileY*this.tileSize];
    }
});

export default TrapsTilesScene