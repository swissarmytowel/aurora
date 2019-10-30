import Phaser from 'phaser'

import StartingScene from '../scenes/starting-scene';
import CharacterMixin from '../src/characters/character.js';

//https://github.com/mikewesthad/phaser-3-tilemap-blog-posts/blob/master/examples/post-1/05-physics/index.js
Object.assign(Phaser.Physics.Arcade.Sprite.prototype, CharacterMixin);

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  pixelArt: true,
  zoom: 1.2,
  scene: StartingScene,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0,
        debug: true // set to true to view zones
        }
    }
  },
};

const game = new Phaser.Game(config);
