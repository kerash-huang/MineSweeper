"use strict";

const MineSweeper = function () {
  var MAP_WIDTH, MAP_HEIGHT, BOMB_COUNT, TIME_SEC;
  var TIMER = null;

  function setBombCount(count, gridCount) {
    if (count >= gridCount) {
      throw "bomb count over limit.";
    }

    if (count > 999 || count < 1) {
      return false;
    }

    if (count.toString().length < 3) {
      count = "0".repeat(3 - count.toString().length).concat(count);
    }
    var countChars = count.toString().split("");
    var bcseg = document.getElementById("bombCountSeg");
    countChars.forEach((num, index) => {
      bcseg.children.item(index).innerHTML = num;
    });
  }

  function _setTimerSeg(second) {
    if (second.toString().length < 3) {
      second = "0".repeat(3 - second.toString().length).concat(second);
    }
    var countChars = second.toString().split("");
    var bcseg = document.getElementById("gameTimerSeg");
    countChars.forEach((num, index) => {
      bcseg.children.item(index).innerHTML = num;
    });
  }

  function mGrid(x, y) {
    this.x = x;
    this.y = y;
    this.gridLocation = y * MAP_WIDTH + x + 1;
    this.hasMine = false;
    this.neighborMineCount = 0;
    this.isFlagged = false;
    this.isReveal = false;
  }
  mGrid.prototype.setFlag = function () {
    this.isFlagged = true;
  };
  mGrid.prototype.setHasMine = function () {
    this.hasMine = true;
  };
  mGrid.prototype.setNeighborMineCount = function (count) {
    this.neighborMineCount = count;
  };

  function init(width, height, bombs) {
    MAP_WIDTH = width;
    MAP_HEIGHT = height;
    BOMB_COUNT = bombs;
  }

  function startGame() {
    startTimer();
  }

  function startTimer() {
    TIME_SEC = 0;
    TIMER = setInterval(function () {
      _setTimerSeg(TIME_SEC++);
      if (TIME_SEC >= 999) {
        game_over();
      }
    }, 1000);
  }

  function game_over() {
    // show fail
    _stopTimer();
  }

  function _stopTimer() {
    clearInterval(TIMER);
  }

  return {
    init: init,
    start: startGame,
  };
};

//
var width = 9;
var height = 9;
var bombs = 10;
var ms = new MineSweeper();
ms.init(width, height, bombs);
ms.start();
