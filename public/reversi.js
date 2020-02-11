let playerBlack = {
    name: "",
    score: 0,
    avgPlayTime: 0,
    amountTurns: 0,
    amountTimeInSec: 0,
    amount2score: 0,
    prevGame: {
        prevAmountTimes: 0,
        prevAmountTurn: 0,
        avgAllTurns: 0,
    }
};

let playerWhite = {
    name: "",
    score: 0,
    avgPlayTime: 0,
    amountTurns: 0,
    amountTimeInSec: 0,
    amount2score: 0,
    prevGame: {
        prevAmountTimes: 0,
        prevAmountTurn: 0,
        avgAllTurns: 0,
    }
};

let reversi = {
    sizeGrid: 6,
    currentPlayer: "black",
    grid: [],
    canPlay: "false",
    saveArrayToChange: [],
    turns: 0,
    potential: false,

    timerAllGame: {
        timerElem: 0,
        seconds: 0,
        minuets: 0,
        stopTime: '',
    },

    timerForTurn: {
        seconds: 0,
        minuets: 0,
    }
}

const BRIGHT = 60;
const NOCHANGE = 100;
let playerB;
let playerW;
let check;
let msg;
let buttonStartOver;

function checkAvailableMoves() {
    reversi.saveArrayToChange = [];
    reversi.canPlay = "false";
    let rival = (reversi.currentPlayer === "black") ? "white" : "black";
    for (let i = 0; i < reversi.sizeGrid; i++) {
        for (let j = 0; j < reversi.sizeGrid; j++) {
            check = false; //let me know if I cant play a move with this cell
            reversi.grid[i][j].parentElement.disabled = false;
            changeBrithness(i, j, NOCHANGE)

            if (checkIfBlank(i, j)) {
                reversi.grid[i][j].className === "visible" ? reversi.grid[i][j].classList.replace("visible", "hidden") : "";
                checkIfRivalAround(i, j, rival);
            }
        }
    }
}

function changeBrithness(row, col, num) {
    (checkIfBlank(row, col)) ? reversi.grid[row][col].parentElement.style.filter = `brightness(${num}%)` : "";
}

function checkIfRivalAround(row, col, rival) {
    let obgResult;
    let arrayResult;

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            arrayResult = [];
            if (i !== 0 || j !== 0) {
                let rowCheck = row + i;
                let colCheck = col + j;

                if (isValidPosition(rowCheck, colCheck) && reversi.grid[rowCheck][colCheck].style.backgroundColor === rival) {
                    obgResult = {
                        "rowCheck": rowCheck,
                        "colCheck": colCheck,
                        "i": i,
                        "j": j
                    };

                    arrayResult = checkIfMoveSucceed(row, col, obgResult, rival);

                    if (arrayResult.length > 0) {
                        check = true;
                        reversi.canPlay = "true"; //let me know if the rival can play after I made a move
                        let itemToUpdate = reversi.saveArrayToChange.find(item => item.row === row && item.col === col);
                        if (typeof (itemToUpdate) !== "undefined") {
                            itemToUpdate.finalArray = (itemToUpdate.finalArray.concat(arrayResult))
                            itemToUpdate.count++;

                        } else {
                            reversi.saveArrayToChange.push({row: row, col: col, finalArray: arrayResult, count: 1});
                        }

                    }
                }
            }
        }
    }

    if (reversi.potential) {
        showPotential();
    }

    if (!check) {
        reversi.grid[row][col].parentElement.disabled = true;
        reversi.grid[row][col].innerText = "";
        changeBrithness(row, col, BRIGHT);
    }
}

function showPotential() {
    reversi.saveArrayToChange.forEach((item) => {
        let score = item.finalArray.length - item.count + 1;
        reversi.grid[item.row][item.col].innerText = score;
        reversi.grid[item.row][item.col].className === "hidden" ? reversi.grid[item.row][item.col].classList.replace("hidden", "visible") : "";
    });
}

function hidePotential() {
    reversi.saveArrayToChange.forEach((item) => {
        reversi.grid[item.row][item.col].innerText = "";
        reversi.grid[item.row][item.col].className === "visible" ? reversi.grid[item.row][item.col].classList.replace("visible", "hidden") : "";
    });
}

function checkIfMoveSucceed(row, col, obj, rival) {
    let finalArrayToChange = [];
    let possibleArrayToChange = [];
    let rowCheck = obj.rowCheck;
    let colCheck = obj.colCheck;
    let i = obj.i;
    let j = obj.j;

    while (isValidPosition(rowCheck, colCheck) && reversi.grid[rowCheck][colCheck].style.backgroundColor === rival) {
        possibleArrayToChange.push({row: rowCheck, col: colCheck});
        rowCheck += i; //save diraction
        colCheck += j;
    }

    //we depend that the player don't have the option to press on element that isn't valid
    if (isValidPosition(rowCheck, colCheck) && reversi.grid[rowCheck][colCheck].style.backgroundColor === reversi.currentPlayer) {
        finalArrayToChange.push({row: row, col: col});
        finalArrayToChange = finalArrayToChange.concat(possibleArrayToChange);
    }

    return finalArrayToChange;
}

function move(row, col) {

    let itemToUpdate = reversi.saveArrayToChange.find(item => item.row === row && item.col === col);
    itemToUpdate.finalArray.forEach((item) => {
        changeColor(item.row, item.col, reversi.currentPlayer);
    });

    recalculateStatistics(itemToUpdate);

    if (gridIsFull()) {
        buttonStartOver.disabled = false;
        createPupUpMessageEndGame();
        preventMovesAFterEndGame();

    } else {
        checkIfRivalCanPlayAndSetTurn();
        if (reversi.canPlay === "false") {
            checkIfRivalCanPlayAndSetTurn();

            if (reversi.canPlay === "false") {
                buttonStartOver.disabled = false;
                createPupUpMessageEndGame();
                preventMovesAFterEndGame();
            }
        } else {
            if (reversi.currentPlayer === "black") {
                playerB.firstElementChild.setAttribute('class', "mark");
                playerW.firstElementChild.removeAttribute('class', "mark");
            } else {
                playerW.firstElementChild.setAttribute('class', "mark");
                playerB.firstElementChild.removeAttribute('class', "mark");
            }
        }
    }
    reversi.timerForTurn.minuets = 0;
    reversi.timerForTurn.seconds = 0;
}

function createPupUpMessageEndGame(winPlayer) {
    let text;
    msg = document.querySelector(" .header")

    if (typeof (winPlayer) !== "undefined") {
        text = "Congratulations!!! The winner is: " + winPlayer.name;
    } else {
        if (playerBlack.score > playerWhite.score) {
            text = "Congratulations!!! The winner is: " + playerBlack.name;
        } else {
		    if (playerBlack.score < playerWhite.score) {
            		text = "Congratulations!!! The winner is: " + playerWhite.name;
		    }
        }
    }
    msg.innerText = text;
    msg.classList.replace("header", "show");
    clearInterval(reversi.timerAllGame.stopTime);
}

function removePupUpMessage() {
    msg.innerText = "Reversi Game";
    msg.classList.replace("show", "header");
}

function checkIfRivalCanPlayAndSetTurn() {
    reversi.currentPlayer = (reversi.currentPlayer === "black") ? "white" : "black";
    checkAvailableMoves();
}

function recalculateStatistics(itemToUpdate) {
    let m, s, avgPlayTime;
    let currentPlayer;
    let rivalPlayer;
    let currentPlayerElem;
    let rivalPlayerElem;
    let score = itemToUpdate.finalArray.length;
    let countMySelf = itemToUpdate.count;

    if (reversi.currentPlayer === "black") {
        currentPlayer = playerBlack;
        rivalPlayer = playerWhite;
        currentPlayerElem = document.querySelector("#playerB");
        rivalPlayerElem = document.querySelector("#playerW");
    } else {
        currentPlayer = playerWhite;
        rivalPlayer = playerBlack;
        currentPlayerElem = document.querySelector("#playerW");
        rivalPlayerElem = document.querySelector("#playerB");
    }

    currentPlayer.score = currentPlayer.score + (score - countMySelf + 1);
    rivalPlayer.score = rivalPlayer.score - score + countMySelf;
    currentPlayer.amountTurns++;
    currentPlayer.amountTimeInSec += reversi.timerForTurn.seconds + (reversi.timerForTurn.minuets * 60);
    avgPlayTime = (currentPlayer.amountTimeInSec / currentPlayer.amountTurns);

    m = Math.floor(avgPlayTime % 3600 / 60);
    s = Math.floor(avgPlayTime % 3600 % 60);

    currentPlayer.avgPlayTime = ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);

    if (currentPlayer.prevGame.prevAmountTurn > 0) {
        currentPlayer.prevGame.prevAmountTimes += currentPlayer.amountTimeInSec;
        currentPlayer.prevGame.prevAmountTurn += currentPlayer.amountTurns;
        avgPlayTime = (currentPlayer.prevGame.prevAmountTimes / currentPlayer.prevGame.prevAmountTurn);
        m = Math.floor(avgPlayTime % 3600 / 60);
        s = Math.floor(avgPlayTime % 3600 % 60);
        currentPlayer.prevGame.avgAllTurns = ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
    }

    (currentPlayer.score === 2) ? currentPlayer.amount2score++ : "";
    (rivalPlayer.score === 2) ? rivalPlayer.amount2score++ : "";
    reversi.turns++;
    updateInputs(currentPlayerElem, currentPlayer);
    updateInputs(rivalPlayerElem, rivalPlayer);
}

function isValidPosition(row, col) {
    return (row < reversi.sizeGrid && col < reversi.sizeGrid && row > -1 && col > -1);
}

function checkIfBlank(row, col) {
    return (reversi.grid[row][col].style.backgroundColor !== "black" && reversi.grid[row][col].style.backgroundColor !== "white");
}

function initGame() {
	document.querySelector("#endGame").disabled=false;
   buttonStartOver = document.querySelector("#resetButton");
    buttonStartOver.disabled = true;
    buttonStartOver.onclick = (() => {
        for (let i = 0; i < ; i++) {
            document.getElementsByClassName(`row${i.toString()}`)[0].remove();
        }

        removePupUpMessage();
        clearInterval(reversi.timerAllGame.stopTime);
        reversi.timerAllGame.minuets = 0;
        reversi.timerAllGame.seconds = 0;
        reversi.timerForTurn.minuets = 0;
        reversi.timerForTurn.seconds = 0;
        initGame();
    });

    document.querySelector("#potential").onclick = (() => {
        if (!reversi.potential) {
            reversi.potential = true;
            showPotential();
            document.querySelector("#potential").innerText = "Hide Potantial";

        } else {
            reversi.potential = false;
            document.querySelector("#potential").innerText = "Show Potantial";
            hidePotential();
        }
    })

    document.querySelector("#endGame").onclick = (() => {
        let winPlayer;
        (reversi.currentPlayer === "black") ? winPlayer = playerWhite : winPlayer = playerBlack;
        buttonStartOver.disabled = false;
        createPupUpMessageEndGame(winPlayer);
        preventMovesAFterEndGame();
    })

    reversi.timerAllGame.timerElem = document.querySelector(" .time");
    playerB = document.querySelector("#playerB");
    playerW = document.querySelector("#playerW");
    timer();
    initPlayers();
    updateInputs(playerB, playerBlack);
    updateInputs(playerW, playerWhite);
    preparGrid();
    checkAvailableMoves();
}

function initPlayers() {
    if (sessionStorage.getItem("pB") && sessionStorage.getItem("pW")) {
        playerBlack.name = sessionStorage.getItem("pB");
        playerWhite.name = sessionStorage.getItem("pW");
        sessionStorage.removeItem('pB');
        sessionStorage.removeItem('pw');
    }
    setUpObjPLayers(playerBlack);
    setUpObjPLayers(playerWhite);
    playerB.firstElementChild.setAttribute('class', "mark");
    playerW.firstElementChild.removeAttribute('class', "mark");
}

function setUpObjPLayers(objP) {
    if (objP.amountTurns > 0) {
        objP.prevGame.prevAmountTurn += objP.amountTurns;
    }
    if (objP.amountTimeInSec > 0) {
        objP.prevGame.prevAmountTimes += objP.amountTimeInSec;
    }
    objP.score = 2;
    objP.amountTurns = 0;
    objP.amountTimeInSec = 0;
    objP.avgPlayTime = 0;
    objP.amount2score = 0;
    reversi.turns = 0;
}

function updateInputs(player, objPlayer) {

    let par = player.querySelector(" .avgMoves").parentElement.className;
    if (objPlayer.prevGame.avgAllTurns.length > 0) {
        par === "hidden" ? player.querySelector(" .avgMoves").parentElement.classList.replace("hidden", "visible") : "";
        player.querySelector(" .avgMoves").innerHTML = objPlayer.prevGame.avgAllTurns;
    }
    player.querySelector(" .name").innerHTML = objPlayer.name;
    player.querySelector(".score").innerHTML = objPlayer.score;
    player.querySelector(".twoScore").innerHTML = objPlayer.amount2score;
    player.querySelector(".avgMov").innerText = objPlayer.avgPlayTime;
    document.querySelector(".turns").innerHTML = reversi.turns;
}

function preparGrid() {
    reversi.sizeGrid = sessionStorage.getItem("sizeGrid");
    let table = document.querySelector("#game-board");

    for (let i = 0; i < reversi.sizeGrid; i++) {

        let tr = table.appendChild(document.createElement('tr'));
        tr.setAttribute('class', "row" + i);
        reversi.grid[i] = [];

        for (let j = 0; j < reversi.sizeGrid; j++) {
            let td = tr.appendChild(document.createElement('td'));
            td.setAttribute('class', "col" + j);
            reversi.grid[i][j] = td.appendChild(document.createElement('span'));
            reversi.grid[i][j].setAttribute('class', "hidden");
            td.disabled = false;

            td.onclick = (() => {
                if (!(td.disabled)) {
                    move(i, j);
                }
            });
        }
    }
    changeColor(reversi.sizeGrid / 2, reversi.sizeGrid / 2 - 1, "black");
    changeColor(reversi.sizeGrid / 2 - 1, reversi.sizeGrid / 2, "black");
    changeColor(reversi.sizeGrid / 2 - 1, reversi.sizeGrid / 2 - 1, "white");
    changeColor(reversi.sizeGrid / 2, reversi.sizeGrid / 2, "white");
}

function changeColor(row, col, color) {
    reversi.grid[row][col].innerText = "";
    reversi.grid[row][col].className === "hidden" ? reversi.grid[row][col].classList.replace("hidden", "visible") : "";
    reversi.grid[row][col].style.backgroundColor = color;
}

function addTick() {
    let minAll = reversi.timerAllGame.minuets;
    let secAll = reversi.timerAllGame.seconds;
    let minTurn = reversi.timerForTurn.minuets;
    let secTurn = reversi.timerForTurn.seconds;

    secTurn++;
    secAll++;
    if (secAll >= 60) {
        secAll = 0;
        minAll++;
    }
    if (secTurn >= 60) {
        secTurn = 0;
        minTurn++;
    }

    reversi.timerAllGame.timerElem.querySelector(" .min").innerText = (minAll > 9) ? minAll + ":" : "0" + minAll + ":";
    reversi.timerAllGame.timerElem.querySelector(" .sec").innerText = (secAll > 9) ? secAll : "0" + secAll;
    reversi.timerAllGame.minuets = minAll;
    reversi.timerAllGame.seconds = secAll;
    reversi.timerForTurn.minuets = minTurn;
    reversi.timerForTurn.seconds = secTurn;
}

function timer() {
    reversi.timerAllGame.stopTime = setInterval(addTick, 1000);
}

function gridIsFull() {
    for (let i = 0; i < reversi.sizeGrid; i++) {
        for (let j = 0; j < reversi.sizeGrid; j++) {
            if (checkIfBlank(i, j)) return false;
        }
    }
    return true;
}

function preventMovesAFterEndGame() {
    document.querySelector("#endGame").disabled=true;
    for (let i = 0; i < reversi.sizeGrid; i++) {
        for (let j = 0; j < reversi.sizeGrid; j++) {
            reversi.grid[i][j].parentElement.disabled = true;
        }
    }
}


