import Phaser from 'phaser'


import StartingScene from '../scenes/starting-scene';
import SteeringWanderScene from '../scenes/steering-wander-scene';
import SteeringEvadeScene from '../scenes/steering-evade-scene';
import SteeringEvadeVsPursuitScene from '../scenes/steering-evade-vs-pursuit';
import MenuScene from  '../scenes/scenes-menu'
import GroupAlignmentScene from '../scenes/group-alignment-scene';
import SteeringSeekScene from '../scenes/steering-seek-scene';
import SteeringFleeScene from '../scenes/steering-flee-scene';
import ProceduralScene from '../scenes/procedural-scene';
import SteeringPathFollowingScene from '../scenes/steering-path-following-scene';

//https://github.com/mikewesthad/phaser-3-tilemap-blog-posts/blob/master/examples/post-1/05-physics/index.js

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  pixelArt: true,
  zoom: 1.2,


  scene: [MenuScene, SteeringWanderScene,
    GroupAlignmentScene, StartingScene,
    SteeringEvadeScene, SteeringEvadeVsPursuitScene,
    SteeringSeekScene, SteeringFleeScene,
    ProceduralScene, SteeringPathFollowingScene],


  //StartingScene,


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
