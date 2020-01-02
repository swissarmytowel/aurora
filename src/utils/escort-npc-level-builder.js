import Vector2 from 'phaser/src/math/Vector2'

export default class EscortNpcLevelBuilder {
    constructor(width, height, nDrunkards, depth, safeRadius) {
        this.width = width - 1;
        this.height = height - 1;
        this.__tileTypes = {
            FLOOR: 0,
            WALL: 1
        };
        this.actualWidth = width;
        this.actualHeight = height;
        this.__baseLayer = new Array(this.actualWidth).fill(this.__tileTypes.WALL)
            .map(() => new Array(this.actualHeight).fill(this.__tileTypes.WALL));
        this.nDrunkards = nDrunkards;
        this.depth = depth;
        this.playerPosition = null;
        this.enemies = [];
        this.safeRadius = safeRadius;
    }

    sendDrunkard(current) {
        const dir = this.chooseDirection();
        current = current.add(dir);
        current.x = (current.x + this.width) % this.width;
        current.y = (current.y + this.height) % this.height;
        return current;
    }

    build() {
        let depth = this.depth;
        const currents = new Array(this.nDrunkards).fill(new Vector2(0, 0));
        while (depth > 0) {
            for (let i = 0; i < this.nDrunkards; ++i) {
                let current = currents[i];
                current = this.sendDrunkard(current);
                this.__baseLayer[current.x][current.y] = this.__tileTypes.FLOOR;
                depth--;
            }
        }
        this.postprocess();
        return this.__baseLayer;
    }

    postprocess() {
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
                this.__baseLayer[i][j] = 0;
            }
        }
    }

    chooseDirection() {
        const flag = Math.random();
        if (flag < 0.2) {
            return new Vector2(-1, 0);
        } else if (flag < 0.35) {
            return new Vector2(0, -1);
        } else if (flag < 0.69) {
            return new Vector2(0, 1);
        }
        return new Vector2(1, 0);
    }

    getRandomInStrip(limit) {
        const leftBorder = limit / 4;
        const rightBorder = limit / 2 + limit / 4;
        return Math.floor(Math.random() * (rightBorder - leftBorder) + leftBorder);
    };

    getRandomInt(limit) {
        return Math.floor(Math.random() * (limit - 2) + 2);
    }

    getRandomVectorInBounds(w, h) {
        return new Vector2(this.getRandomInt(w), this.getRandomInt(h));
    }

    getRandomVectorInStrip(w, h) {
        return new Vector2(this.getRandomInStrip(w), this.getRandomInStrip(h));
    }

    getPlayersStartPosition() {
        let position = this.getRandomVectorInStrip(this.actualWidth, this.actualHeight);
        while (this.__baseLayer[position.x][position.y] !== this.__tileTypes.FLOOR
        && this.__baseLayer[position.x - 2][position.y - 2] !== this.__tileTypes.FLOOR) {
            position = this.getRandomVectorInStrip(this.actualWidth, this.actualHeight);
        }
        this.playerPosition = new Vector2(position.x, position.y);
        this.followerPosition = new Vector2(position.x - 1, position.y - 1);

        return {player: position.clone(), follower: this.followerPosition.clone()};
    }

    getEnemyPosition() {
        const w = (this.actualWidth);
        const h = (this.actualHeight);

        let position = this.getRandomVectorInBounds(w, h);
        if (this.playerPosition === null) return position;
        while (this.__baseLayer[position.x][position.y] !== this.__tileTypes.FLOOR
        && position.distance(this.playerPosition) <= this.safeRadius
        && position.distance(this.followerPosition) <= this.safeRadius) {
            position = this.getRandomVectorInBounds(w, h);
        }
        return position;
    }

    getTargetPosition() {
        const w = (this.actualWidth);
        const h = (this.actualHeight);
        const minDist = Math.sqrt(w ** 2 + h ** 2);

        let position = this.getRandomVectorInBounds(w, h);
        while (this.__baseLayer[position.x][position.y] !== this.__tileTypes.FLOOR
        && position.distance(this.playerPosition) <= minDist
        && position.distance(this.followerPosition) <= minDist) {
            position = this.getRandomVectorInBounds(w, h);
        }
        return position;
    }

    get base() {
        return this.__baseLayer
    }
}