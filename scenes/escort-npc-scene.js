import CharacterFactory from "../src/characters/character_factory";
import EscortNpcLevelBuilder from "../src/utils/escort-npc-level-builder";
import tilemapPng from '../assets/tileset/sahara.png'
import SteeringDriven from "../src/ai/behaviour/steering_driven";
import OffsetPursuit from "../src/ai/steerings/offset_pursuit";
import Vector2 from "phaser/src/math/Vector2";
import UserControlled from "../src/ai/behaviour/user_controlled";
import gunPng from '../assets/sprites/gun.png'
import bulletPng from '../assets/sprites/bullet.png'
import cursorCur from '../assets/sprites/cursor.cur'
import EffectsFactory from "../src/utils/effects_factory";
import EasyStar from "easystarjs";
import Pursuit from "../src/ai/steerings/pursuit";
import a from '../assets/fonts/carrier_command.png'
import b from '../assets/fonts/carrier_command.xml'

const TILES = {
    BLANK: -1,
    FLOOR: [
        {index: [18, 17], weight: 3}, //, 52, 51
        {index: 53, weight: 6},
        {index: 19, weight: 2},
    ],
    WALL: [
        {index: [140, 138], weight: 3},
        {index: [37, 21], weight: 4},
        {index: [38], weight: 5},
        {index: [ 1, 121, 120, 89], weight: 1}
    ],
    TARGET: 137
};

let EscortNpcScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function GroupCohesionScene() {
        Phaser.Scene.call(this, {key: 'EscortNpcScene'});
    },

    preload: function () {
        //loading map tiles an d json with positions
        this.load.image("mytilemap", tilemapPng);
        this.characterFactory = new CharacterFactory(this);
        this.effectsFactory = new EffectsFactory(this);

        this.load.image("gun", gunPng);
        this.load.image("bullet", bulletPng);
        this.load.bitmapFont('carrier_command', a,
            b);
    },

    create: function () {
        this.input.setDefaultCursor(`url(${cursorCur}), pointer`);
        this.effectsFactory.loadAnimations();
        this.characterFactory.loadAnimations();

        const w = 40;
        const h = 30;

        this.worldBuilder = new EscortNpcLevelBuilder(w, h, 5, w * h * 2.5, 10);

        this.setupMap(w, h);
        this.generateWorld(w, h);
        this.setupFinder(w, h);

        this.gameObjects = [];

        const playersStartPos = this.worldBuilder.getPlayersStartPosition();

        this.generatePlayer(playersStartPos.player);
        this.generateFollower(playersStartPos.follower);
        this.populateWorldWithSlime(10);

        this.initBullets();

        this.generateTarget();
        // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player);
    },

    update: function () {
        if (this.gameObjects) {
            this.gameObjects.forEach(function (element) {
                element.update();
            });
        }
        this.player.update();
        this.follower.update();
    },

    setupFinder(w, h){
        this.tileSize = 32;
        this.finder = new EasyStar.js();
        let grid = [];
        for(let y = 0; y < h; y++){
            let col = [];
            for(let x = 0; x < w; x++) {
                const tile = this.groundLayer.tilemap.getTileAt(x, y);
                col.push(tile ? tile.index : 0);
            }
            grid.push(col);
        }

        this.finder.setGrid(grid);
        this.finder.setAcceptableTiles([18, 53, 19, 52, 51, 17]);
    },

    setupMap: function (w, h) {
        this.map = this.make.tilemap({
            tileWidth: 32,
            tileHeight: 32,
            width: w,
            height: h
        });

        this.physics.world.bounds.width = this.map.widthInPixels;
        this.physics.world.bounds.height = this.map.heightInPixels;
    },

    generateFollower: function (followerPosition) {
        const x = this.map.tileToWorldX(followerPosition.x);
        const y = this.map.tileToWorldY(followerPosition.y);
        this.follower = this.characterFactory.buildCharacter('aurora', x, y, {player: false});
        this.physics.add.collider(this.player, this.groundLayer);
        this.follower.addBehaviour(new SteeringDriven([new OffsetPursuit(this.follower,
            this.player, 1.3, new Vector2(30, 15), this.gameObjects)]));
        this.followerHealth = 100;
    },

    generatePlayer: function (playerPosition) {
        let x = this.map.tileToWorldX(playerPosition.x);
        let y = this.map.tileToWorldY(playerPosition.y);

        this.player = new PlayerWithGun(this, x, y, 'blue', 'gun');
        this.player.animationSets = this.characterFactory.animationLibrary.get('blue');

        const wasdCursorKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.player.addBehaviour(new UserControlled(150, wasdCursorKeys));
        this.physics.add.collider(this.player, this.groundLayer);
        this.playerHealth = 100;
    },

    generateTarget: function(){
        const targetPosition = this.worldBuilder.getTargetPosition();
        this.groundLayer.putTileAt(TILES.TARGET, targetPosition.x, targetPosition.y);
        this.effectsFactory.buildEffect('magicSpell', this.map.tileToWorldX(targetPosition.x) + 16,
            this.map.tileToWorldY(targetPosition.y));

        this.groundLayer.setTileIndexCallback(TILES.TARGET, obj => {
            if(obj === this.player){
                this.groundLayer.setTileIndexCallback(TILES.TARGET, null);
                if(this.followerHealth > 0) this.onWin();
                else this.onLoose();
            }
        })
    },

    deactivateObjects: function(){
        this.player.body.moves = false;
        this.follower.body.moves = false;
        this.gameObjects.forEach(o => o.body.moves = false);
    },
    onLoose: function(){
        this.deactivateObjects();
        this.add.bitmapText(this.map.widthInPixels / 4, this.map.heightInPixels / 4, "carrier_command",
            "Better luck next time!", 42);
    },
    onWin: function(){
        this.deactivateObjects();
        this.add.bitmapText(this.map.widthInPixels / 4, this.map.heightInPixels / 4, "carrier_command",
            "Great Work!", 42);
    },
    populateWorldWithSlime(slimeCnt){
        this.slimes = this.physics.add.group();
        let params = {};
        for(let i = 0; i < slimeCnt; ++i){
            const slimePos = this.worldBuilder.getEnemyPosition();
            const x = this.map.tileToWorldX(slimePos.x);
            const y = this.map.tileToWorldY(slimePos.y);
            params.slimeType = Phaser.Math.RND.between(0, 4);

            const slime = this.characterFactory.buildSlime(x, y, params);

            this.slimes.add(slime);
            this.physics.add.collider(slime, this.groundLayer);
            this.gameObjects.push(slime);
        }

        this.physics.add.collider(this.player, this.slimes, (p, s) =>{
            if (this.playerHealth > 0) {
                this.playerHealth -= 0.15;
            } else {
                this.onLoose();
            }
        });
        this.physics.add.collider(this.follower, this.slimes,  () =>{
            if (this.followerHealth > 0) {
                this.followerHealth -= 1;
                console.log(this.followerHealth);
            }else {
                this.follower.body.moves = false;
                this.follower.body.destroy();
            }
        });
    },

    initBullets: function () {
        this.bullets = new Bullets(this);
        this.physics.add.collider(this.bullets, this.groundLayer, (bullet) => {
            bullet.setVisible(false);
            bullet.setActive(false);
        });

        this.input.on('pointerdown', (pointer) => {
            const {x, y} = this.player.bulletStartingPoint;

            const vx = pointer.x - x;
            const vy = pointer.y - y;

            const BULLET_SPEED = 400;
            const mult = BULLET_SPEED / Math.sqrt(vx * vx + vy * vy);

            this.bullets.fireBullet(x, y, vx * mult, vy * mult);
        });

        this.physics.add.collider(this.bullets, this.slimes, (bullet, slime) => {
            if (bullet.active) { /* very important */
                slime.damage();
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        });
    },

    generateWorld: function (w, h) {
        const tileset = this.map.addTilesetImage("mytilemap", null, 32, 32);
        this.groundLayer = this.map.createBlankDynamicLayer("Ground", tileset).fill(TILES.BLANK);
        const worldGrid = this.worldBuilder.build();

        for (let x = 0; x < w; x++)
            for (let y = 0; y < h; y++) {
                this.groundLayer.weightedRandomize(x, y, 32, 32, TILES.FLOOR);
                if (worldGrid[x][y] === 1) {
                    this.groundLayer.weightedRandomize(x, y, 32, 32, TILES.WALL);
                }
            }

        for (let x = 0; x < w; x++) {
            const tile = x % 2 === 0 ? 8 : 9;
            this.groundLayer.putTileAt(tile, x, 0);
            this.groundLayer.putTileAt(tile, x, h - 1);
        }

        for (let y = 0; y < h; y++) {
            const tile = y % 2 === 0 ? 25 : 26;
            this.groundLayer.putTileAt(tile, 0, y);
            this.groundLayer.putTileAt(tile, w - 1, y);
        }
        this.groundLayer.setCollisionByExclusion([18, 53, 19, 17, 52, 51]);
    }
});

class PlayerWithGun extends Phaser.GameObjects.Container {
    constructor(scene, x, y, characterSpriteName, gunSpriteName) {
        super(scene, x, y);
        this.setSize(31, 31);
        scene.physics.world.enable(this);
        this.body.setCollideWorldBounds(true);
        scene.add.existing(this);

        this.character = scene.characterFactory.buildCharacter('aurora', 0, 0, {player: true});
        this.gun = new Phaser.GameObjects.Sprite(scene, 2, 8, gunSpriteName);

        this.add(this.character);
        this.add(this.gun);

        this.setViewDirectionAngle(0);

        this.behaviuors = [];
        this.steerings = [];
        this.hp = 100;
        this.radius = 100;
        this.groupId = 0;

        scene.input.on('pointermove', pointer => this._onPointerMove(pointer));
    }

    _onPointerMove(pointer) {
        this.setViewDirectionAngle(
            Phaser.Math.Angle.Between(
                this.x + this.gun.x,
                this.y + this.gun.y,
                pointer.x,
                pointer.y
            )
        )
    }

    addBehaviour(behaviour) {
        behaviour.character = this;
        this.behaviuors.push(behaviour);
    }

    update() {
        this.behaviuors.forEach(x => x.update());
        this.updateAnimation();
    };

    get bulletStartingPoint() {
        const angle = this.viewDirectionAngle;
        const approxGunWidth = this.gun.width - 2;
        const x = this.gun.x + (approxGunWidth * Math.cos(angle));
        const y = this.gun.y + (approxGunWidth * Math.sin(angle));
        return new Vector2(this.x + x, this.y + y)
    }

    setViewDirectionAngle(newAngle) {
        this.viewDirectionAngle = newAngle;

        if (newAngle > 1.56 || newAngle < -1.56) {
            this.gun.setFlip(false, true);
            this.gun.setOrigin(0.4, 0.6);
            this.gun.x = -6
        } else {
            this.gun.setFlip(false, false);
            this.gun.setOrigin(0.4, 0.4);
            this.gun.x = 6
        }
        this.gun.setRotation(newAngle)
    }

    updateAnimation() {
        try {
            const animations = this.animationSets.get('WalkWithGun');
            const animsController = this.character.anims;
            const angle = this.viewDirectionAngle;

            if (angle < 0.78 && angle > -0.78) {
                this.gun.y = 8;
                this.bringToTop(this.gun);
                animsController.play(animations[1], true);
            } else if (angle < 2.35 && angle > 0.78) {
                this.gun.y = 8;
                this.bringToTop(this.gun);
                animsController.play(animations[3], true);
            } else if (angle < -2.35 || angle > 2.35) {
                this.gun.y = 8;
                this.bringToTop(this.gun);
                animsController.play(animations[0], true);
            } else if (angle > -2.35 && angle < -0.78) {
                this.gun.y = -4;
                this.bringToTop(this.character);
                animsController.play(animations[2], true);
            } else {
                const currentAnimation = animsController.currentAnim;
                if (currentAnimation) {
                    const frame = currentAnimation.getLastFrame();
                    this.character.setTexture(frame.textureKey, frame.textureFrame);
                }
            }
        } catch (e) {
            console.error('[PlayerWithGun] updateAnimation failed')
        }
    }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
    }

    fire(x, y, vx, vy) {
        this.body.reset(x, y);
        this.body.mass = 3;

        this.setActive(true);
        this.setVisible(true);

        this.setVelocityX(vx);
        this.setVelocityY(vy);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }
}

class Bullets extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: 20,
            key: 'bullet',
            active: false,
            visible: false,
            classType: Bullet
        });
    }

    fireBullet(x, y, vx, vy) {
        let bullet = this.getFirstDead(false);

        if (bullet) {
            bullet.fire(x, y, vx, vy);
        }
    }
}

class Chest extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'chest');
    }
}

export default EscortNpcScene;