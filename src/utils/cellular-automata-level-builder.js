import Vector2 from 'phaser/src/math/Vector2';

const TILE_MAPPING = {
  WALL: 0,
  FLOOR: 1
};

export default class CellularAutomataLevel {
  constructor(
    width,
    height,
    fillprob = 0.45,
    r1Cutoff = 5,
    r2Cutoff = 1,
    epoch = 5,
    safeArea = 20,
  ) {
    (this.width = width),
      (this.height = height),
      (this.fillprob = fillprob),
      (this.r1Cutoff = r1Cutoff),
      (this.epoch = epoch),
      (this.r2Cutoff = r2Cutoff),
      (this.safeArea = safeArea);

    this.init();
  }

  randPick() {
    if (Math.random() < this.fillprob) return TILE_MAPPING.WALL;
    else return TILE_MAPPING.FLOOR;
  }

  init() {
    let levelMatrix = Array(this.width)
      .fill()
      .map(() => Array(this.height).fill());

    let levelMatrix2 = Array(this.width)
      .fill()
      .map(() => Array(this.height).fill(TILE_MAPPING.WALL));

    for (let yi = 1; yi < this.height - 1; yi++)
      for (let xi = 1; xi < this.width - 1; xi++)
        levelMatrix[xi][yi] = this.randPick();

    //border
    for (let yi = 0; yi < this.height; yi++)
      levelMatrix[0][yi] = levelMatrix[this.width - 1][yi] = TILE_MAPPING.WALL;
    for (let xi = 0; xi < this.width; xi++)
      levelMatrix[xi][0] = levelMatrix[xi][this.height - 1] = TILE_MAPPING.WALL;

    this.levelMatrix2 = levelMatrix2;
    this.levelMatrix = levelMatrix;
  }

  generation() {
    for (let yi = 1; yi < this.height - 1; yi++)
      for (let xi = 1; xi < this.width - 1; xi++) {
        let adjcount_r1 = 0,
          adjcount_r2 = 0;

        for (let ii = -1; ii <= 1; ii++)
          for (let jj = -1; jj <= 1; jj++) {
            if (this.levelMatrix[xi + jj][yi + ii] != TILE_MAPPING.FLOOR)
              adjcount_r1++;
          }
        for (let ii = yi - 2; ii <= yi + 2; ii++)
          for (let jj = xi - 2; jj <= xi + 2; jj++) {
            if (Math.abs(ii - yi) == 2 && Math.abs(jj - xi) == 2) continue;
            if (ii < 0 || jj < 0 || ii >= this.height || jj >= this.width)
              continue;
            if (this.levelMatrix[jj][ii] != TILE_MAPPING.FLOOR) adjcount_r2++;
          }
        if (adjcount_r1 >= this.r1Cutoff || adjcount_r2 <= this.r2Cutoff)
          this.levelMatrix2[xi][yi] = TILE_MAPPING.WALL;
        else this.levelMatrix2[xi][yi] = TILE_MAPPING.FLOOR;
      }
    for (let yi = 1; yi < this.height - 1; yi++)
      for (let xi = 1; xi < this.width - 1; xi++)
        this.levelMatrix[xi][yi] = this.levelMatrix2[xi][yi];
  }

  buildLevel() {
    for (let i = 0; i < this.epoch; i++) this.generation();
    this.color = 2;
    for (let x = 0; x < this.width; x++)
      for (let y = 0; y < this.height; y++) {
        if (this.floodFill(x, y, this.color)) {
          this.color++;
        }
      }
    this.deleteExtraFields();
  }

  drawToConsole() {
    console.log(this.levelMatrix);
  }

  //use queue instead of recursive
  floodFill(x, y, color) {
    if (
      this.levelMatrix[x][y] === TILE_MAPPING.WALL ||
      this.levelMatrix[x][y] !== TILE_MAPPING.FLOOR ||
      x < 0 ||
      x >= this.width ||
      y < 0 ||
      y >= this.height
    )
      return false;

    this.levelMatrix[x][y] = color;

    this.floodFill(x + 1, y, color); // then i can either go south
    this.floodFill(x - 1, y, color); // or north
    this.floodFill(x, y + 1, color); // or east
    this.floodFill(x, y - 1, color); // or west

    return true;
  }

  deleteExtraFields() {
    let count = new Array(this.color).fill(0);
    for (let x = 0; x < this.width; x++)
      for (let y = 0; y < this.height; y++) {
        count[this.levelMatrix[x][y]]++;
      }

    const max = Math.max(...count.slice(2));
    const newFloor = count.findIndex(index => index === max);

    for (let x = 0; x < this.width; x++)
      for (let y = 0; y < this.height; y++) {
        if (this.levelMatrix[x][y] !== TILE_MAPPING.WALL)
          if (this.levelMatrix[x][y] === newFloor)
            this.levelMatrix[x][y] = TILE_MAPPING.FLOOR;
          else this.levelMatrix[x][y] = TILE_MAPPING.WALL;
      }
  }

  getStartPosition() {
    for (let x = this.getRandomInt(this.width / 2); x < this.width; x++)
      for (let y = this.getRandomInt(this.height / 2); y < this.height; y++) {
        if (this.levelMatrix[x][y] !== TILE_MAPPING.WALL) return { x: x, y: y };
      }

    //if we can't try again
    return this.getStartPosition();
  }

  getWarmHouse() {
    for (let x = this.getRandomInt(this.width); x >= 0; x--)
      for (let y = this.getRandomInt(this.height); y >= 0; y--) {
        if (this.levelMatrix[x][y] !== TILE_MAPPING.WALL) return { x: x, y: y };
      }

    //if we can't try again
    return this.getWarmHouse();
  }

  getNpc(playerPoint) {
    for (let x = this.getRandomInt(this.width); x < this.width; x++)
      for (let y = this.getRandomInt(this.height); y < this.height; y++) {
        if (
          this.levelMatrix[x][y] !== TILE_MAPPING.WALL &&
          new Vector2(x, y).distance(new Vector2(playerPoint.x, playerPoint.y)) > this.safeArea
        )
          return { x: x, y: y };
      }

    //if we can't try again
    return this.getNpc(playerPoint);
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
}
