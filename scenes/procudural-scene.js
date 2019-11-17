import EasyStar from "easystarjs";

import tilemapPng from '../assets/tileset/buch-tileset-48px-extruded.png'
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import blueSpriteSheet from '../assets/sprites/characters/blue.png'
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png'
import greenSpriteSheet from '../assets/sprites/characters/green.png'
import slimeSpriteSheet from '../assets/sprites/characters/slime.png'
import CharacterFactory from "../src/characters/character_factory";
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";
import RoomGenerator from "../src/utils/room-generator";
import Dungeon from "@mikewesthad/dungeon";
import TILES from  '../src/utils/tile-mapping'
import TilemapVisibility from "../src/utils/tilemap-visibility";
let ProceduralScene = new Phaser.Class({

    Extends: Phaser.Scene,
    characterFrameConfig: {frameWidth: 31, frameHeight: 31},
    slimeFrameConfig: {frameWidth: 32, frameHeight: 32},

    initialize: function ProceduralScene() {
        Phaser.Scene.call(this, {key: 'ProceduralScene'});
    },
    preload: function () {

        //loading map tiles and json with positions
        this.load.image("tiles", tilemapPng);

        //loading spitesheets
        this.load.spritesheet('aurora', auroraSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('blue', blueSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('green', greenSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('yellow', yellowSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('punk', punkSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('slime', slimeSpriteSheet, this.slimeFrameConfig);
        this.load.audio('footsteps', Footsteps);

        this.dungeon = new Dungeon({
            width: 40,
            height: 40,
            rooms: {
                width: {
                    min: 5,
                    max: 10
                },
                height: {
                    min: 8,
                    max: 20
                },
                maxArea: 150,
                maxRooms: 10
            }
        });


       // this.dungeon.drawToConsole();

    },
    create: function () {
        this.level++;
        this.hasPlayerReachedStairs = false;

        // Generate a random world with a few extra options:
        //  - Rooms should only have odd number dimensions so that they have a center tile.
        //  - Doors should be at least 2 tiles away from corners, so that we can place a corner tile on
        //    either side of the door location
        this.dungeon = new Dungeon({
            width: 50,
            height: 50,
            doorPadding: 3,
            rooms: {
                width: { min: 7, max: 15, onlyOdd: true },
                height: { min: 7, max: 15, onlyOdd: true }
            }
        });

       // this.dungeon.drawToConsole();

        // Creating a blank tilemap with dimensions matching the dungeon
        const map = this.make.tilemap({
            tileWidth: 48,
            tileHeight: 48,
            width: this.dungeon.width,
            height: this.dungeon.height
        });
        const tileset = map.addTilesetImage("tiles", null, 48, 48, 1, 2);
        this.groundLayer = map.createBlankDynamicLayer("Ground", tileset).fill(TILES.BLANK);
        this.stuffLayer = map.createBlankDynamicLayer("Stuff", tileset);
      //  const shadowLayer = map.createBlankDynamicLayer("Shadow", tileset).fill(TILES.BLANK);

     //   this.tilemapVisibility = new TilemapVisibility(shadowLayer);

        // Use the array of rooms generated to place tiles in the map
        // Note: using an arrow function here so that "this" still refers to our scene
        this.dungeon.rooms.forEach(room => {
            const { x, y, width, height, left, right, top, bottom } = room;

            // Fill the floor with mostly clean tiles, but occasionally place a dirty tile
            // See "Weighted Randomize" example for more information on how to use weightedRandomize.
            this.groundLayer.weightedRandomize(x + 1, y + 1, width - 2, height - 2, TILES.FLOOR);

            // Place the room corners tiles
            this.groundLayer.putTileAt(TILES.WALL.TOP_LEFT, left, top);
            this.groundLayer.putTileAt(TILES.WALL.TOP_RIGHT, right, top);
            this.groundLayer.putTileAt(TILES.WALL.BOTTOM_RIGHT, right, bottom);
            this.groundLayer.putTileAt(TILES.WALL.BOTTOM_LEFT, left, bottom);

            // Fill the walls with mostly clean tiles, but occasionally place a dirty tile
            this.groundLayer.weightedRandomize(left + 1, top, width - 2, 1, TILES.WALL.TOP);
            this.groundLayer.weightedRandomize(left + 1, bottom, width - 2, 1, TILES.WALL.BOTTOM);
            this.groundLayer.weightedRandomize(left, top + 1, 1, height - 2, TILES.WALL.LEFT);
            this.groundLayer.weightedRandomize(right, top + 1, 1, height - 2, TILES.WALL.RIGHT);

            // Dungeons have rooms that are connected with doors. Each door has an x & y relative to the
            // room's location. Each direction has a different door to tile mapping.
            var doors = room.getDoorLocations(); // → Returns an array of {x, y} objects
            for (var i = 0; i < doors.length; i++) {
                if (doors[i].y === 0) {
                    this.groundLayer.putTilesAt(TILES.DOOR.TOP, x + doors[i].x - 1, y + doors[i].y);
                } else if (doors[i].y === room.height - 1) {
                    this.groundLayer.putTilesAt(TILES.DOOR.BOTTOM, x + doors[i].x - 1, y + doors[i].y);
                } else if (doors[i].x === 0) {
                    this.groundLayer.putTilesAt(TILES.DOOR.LEFT, x + doors[i].x, y + doors[i].y - 1);
                } else if (doors[i].x === room.width - 1) {
                    this.groundLayer.putTilesAt(TILES.DOOR.RIGHT, x + doors[i].x, y + doors[i].y - 1);
                }
            }
        });

        // Separate out the rooms into:
        //  - The starting room (index = 0)
        //  - A random room to be designated as the end room (with stairs and nothing else)
        //  - An array of 90% of the remaining rooms, for placing random stuff (leaving 10% empty)
        const rooms = this.dungeon.rooms.slice();
        const startRoom = rooms.shift();
        const endRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);
        const otherRooms = Phaser.Utils.Array.Shuffle(rooms).slice(0, rooms.length * 0.9);

        // Place the stairs
        this.stuffLayer.putTileAt(TILES.STAIRS, endRoom.centerX, endRoom.centerY);

        // Place stuff in the 90% "otherRooms"
        otherRooms.forEach(room => {
            var rand = Math.random();
            if (rand <= 0.25) {
                // 25% chance of chest
                this.stuffLayer.putTileAt(TILES.CHEST, room.centerX, room.centerY);
            } else if (rand <= 0.5) {
                // 50% chance of a pot anywhere in the room... except don't block a door!
                const x = Phaser.Math.Between(room.left + 2, room.right - 2);
                const y = Phaser.Math.Between(room.top + 2, room.bottom - 2);
                this.stuffLayer.weightedRandomize(x, y, 1, 1, TILES.POT);
            } else {
                // 25% of either 2 or 4 towers, depending on the room size
                if (room.height >= 9) {
                    this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY + 1);
                    this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY + 1);
                    this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY - 2);
                    this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY - 2);
                } else {
                    this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY - 1);
                    this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY - 1);
                }
            }
        });

        // Not exactly correct for the tileset since there are more possible floor tiles, but this will
        // do for the example.
        this.groundLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);
        this.stuffLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);

        this.stuffLayer.setTileIndexCallback(TILES.STAIRS, () => {
            this.stuffLayer.setTileIndexCallback(TILES.STAIRS, null);
            this.hasPlayerReachedStairs = true;
            this.player.freeze();
            const cam = this.cameras.main;
            cam.fade(250, 0, 0, 0);
            cam.once("camerafadeoutcomplete", () => {
                this.player.destroy();
                this.scene.restart();
            });
        });

        // Place the player in the first room
        const playerRoom = startRoom;
        const x = map.tileToWorldX(playerRoom.centerX);
        const y = map.tileToWorldY(playerRoom.centerY);
        this.characterFactory = new CharacterFactory(this);
        this.player = this.characterFactory.buildCharacter('aurora', x, y, {player: true});
        // Watch the player and tilemap layers for collisions, for the duration of the scene:
        this.physics.add.collider(this.player, this.groundLayer);
        this.physics.add.collider(this.player, this.stuffLayer);

        // Phaser supports multiple cameras, but you can access the default camera like this:
        const camera = this.cameras.main;

        // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        camera.startFollow(this.player);
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
     /*   const playerTileX = this.groundLayer.worldToTileX(this.player.positionX);
        const playerTileY = this.groundLayer.worldToTileY(this.player.positionY);
        if (!isNaN(playerTileX))
        {
            const playerRoom = this.dungeon.getRoomAt(playerTileX, playerTileY);
            this.tilemapVisibility.setActiveRoom(playerRoom);
        }
*/

        this.input.keyboard.once("keydown_D", event => {
            // Turn on physics debugging to show player's hitbox
            this.physics.world.createDebugGraphic();

            const graphics = this.add
                .graphics()
                .setAlpha(0.75)
                .setDepth(20);
        });

    },
    tilesToPixels(tileX, tileY) {
        return [tileX*this.tileSize, tileY*this.tileSize];
    }
});

export default ProceduralScene