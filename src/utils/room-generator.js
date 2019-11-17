export default class RoomGenerator {

    initMap(scene)
    {
        const map = scene.make.tilemap({
            tileWidth: 32,
            tileHeight: 32,
            width: this.randomNumber(20),
            height: this.randomNumber(20)
        });
        return map;
    }

    randomNumber(minimum, maximum)
    {
       return (Math.random() * (maximum - minimum + 1) ) << 0;
    }
}