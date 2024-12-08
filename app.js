const game = document.getElementById('game');
const gridElement = [];
const cells = [];

function renderBoard() {
    for (let i = 0; i < 9; ++i) {
        const row = document.createElement('div');
        row.className = 'row';
        const gridElementRow = [];
        for (let j = 0; j < 9; ++j) {
            const col = document.createElement('div');
            col.className = 'col';
            col.id = `${i}-${j}`;
            row.appendChild(col);

            if ((j + 1) % 3 == 0) {
                col.style.borderRightColor = 'white';
            }
            if ((i + 1) % 3 == 0) {
                col.style.borderBottomColor = 'white';
            }
            cells.push(col);
            gridElementRow.push(col);
        }
        gridElement.push(gridElementRow);
        game.appendChild(row);
    }
}

renderBoard();
function clearHighlight() {
    cells.forEach(cell => cell.classList.remove('highlight', 'active'));
}
function addActive(value) {
    if (!value) return;
    cells.forEach(cell => {
        if (cell.textContent == value) {
            cell.classList.add('active');
        }
    })
}

let activeCell = null;
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        activeCell = cell;
        let [row, col] = cell.id.split('-').map(Number);
        clearHighlight();
        for (let i = 0; i < 9; ++i) {
            gridElement[row][i].classList.add('highlight');
            gridElement[i][col].classList.add('highlight');
        }
        let boxRow = Math.floor(row / 3) * 3;
        let boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; ++i) {
            for (let j = boxCol; j < boxCol + 3; ++j) {
                gridElement[i][j].classList.add('highlight');
            }
        }
        cell.classList.add('active');
        addActive(cell.textContent);
    })
})
const rowSet = [];
const colSet = [];
const boxSet = [];
const skeleton = Array.from({ length: 9 }, () => Array(9).fill(0));

function initSet() {
    for (let i = 0; i < 9; ++i) {
        rowSet.push(new Set());
        colSet.push(new Set());
        boxSet.push(new Set());
    }
}
initSet();

function isSafeToPut(row, col, value) {
    if (rowSet[row].has(value)) return false;
    if (colSet[col].has(value)) return false;

    // Calculate index for 3x3 box
    const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    if (boxSet[boxIndex].has(value)) return false;

    return true;
}

function putValue(row, col, value) {
    skeleton[row][col] = value;
    rowSet[row].add(value);
    colSet[col].add(value);
    const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    boxSet[boxIndex].add(value);
}

function removeValue(row, col, value) {
    skeleton[row][col] = 0;
    rowSet[row].delete(value);
    colSet[col].delete(value);
    const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    boxSet[boxIndex].delete(value);
}

function generateSudoku() {
    const possibleValues = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    function fillGrid() {
        for (let row = 0; row < 9; ++row) {
            for (let col = 0; col < 9; ++col) {
                if (skeleton[row][col] === 0) {
                    // Shuffle possible values to ensure randomness
                    const shuffledValues = possibleValues.sort(() => Math.random() - 0.5);
                    for (let value of shuffledValues) {
                        if (isSafeToPut(row, col, value)) {
                            putValue(row, col, value);
                            if (fillGrid()) {
                                return true;
                            }
                            removeValue(row, col, value);
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    fillGrid();
    cells.forEach(cell => {
        const [row, col] = cell.id.split('-').map(Number);
        const value = skeleton[row][col];
        gridElement[row][col].textContent = value ? value : "";
    })
    for (let i = 0; i < 9; ++i) {
        for (let j = 0; j < 9; ++j) {
            skeleton[i][j]
            gridElement[i][j].textContent = skeleton[i][j];
            gridElement[i][j].className = "col";
            gridElement[i][j].classList.add('fixed-value');
        }
    }
}

function removeCells(difficulty) {
    document.querySelector('.dificulty').textContent = difficulty;
    let cellsToRemove;
    switch (difficulty) {
        case "hard": cellsToRemove = 50; break;
        case "medium": cellsToRemove = 35; break;
        default: cellsToRemove = 20; break;
    }

    while (cellsToRemove > 0) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        if (gridElement[row][col].textContent) {
            gridElement[row][col].textContent = '';
            gridElement[row][col].classList.remove('fixed-value');
            cellsToRemove--;
        }
    }
}

function printSkeleton() {
    console.log(skeleton.map(row => row.join(' ')).join('\n'));
}


const numberOccurance = {};
const mistakeCount = document.querySelector('.mistake-count span');
const numbers = document.querySelectorAll('.game-foot ul li');

function newGame() {
    generateSudoku();
    removeCells("medium");

    for (let i = 0; i < 9; ++i) {
        for (let j = 0; j < 9; ++j) {
            if (!gridElement[i][j].textContent) continue;
    
            let value = +gridElement[i][j].textContent;
            if (value in numberOccurance) {
                numberOccurance[value]++;
            }
            else {
                numberOccurance[value] = 1;
            }
        }
    }
    for (const num in numberOccurance) {
        numbers[+num - 1].children[1].textContent = numberOccurance[num];
    }
    numbers.forEach(number => {
        let value = 9 - number.children[1].textContent;
        if (value == 0) {
            number.classList.add('disable');
        }
        number.children[1].textContent = value;
    })
}
newGame();


function isGameOver() {
    for(const number of numbers){
        let value = number.children[1].textContent;
        if(value != 0) return false;
    }
    return true;
}

numbers.forEach(number => {
    number.addEventListener('click', () => {
        if (number.classList.contains('disable')) return;
        if (!activeCell) return;
        if (activeCell.classList.contains('fixed-value')) return;
        let value = number.children[0].textContent;
        if(value == activeCell.textContent){
            return;
        }
        activeCell.textContent = value;
        let [row, col] = activeCell.id.split('-').map(Number);
        if (skeleton[row][col] == value) {
            activeCell.classList.remove('mistake');
            activeCell.classList.add('correct');
            number.children[1].textContent--;
            if(number.children[1].textContent == 0){
                number.classList.add('disable');
                if(isGameOver()){
                    alert('game over');
                    newGame();
                }
                return;
            }
        }
        else {
            activeCell.classList.add('mistake');
            activeCell.classList.remove('correct');
            mistakeCount.textContent++;
            if (mistakeCount.textContent >= 3) {
                mistakeCount.textContent = 0;
                removeCells();
            }
        }
        addActive(value);
    })
})
