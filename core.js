"use strict";

const MineSweeper = function () {
    var STATUS_START = false;
    var STATUS_GAME_OVER = false;
    var MAP_WIDTH, MAP_HEIGHT, MAP_BOMB_COUNT, BOMB_COUNT, TIME_SEC;
    var TIMER = null;
    var MINE_MAP = [];
    var eleWindow, eleMAP, eleBOMBCOUNT, eleTIMER, eleSMILEBTN;
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
            this.clickBomb = false;
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
        setClickBomb() {
            this.clickBomb = true;
        }
    }

    function setBombCountText(count) {
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

    function CallANewGame() {
        setTimeout(function () {
            if (eleSMILEBTN.classList.contains('touched')) {
                eleSMILEBTN.classList.remove('touched');
                startGame();
            }
        }, 50);
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

    function _clearMap() {
        eleMAP.innerHTML = '';
    }

    function _displayMap() {
        MINE_MAP.forEach((valY, indexY) => {
            valY.forEach((gridObject, indexX) => {
                var newGrid = document.createElement("span");
                newGrid.dataset.gridPosition = indexX + "," + indexY;
                newGrid.classList.add("grid")
                newGrid.classList.add('cover');
                newGrid.addEventListener('click', mineData);
                newGrid.addEventListener('mousedown', mineData);
                newGrid.addEventListener('mouseup', checkTip);
                newGrid.addEventListener('contextmenu', flagGrid);
                eleMAP.append(newGrid);
            });
        });
    }

    function _startTimer() {
        TIME_SEC = 0;
        TIMER = setInterval(function () {
            setTimerText(TIME_SEC++);
            if (TIME_SEC >= 999) {
                _game_over();
            }
        }, 1000);
    }

    function _game_over() {
        STATUS_GAME_OVER = true;
        STATUS_START = false;
        function displayAllBomb() {
            MINE_MAP.forEach((mapLine, indexY) => {
                mapLine.forEach((item, indexX) => {
                    var show_grid = eleMAP.children.item(indexY * MAP_WIDTH + indexX);
                    show_grid.classList.add('finish')
                    show_grid.style.disabled = true;
                    if (!item.isReveal && !item.isFlagged && item.hasMine) {
                        show_grid.classList.remove('cover');
                        show_grid.classList.add('uncover');
                        if (item.clickBomb) {
                            show_grid.classList.add('triggerBomb')
                        } else {
                            show_grid.classList.add('bomb');
                        }
                    } else if (item.isFlagged && !item.hasMine) {
                        show_grid.classList.remove('cover');
                        show_grid.classList.remove('flagged');
                        show_grid.classList.add('uncover');
                        show_grid.classList.add('bomb');
                        show_grid.classList.add('wrong');
                    }
                });
            })
        }
        displayAllBomb();
        eleSMILEBTN.classList.add('bad')
        _stopTimer();
    }

    function _stopTimer() {
        clearInterval(TIMER);
    }

    function __uncoverd_gridElement(gridData) {
        MINE_MAP[gridData.y][gridData.x].isReveal = true;
        var gridElement = document.getElementsByClassName('grid').item(gridData.gridLocation - 1);
        gridElement.classList.remove('cover');
        gridElement.classList.add('uncover');
        if (gridData.neighborMineCount) {
            gridElement.innerHTML = gridData.neighborMineCount;
            gridElement.style.color = "#" + colorSet[gridData.neighborMineCount];
        } else {
            gridElement.classList.add('empty');
        }
        return true;

    }

    function _uncoverGrid(gridData, spreadEmpty, isTipOpen) {
        if (spreadEmpty) {
            if (gridData.isReveal || gridData.isFlagged) {
                return true;
            }
            __uncoverd_gridElement(gridData);
        } else if (isTipOpen) {
            if (!gridData.isReveal && gridData.hasMine) {
                _game_over();
                return false;
            } else {
                __uncoverd_gridElement(gridData);
            }
        } else {
            if (gridData.neighborMineCount > 0) {
                __uncoverd_gridElement(gridData);
                return true;
            } else if (gridData.hasMine) {
                // 炸
                gridData.setClickBomb();
                _game_over();
                return false;
            } else if (gridData.neighborMineCount == 0) {
                __uncoverd_gridElement(gridData);
                open9Grid(gridData);
            }
        }
        return true;
    }

    function _check_win() {
        var checkOKCount = 0;
        MINE_MAP.forEach((mapLine, indexY) => {
            mapLine.forEach((item, indexX) => {
                if (item.hasMine && (!item.isReveal || item.isFlagged)) {
                    checkOKCount++;
                }
                if (item.isReveal) {
                    checkOKCount++;
                }
            });
        });
        if (checkOKCount === MAP_WIDTH * MAP_HEIGHT) {
            return true;
        }
        return false;
    }

    function _winner() {
        STATUS_GAME_OVER = true;
        STATUS_START = false;
        eleSMILEBTN.classList.add('cool');
        _stopTimer();
        alert('Congratulation!');
    }

    function startGame() {
        _stopTimer();
        BOMB_COUNT = MAP_BOMB_COUNT;
        STATUS_START = false;
        STATUS_GAME_OVER = false;
        eleSMILEBTN.className = '';
        eleSMILEBTN.classList.add('smile')
        _clearMap();
        setBombCountText(bombs, MAP_WIDTH * MAP_HEIGHT);
        setTimerText(0);
        _initMapArray();
        _displayMap();
    }

    function mineData(ev) {
        if (ev.buttons > 0 || ev.buttons != 0) {
            // tip down
            // console.log('not click , go tip down?')
            return false;
        }
        if (STATUS_GAME_OVER) {
            return false;
        }
        var area = this.dataset.gridPosition.split(',');
        var gridData = MINE_MAP[area[1]][area[0]];
        if (gridData.isFlagged || gridData.isReveal) {
            return false;
        }
        if (!STATUS_START) {
            _startTimer();
            STATUS_START = true;
        }
        var isUncover = _uncoverGrid(gridData, false, false);
        if (isUncover) {
            if (_check_win()) {
                _winner();
            }
        }
    }

    function checkTip(ev) {
        if (ev.button != 1 && ev.button != 2) {
            return false;
        }
        if (STATUS_GAME_OVER) {
            return false;
        }
        var area = this.dataset.gridPosition.split(',');
        var gridData = MINE_MAP[area[1]][area[0]];
        if (gridData.isFlagged || !gridData.isReveal) {
            return false;
        }
        // 檢查炸彈數
        if (gridData.neighborMineCount <= 0) {
            return false;
        }
        // 檢查四周 flag
        var manualFlagCount = 0;
        for (var aY = -1; aY <= 1; aY++) {
            for (var aX = -1; aX <= 1; aX++) {
                if (gridData.y + aY < 0 || gridData.y + aY >= MAP_HEIGHT) {
                    continue;
                }
                if (gridData.x + aX < 0 || gridData.x + aX >= MAP_WIDTH) {
                    continue;
                }
                if (aX == 0 && aY == 0) {
                    continue;
                }
                var targetX = gridData.x + aX;
                var targetY = gridData.y + aY;
                var sGrid = MINE_MAP[targetY][targetX];
                if (sGrid.isFlagged) {
                    manualFlagCount++;
                }
            }
        }
        if (manualFlagCount === gridData.neighborMineCount) {
            open9Tip(gridData);
        } else {
            return false;
        }
    }


    function flagGrid(ev) {
        ev.preventDefault();
        if (STATUS_GAME_OVER) {
            return false;
        }
        var area = this.dataset.gridPosition.split(',');
        var gridData = MINE_MAP[area[1]][area[0]];
        if (gridData.isReveal) {
            return false;
        }
        var gridElement = document.getElementsByClassName('grid').item(gridData.gridLocation - 1);
        if (gridData.isFlagged) {
            gridData.isFlagged = false;
            BOMB_COUNT++;
            gridElement.classList.remove('flagged');
        } else {
            if (BOMB_COUNT <= 0) {
                return false;
            }
            gridData.isFlagged = true;
            gridElement.classList.add('flagged');
            BOMB_COUNT--;
        }
        setBombCountText(BOMB_COUNT);
        if (BOMB_COUNT === 0) {
            if (_check_win()) {
                _winner();
            }
        }
    }
    function open9Tip(gridData) {
        for (var aY = -1; aY <= 1; aY++) {
            for (var aX = -1; aX <= 1; aX++) {
                if (gridData.y + aY < 0 || gridData.y + aY >= MAP_HEIGHT) {
                    continue;
                }
                if (gridData.x + aX < 0 || gridData.x + aX >= MAP_WIDTH) {
                    continue;
                }
                if (aX == 0 && aY == 0) {
                    continue;
                }
                var targetX = gridData.x + aX;
                var targetY = gridData.y + aY;
                var sGrid = MINE_MAP[targetY][targetX];
                if (sGrid.isReveal || sGrid.isFlagged) {
                    continue;
                }
                _uncoverGrid(sGrid, false, true);
                if (sGrid.neighborMineCount == 0 && !sGrid.hasMine) {
                    open9Tip(sGrid);
                }
            }
        }
    }

    function open9Grid(gridData) {
        for (var aY = -1; aY <= 1; aY++) {
            for (var aX = -1; aX <= 1; aX++) {
                if (gridData.y + aY < 0 || gridData.y + aY >= MAP_HEIGHT) {
                    continue;
                }
                if (gridData.x + aX < 0 || gridData.x + aX >= MAP_WIDTH) {
                    continue;
                }
                if (aX == 0 && aY == 0) {
                    continue;
                }
                var targetX = gridData.x + aX;
                var targetY = gridData.y + aY;
                var sGrid = MINE_MAP[targetY][targetX];
                if (sGrid.isFlagged || sGrid.isReveal) {
                    continue;
                }

                __uncoverd_gridElement(sGrid);
                if (sGrid.neighborMineCount == 0) {
                    open9Grid(sGrid);
                }
            }
        }
    }

    function init(width, height, bombs, mapWindow, mapElement, bombCountElement, timerElement, btnReset) {

        if (bombs >= width * height) {
            throw "bomb count over limit.";
        }

        if (bombs > 999 || bombs < 1) {
            throw "bomb count not valid.";
        }

        MAP_WIDTH = width;
        MAP_HEIGHT = height;
        MAP_BOMB_COUNT = bombs;
        eleWindow = mapWindow;
        eleMAP = mapElement;
        eleBOMBCOUNT = bombCountElement;
        eleTIMER = timerElement;
        eleSMILEBTN = btnReset;
        eleSMILEBTN.addEventListener('click', CallANewGame);
        eleSMILEBTN.addEventListener('mouseup', CallANewGame);
        eleSMILEBTN.addEventListener('mouseout', CallANewGame);
        eleSMILEBTN.addEventListener('mousedown', function (e) {
            eleSMILEBTN.classList.add("touched");
        });
    }

    function restartGame(w, h, c) {
        MAP_WIDTH = w;
        MAP_HEIGHT = h;
        MAP_BOMB_COUNT = c;
        eleWindow.style.width = (w * 18 + 6) + "px";
        startGame();
    }

    return {
        init: init,
        start: startGame,
        restart: restartGame,
        mine: mineData,
    };
};
window.document.onkeydown = function (e) {
    if (e.keyCode === 82) {
        ms.start();
    }
}
//
var LevelOption = document.getElementById('changeLevel');
var GameWindow = document.getElementById("Wrapper");
var digMapElement = document.getElementById("DigMap");
var timeCounterElement = document.getElementById("gameTimerSeg");
var bombCounterElement = document.getElementById("bombCountSeg");
//
LevelOption.addEventListener('change', function () {
    var mapLevelData = this.options[this.options.selectedIndex].value;
    if (mapLevelData === '') { return false; }
    var newMapData = mapLevelData.split(',');
    ms.restart(newMapData[0], newMapData[1], newMapData[2]);
})
var initialOptionData = LevelOption.options[LevelOption.options.selectedIndex].value;
var initialDim = initialOptionData.split(',');
var width = initialDim[0];
var height = initialDim[1];
var bombs = initialDim[2];
GameWindow.style.width = (width * 18 + 6) + "px";
var ms = new MineSweeper();
var BtnReset = document.getElementById('btnReset').getElementsByTagName("button")[0];
ms.init(
    width, height, bombs, GameWindow,
    digMapElement, bombCounterElement, timeCounterElement,
    BtnReset
);
ms.start();
