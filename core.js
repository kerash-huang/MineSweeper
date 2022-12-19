"use strict";

const MineSweeper = function () {
    var STATUS_START = false;
    var MAP_WIDTH, MAP_HEIGHT, BOMB_COUNT, TIME_SEC;
    var TIMER = null;
    var MINE_MAP = [];
    var eleMAP, eleBOMBCOUNT, eleTIMER;
    var colorSet = {
        1: "6D3F5B",
        2: "78858B",
        3: "FF2301",
        4: "606E8C",
        5: "755C48",
        6: "287233",
        7: "FF7514",
        8: "7FB5B5",
    };

    class mGrid {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.gridLocation = y * MAP_WIDTH + x + 1;
            this.hasMine = false;
            this.neighborMineCount = 0;
            this.isFlagged = false;
            this.isReveal = false;
        }
        setFlag() {
            this.isFlagged = true;
        }
        setHasMine() {
            this.hasMine = true;
        }
        setNeighborMineCount(count) {
            this.neighborMineCount = count;
        }
    }

    function setBombCountText(count, gridCount) {
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
        countChars.forEach((num, index) => {
            eleBOMBCOUNT.children.item(index).innerHTML = num;
        });
    }

    function setTimerText(second) {
        if (second.toString().length < 3) {
            second = "0".repeat(3 - second.toString().length).concat(second);
        }
        var countChars = second.toString().split("");
        countChars.forEach((num, index) => {
            eleTIMER.children.item(index).innerHTML = num;
        });
    }

    function init(width, height, bombs, mapElement, bombCountElement, timerElement) {
        MAP_WIDTH = width;
        MAP_HEIGHT = height;
        BOMB_COUNT = bombs;
        eleMAP = mapElement;
        eleBOMBCOUNT = bombCountElement;
        eleTIMER = timerElement;
    }

    function _initMapArray() {
        MINE_MAP = [];
        for (var aY = 0; aY < MAP_HEIGHT; aY++) {
            MINE_MAP[aY] = [];
            for (var aX = 0; aX < MAP_WIDTH; aX++) {
                MINE_MAP[aY][aX] = new mGrid(aX, aY);
            }
        }

        var mine_location_list = crypto.getRandomValues(
            new Uint16Array(MAP_WIDTH * MAP_HEIGHT)
        );
        var sorting_mine_location = Array.from(mine_location_list).sort((a, b) => {
            return b - a;
        });
        var real_mine_number_set = sorting_mine_location.slice(0, BOMB_COUNT);

        var real_mine_location = [];
        for (var i = 0; i < mine_location_list.length; i++) {
            if (
                real_mine_number_set.some((y) => {
                    return y === mine_location_list[i];
                })
            ) {
                real_mine_location.push(i + 1);
            }
        }

        for (var aY = 0; aY < MINE_MAP.length; aY++) {
            for (var aX = 0; aX < MINE_MAP[aY].length; aX++) {
                if (
                    real_mine_location.some((value) => {
                        return value === MINE_MAP[aY][aX].gridLocation;
                    })
                ) {
                    MINE_MAP[aY][aX].setHasMine();
                }
            }
        }

        MINE_MAP.forEach((valY, indexY) => {
            valY.forEach((gridObject, indexX) => {
                if (gridObject.hasMine) {
                    return;
                }
                var tmpMineCount = 0;
                for (var lY = -1; lY <= 1; lY++) {
                    for (var lX = -1; lX <= 1; lX++) {
                        if (
                            indexX + lX >= MAP_WIDTH ||
                            indexX + lX < 0 ||
                            indexY + lY >= MAP_HEIGHT ||
                            indexY + lY < 0
                        ) {
                            continue;
                        }
                        if (MINE_MAP[indexY + lY][indexX + lX].hasMine) {
                            tmpMineCount++;
                        }
                    }
                }
                gridObject.setNeighborMineCount(tmpMineCount);
            });
        });
    }

    function startGame() {
        STATUS_START = false;
        _clearMap();
        setBombCountText(bombs, MAP_WIDTH * MAP_HEIGHT);
        setTimerText(0);
        _initMapArray();
        _displayMap();
        // _startTimer();
    }

    function _clearMap() {
        eleMAP.innerHTML = '';
    }

    function mineData(ev) {
        var area = this.dataset.gridPosition.split(',');
        var gridData = MINE_MAP[area[1]][area[0]];
        if(gridData.isFlagged || gridData.isReveal) {
            return false;
        }
        if(gridData.neighborMineCount > 0) {
            gridData.isReveal = true;
            var gridElement = document.getElementsByClassName('grid').item(gridData.gridLocation-1);
            gridElement.classList.remove('cover');
            gridElement.classList.add('uncover');
            gridElement.innerHTML = gridData.neighborMineCount;
            gridElement.style.color = "#" + colorSet[gridData.neighborMineCount];
        }
    }

    function _displayMap() {
        MINE_MAP.forEach((valY, indexY) => {
            valY.forEach((gridObject, indexX) => {
                var newGrid = document.createElement("span");
                newGrid.dataset.gridPosition = indexX + "," + indexY;
                newGrid.classList.add("grid")
                // if (gridObject.hasMine) {
                //     newGrid.classList.add('uncover');
                //     newGrid.classList.add('bomb');
                // } else if (gridObject.neighborMineCount > 0) {
                //     newGrid.innerHTML = gridObject.neighborMineCount;
                //     newGrid.classList.add('uncover');
                //     newGrid.classList.remove('cover');
                //     newGrid.style.color = "#" + colorSet[gridObject.neighborMineCount];
                // } else {
                //     newGrid.classList.add('cover');
                // }
                newGrid.classList.add('cover');
                newGrid.addEventListener('click', mineData);
                eleMAP.append(newGrid);
            });
        });
    }

    function _startTimer() {
        TIME_SEC = 0;
        TIMER = setInterval(function () {
            _setTimerText(TIME_SEC++);
            if (TIME_SEC >= 999) {
                _game_over();
            }
        }, 1000);
    }

    function _game_over() {
        // show fail
        _stopTimer();
    }

    function _stopTimer() {
        clearInterval(TIMER);
    }

    return {
        init: init,
        start: startGame,
        mine: mineData,
    };
};

//
var GameWindow = document.getElementById("GameWindow");
var digMapElement = document.getElementById("DigMap");
var timeCounterElement = document.getElementById("gameTimerSeg");
var bombCounterElement = document.getElementById("bombCountSeg");
//
var width = 9;
var height = 9;
var bombs = 20;
// GameWindow.style.width = (width * 18).toString() + "px";
var ms = new MineSweeper();
ms.init(
    width,
    height,
    bombs,
    digMapElement,
    bombCounterElement, timeCounterElement,
);
var BtnReset = document.getElementById('btnReset').getElementsByTagName("button")[0];
BtnReset.addEventListener('click', NewGame);
BtnReset.addEventListener('mouseup', NewGame);
BtnReset.addEventListener('mouseout', NewGame);
BtnReset.addEventListener('mousedown', function (e) {
    BtnReset.classList.add("touched");
});
function NewGame() {
    setTimeout(function () {
        if (BtnReset.classList.contains('touched')) {
            ms.start();
            BtnReset.classList.remove('touched');
        }
    }, 100);

}
ms.start();
