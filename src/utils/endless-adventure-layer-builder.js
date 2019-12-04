import tilemapPng from '../../assets/tileset/islands-tileset.png'

import CharacterFactory from "../../src/characters/character_factory";

import SteeringDriven from "../../src/ai/behaviour/steering_driven";
import Wander from "../../src/ai/steerings/wander";

import Level from "./level-generator.js"


const TILE_MAPPING = {
    WATER: 13,
    DUST: {
      TOP_LEFT: 0,
      TOP_RIGHT: 2,
      BOTTOM_RIGHT: 12,
      BOTTOM_LEFT: 10,
      TOP: 1,
      LEFT: 5,
      RIGHT: 7,
      BOTTOM: 11
    },
    FLOOR: 6,
    BOAT: 14,
    SURPRIZE: {
        BONFIRE: 3,
        SKELETON: 4,
        CHEST: 8,
        KEY: 9
    }
  };

export default function buildLevel(width, height, maxRooms, scene){
    let level = new Level(width, height, maxRooms); // level is a dictionary with names as keys and dynamic levels as values
    const rooms = level.generateLevel();
    const levelMatrix = level.levelMatrix;
    // Creating a blank tilemap with dimensions matching the dungeon
    const tilesize = 32;
    scene.map = scene.make.tilemap({
        tileWidth: tilesize,
        tileHeight: tilesize,
        width: width,
        height: height
    });

    const tileset = scene.map.addTilesetImage("islands-tiles", null, tilesize, tilesize);
    const groundLayer = scene.map.createBlankDynamicLayer("Ground", tileset);
    const stuffLayer = scene.map.createBlankDynamicLayer("Stuff", tileset);

    // ground tiles mapping
    for(let y = 0; y < height; y++)
        for(let x = 0; x < width; x++)
            if(levelMatrix[y][x] === 0)
                groundLayer.putTileAt(TILE_MAPPING.WATER, x, y);
            else groundLayer.putTileAt(TILE_MAPPING.FLOOR, x, y);


    rooms.forEach(room => {
        const {x, y} = room.startCenter;
        const {width, height, left, right, top, down } = room;
        // Place the room corners tiles
        groundLayer.putTileAt(TILE_MAPPING.DUST.TOP_LEFT, left, top);
        groundLayer.putTileAt(TILE_MAPPING.DUST.TOP_RIGHT, right, top);
        groundLayer.putTileAt(TILE_MAPPING.DUST.down_RIGHT, right, down);
        groundLayer.putTileAt(TILE_MAPPING.DUST.down_LEFT, left, down);
    });

        // // Separate out the rooms into:
        // //  - The starting room (index = 0)
        // //  - A random room to be designated as the end room (with stairs and nothing else)
        // //  - An array of 90% of the remaining rooms, for placing random stuff (leaving 10% empty)
        // const rooms = this.dungeon.rooms.slice();
        // const startRoom = rooms.shift();
        // const endRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);
        // const otherRooms = Phaser.Utils.Array.Shuffle(rooms).slice(0, rooms.length * 0.9);

        // // Not exactly correct for the tileset since there are more possible floor tiles, but this will
        // // do for the example.
        // this.groundLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);
        // this.stuffLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);

        // // Place the stairs
        // this.stuffLayer.putTileAt(TILES.STAIRS, endRoom.centerX, endRoom.centerY);

        // // Place stuff in the 90% "otherRooms"
        // otherRooms.forEach(room => {
        //     let rand = Math.random();
        //     if (rand <= 0.25) {
        //         // 25% chance of chest
        //         this.stuffLayer.putTileAt(TILES.CHEST, room.centerX, room.centerY);
        //     } else if (rand <= 0.5) {
        //         // 50% chance of a pot anywhere in the room... except don't block a door!
        //         const x = Phaser.Math.Between(room.left + 2, room.right - 2);
        //         const y = Phaser.Math.Between(room.top + 2, room.bottom - 2);
        //         this.stuffLayer.weightedRandomize(x, y, 1, 1, TILES.POT);
        //         this.addNPCtoRoom(room);
        //     } else {
        //         // 25% of either 2 or 4 towers, depending on the room size
        //         if (room.height >= 9) {
        //             this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY + 1);
        //             this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY + 1);
        //             this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY - 2);
        //             this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY - 2);
        //         } else {
        //             this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY - 1);
        //             this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY - 1);

        //         }
        //         this.addNPCtoRoom(room);
        //     }
        // });



        // this.stuffLayer.setTileIndexCallback(TILES.STAIRS, (object) => {
        //     if (this.player === object)
        //     {
        //         this.stuffLayer.setTileIndexCallback(TILES.STAIRS, null);
        //         this.hasPlayerReachedStairs = true;
        //         this.player.body.moves = false;
        //         const cam = this.cameras.main;
        //         cam.fade(250, 0, 0, 0);
        //         cam.once("camerafadeoutcomplete", () => {
        //             this.player.destroy();
        //             this.scene.restart();
        //         });
        //     }

        // });

        
        // Place the player in the first room
        //const playerRoom = startRoom;
        // const x = map.tileToWorldX(playerRoom.centerX);
        // console.log(playerRoom.centerX);
        // console.log(x);
        // const y = map.tileToWorldY(playerRoom.centerY);

        scene.player = scene.characterFactory.buildCharacter('aurora', 100, 100, {player: true});
        // Watch the player and tilemap layers for collisions, for the duration of the scene:
        scene.physics.add.collider(scene.player, groundLayer);
        scene.physics.add.collider(scene.player, stuffLayer);

        // Phaser supports multiple cameras, but you can access the default camera like this:
        const camera = scene.cameras.main;
        camera.setZoom(1.0)
        // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
        camera.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);
        camera.startFollow(scene.player);

        return {"Ground" : groundLayer, "Stuff" : stuffLayer}
};

function addNPCtoRoom(room)
{
    const x = Phaser.Math.Between(room.left + 4, room.right - 5);
    const y = Phaser.Math.Between(room.top + 4, room.bottom - 5);
    let wanderer = this.characterFactory.buildCharacter( Phaser.Math.RND.integer() % 2 === 0 ? "punk" : "blue",
        x, y, {player: false});
    wanderer.addBehaviour(new SteeringDriven([ new Wander(wanderer) ])) ;
    this.gameObjects.push(wanderer);
    this.physics.add.collider(wanderer, this.groundLayer);
    this.physics.add.collider(wanderer, this.stuffLayer);
};