import EasyStar from "easystarjs";

import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import dungeonRoomJson from '../assets/dungeon_room.json'
import CharacterFactory from "../src/characters/character_factory";
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";

import Interpose from "../src/ai/steerings/interpose"
import Evade from "../src/ai/steerings/evade"
import Pursuit from "../src/ai/steerings/pursuit"

import SteeringDriven from "../src/ai/behaviour/steering_driven";

let SteeringInterposeScene = new Phaser.Class({
    
    Extends: Phaser.Scene,

    initialize:  function StartingScene() {
            Phaser.Scene.call(this, {key: 'SteeringInterposeScene'});
    },
    
    preload: function() {
         //loading map tiles and json with positions
        this.load.image("tiles", tilemapPng);
        this.load.tilemapTiledJSON("map", dungeonRoomJson);
        this.characterFactory = new CharacterFactory(this);
    },
    
    create: function(){
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
        //agent1 will pursuit the agent2
        this.agent1 = this.characterFactory.buildCharacter('punk', 100, 100, {player: false});
        //agent2 will evade the agent1
        this.agent2 = this.characterFactory.buildCharacter('blue', 300, 150, {player:false});
        
        this.agent1.addBehaviour(new SteeringDriven([new Pursuit(this.agent1, this.agent2, 1, 50, 100)]));
        this.gameObjects.push(this.agent1);
        this.physics.add.collider(this.agent1, worldLayer);
        
        this.agent2.addBehaviour(new SteeringDriven([new Evade(this.agent2, this.agent1)]));
        this.gameObjects.push(this.agent2);
        
        this.physics.add.collider(this.agent2, worldLayer);
        //agent3 will try to interpose between agent1 and agent2
        this.agent3 = this.characterFactory.buildCharacter('green', 250, 300, {player:false});
        this.agent3.addBehaviour(new SteeringDriven([new Interpose(this.agent3, this.agent1, this.agent2, 1, 75, 50, 100)]));
        this.gameObjects.push(this.agent3);
        this.physics.add.collider(this.agent3, worldLayer);
        
        this.physics.add.collider(this.agent1, this.agent3);
        this.physics.add.collider(this.agent1, this.agent2);
        this.physics.add.collider(this.agent2, this.agent3);
        this.input.keyboard.once("keydown_D", event => {
            // Turn on physics debugging to show player's hitbox
            this.physics.world.createDebugGraphic();

            const graphics = this.add
                .graphics()
                .setAlpha(0.75)
                .setDepth(20);
        });
    },
    update: function(){
        if(this.gameObjects)
            this.gameObjects.forEach(function(element){element.update();});
    },
    tilesToPixels(tileX, tileY){
        return [tileX*this.tileSize, tileY*this.tileSize];
    }
});

export default SteeringInterposeScene
