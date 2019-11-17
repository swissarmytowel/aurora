let MenuScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function MenuScene() {
            Phaser.Scene.call(this, {key: 'MenuScene'});
        },
    preload: function () {

        //loading map tiles and json with positions

    },
    create: function () {

        const scenes = ['StartingScene', 'GroupAlignmentScene', 'SteeringWanderScene', 'SteeringEvadeScene', 'SteeringEvadeVsPursuitScene', 'SteeringSeekScene', 'SteeringFleeScene'];

        let k = 0;
        scenes.forEach(x => this.add.text(this.physics.world.centerX, 200 + (k++ * 30), x, {fill: '#0f0'})
            .setInteractive()
            .on('pointerdown', () => this.actionOnClick(x)));

    },
    update: function () {


    },
    actionOnClick: function (sceneName) {

        this.scene.start(sceneName);

    },
});

export default MenuScene