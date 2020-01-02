import CellularAutomataLevel from "../src/utils/cellular-automata-level-builder";
import CharacterFactory from "../src/characters/character_factory";
import tilemapPng from "../assets/tileset/blowharder2.png";
import SteeringDriven from "../src/ai/behaviour/steering_driven";
import Wander from "../src/ai/steerings/wander";

const TILES = {
  BLANK: 11,
  FLOOR: [
    { index: 69, weight: 9 },
    { index: [120, 137, 121, 35, 20, 3, 18], weight: 1 }
  ],
  WALL: [
    { index: [38, 21], weight: 4 },
    { index: [4], weight: 1 }
  ],
  HOUSE: 2
};

let CellularAutomataScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function CellularAutomataScene() {
    Phaser.Scene.call(this, { key: "CellularAutomataScene" });
  },

  preload: function() {
    this.load.image("blowharder2", tilemapPng);
    this.characterFactory = new CharacterFactory(this);
  },

  create: function() {
    this.characterFactory.loadAnimations();

    this.level++;
    this.hasPlayerReachedStairs = false;
    this.gameObjects = [];

    this.cave = new CellularAutomataLevel(200, 100);
    this.cave.buildLevel();

    const map = this.make.tilemap({
      tileWidth: 32,
      tileHeight: 32,
      width: this.cave.width,
      height: this.cave.height
    });
    
    this.map = map;

    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;

    const tileset = map.addTilesetImage("blowharder2", null, 32, 32);
    this.groundLayer = map
      .createBlankDynamicLayer("Ground", tileset)
      .fill(TILES.BLANK);
    this.stuffLayer = map.createBlankDynamicLayer("Stuff", tileset);

    for (let x = 0; x < this.cave.width; x++)
      for (let y = 0; y < this.cave.height; y++) {
        if (this.cave.levelMatrix[x][y] === 0)
          this.groundLayer.weightedRandomize(x, y, 32, 32, TILES.WALL);
        else this.groundLayer.weightedRandomize(x, y, 32, 32, TILES.FLOOR);
      }

    this.groundLayer.setCollisionByExclusion([
      120,
      137,
      121,
      35,
      20,
      3,
      18,
      69,
      2
    ]);

    this.stuffLayer.setCollisionByExclusion([120, 137, 121, 35, 20, 3, 18, 69, 2]);

    let startPoint = this.cave.getStartPosition();
    const x = map.tileToWorldX(startPoint.x);
    const y = map.tileToWorldY(startPoint.y);

    let warmHousePoint = this.cave.getWarmHouse();

    this.stuffLayer.putTileAt(TILES.HOUSE, warmHousePoint.x, warmHousePoint.y);

    this.player = this.characterFactory.buildCharacter("aurora", x, y, {
      player: true
    });
    // Watch the player and tilemap layers for collisions, for the duration of the scene:
    this.physics.add.collider(this.player, this.groundLayer);
    this.physics.add.collider(this.player, this.stuffLayer);

    for(let i = 0; i < 400; i++)
      this.addNpc(startPoint);

    this.stuffLayer.setTileIndexCallback(TILES.HOUSE, object => {
      if (this.player === object) {
        this.stuffLayer.setTileIndexCallback(TILES.HOUSE, null);
        this.hasPlayerReachedStairs = true;
        this.player.body.moves = false;
        const cam = this.cameras.main;
        cam.fade(250, 0, 0, 0);
        cam.once("camerafadeoutcomplete", () => {
          this.player.destroy();
          this.scene.restart();
        });
      }
    });

    const camera = this.cameras.main;

    // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
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
  addNpc: function(playerPoint) {
    let point = this.cave.getNpc(playerPoint);
    let x = this.map.tileToWorldX(point.x);
    let y = this.map.tileToWorldY(point.y);
    let wanderer = this.characterFactory.buildCharacter(
      Phaser.Math.RND.integer() % 2 === 0 ? "punk" : "blue",
      x,
      y,
      { player: false }
    );
    wanderer.addBehaviour(new SteeringDriven([new Wander(wanderer)]));
    this.gameObjects.push(wanderer);
    this.physics.add.collider(wanderer, this.groundLayer);
    this.physics.add.collider(wanderer, this.stuffLayer);
  },
  update: function() {
    if (this.gameObjects) {
      this.gameObjects.forEach(function(element) {
        element.update();
      });
    }

    if (this.hasPlayerReachedStairs) return;

    this.player.update();
  },
});

export default CellularAutomataScene;
