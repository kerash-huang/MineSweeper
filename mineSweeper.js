class Square {
  isSettle;
  isBomb;
  isFlagged;
  isOpened;
  number;

  constructor() {
    this.isSettle = false;
    this.isBomb = false;
    this.isFlagged = false;
    this.isOpened = false;
    this.number = 0;
  }

  _setBomb() {
    this.isSettle = true;
    this.isBomb = true;
  }

  _setNumber(num) {
    this.number = num;
    this.isSettle = true;
  }

  mining() {
    switch (true) {
      case this.isOpened:
      case this.isFlagged:
        return "NONE";
      case this.isBomb:
        return "GAME_OVER";
      default:
        return this.number;
    }
  }

  _setFlag() {
    if (this.isFlagged) {
      this.isFlagged;
    }
  }
}

class MineMap {
  constructor(w, h) {
    this.mapWidth = w;
    this.mapHeight = h;
    this.bombMap = new Array(h);
    for (var i = 0; i < this.bombMap.length; i++) {
      this.bombMap[i] = new Array();
      for (var m = 0; m < h; m++) this.bombMap[i].push(new Square());
    }
  }

  init(bombCount) {
    if (Math.round((bombCount / (this.mapWidth * this.mapHeight)) * 100) > 95) {
      throw "ERROR_BOMB_COUNT";
    }
    this.#SetBombs(bombCount);
    this.#SetSquare();
  }

  MineSq(x, y) {
    var theSq = this.#GetSq(x, y);
    mine_result = theSq.mining();
  }

  GetMap() {
    return this.bombMap;
  }

  #GetSq(x, y) {
    return this.bombMap[y][x];
  }

  #SetSquare() {
    for (var posY = 0; posY < this.mapHeight; posY++) {
      for (var posX = 0; posX < this.mapWidth; posX++) {
        if (this.bombMap[posY][posX].isSettle === false) {
          var bombCount = this.#GetNeighborBombCount(posX, posY);
          this.bombMap[posY][posX]._setNumber(bombCount);
        }
      }
    }
  }

  #GetNeighborBombCount(x, y) {
    var bombCount = 0;
    for (var xa = -1; xa <= 1; xa++) {
      for (var ya = -1; ya <= 1; ya++) {
        if (xa == 0 && ya == 0) {
          continue;
        }
        if (
          x + xa < 0 ||
          x + xa >= this.mapWidth ||
          y + ya < 0 ||
          y + ya >= this.mapHeight
        ) {
          continue;
        }
        if (this.bombMap[y + ya][x + xa].isBomb) {
          bombCount++;
        }
      }
    }
    return bombCount;
  }

  #SetBombs(bombCount) {
    for (var posY = 0; posY < this.mapHeight; posY++) {
      for (var posX = 0; posX < this.mapWidth; posX++) {
        var isMineCheck =
          Math.round(Math.random() * 1000) % ((posX + 1) * (posY + 1));
        if (
          isMineCheck % 2 == 0 &&
          !this.bombMap[posY][posX].isSettle &&
          !this.bombMap[posY][posX].isBomb
        ) {
          this.bombMap[posY][posX]._setBomb();
          bombCount--;
        }
      }
    }
    if (bombCount > 0) {
      this.#SetBombs(bombCount);
    }
    return true;
  }
}

class MineSweeper {
  isFinish = false
  isInit = false
  constructor(mapWidth = 9, mapHeight = 9, bombCount = 9) {
    this.current_bomb_count = bombCount;
    this.GameBoard = new MineMap(mapWidth, mapHeight);
    this.GameBoard.init(bombCount);
  }

  minning(x, y) {
    return this.GameBoard.MineSq(x, y);
  }

  getboard() {
    // get currency board view status
    return this.GameBoard.GetMap();
  }

  restart() {
    this.GameBoard.init(this.current_bomb_count);
  }
}
