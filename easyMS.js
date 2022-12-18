// "use strict";

const MAP_WIDTH = 9;
const MAP_HEIGHT = 9;
const BOMB_COUNT = 9;

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
}
mGrid.prototype.setHasMine = function () {
    this.hasMine = true;
}
mGrid.prototype.setNeighborMineCount = function (count) {
    this.neighborMineCount = count;
}


var mapArray = [];
for (var aY = 0; aY < MAP_HEIGHT; aY++) {
    mapArray[aY] = [];
    for (var aX = 0; aX < MAP_WIDTH; aX++) {
        mapArray[aY][aX] = new mGrid(aX, aY);
    }
}

var mine_location_list = crypto.getRandomValues(new Uint16Array(MAP_WIDTH * MAP_HEIGHT))
var sorting_mine_location = Array.from(mine_location_list).sort((a, b) => { return b - a });
var real_mine_number_set = sorting_mine_location.slice(0, BOMB_COUNT);

var real_mine_location = [];
for (var i = 0; i < mine_location_list.length; i++) {
    if (real_mine_number_set.some((y) => {
        return y === mine_location_list[i]
    })) {
        real_mine_location.push(i + 1);
    }
}


for (var aY = 0; aY < mapArray.length; aY++) {
    for (var aX = 0; aX < mapArray[aY].length; aX++) {
        if (real_mine_location.some(value => {
            return value === mapArray[aY][aX].gridLocation
        })) {
            mapArray[aY][aX].setHasMine()
        }
    }
}

mapArray.forEach((valY, indexY) => {
    valY.forEach((gridObject, indexX) => {
        if (gridObject.hasMine) {
            return;
        }
        var tmpMineCount = 0;
        for (var lY = -1; lY <= 1; lY++) {
            for (var lX = -1; lX <= 1; lX++) {
                if (indexX + lX >= MAP_WIDTH || indexX + lX < 0 || indexY + lY >= MAP_HEIGHT || indexY + lY < 0) {
                    continue;
                }
                if (mapArray[indexY + lY][indexX + lX].hasMine) {
                    tmpMineCount++;
                }
            }
        }
        gridObject.setNeighborMineCount(tmpMineCount)
    })
});

mapArray.forEach((valY, indexY) => {
    var newLine = document.createElement("tr");

    valY.forEach((gridObject, indexX) => {
        var newGrid = document.createElement("td");
        newGrid.classList += ' grid';
        if (gridObject.hasMine) {
            newGrid.innerHTML = '*'
        } else if (gridObject.neighborMineCount > 0) {
            newGrid.innerHTML = gridObject.neighborMineCount
        }
        newLine.append(newGrid);
    });
    document.getElementById('msGrids').append(newLine)
});

document.getElementById('mineCountBox').innerHTML = BOMB_COUNT