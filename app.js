var $container = $(".container");
var $board;
var $tiles;
var players = { p1: { name: "", score: 0 }, p2: { name: "", score: 0 } };
var rowSize = 3;
var winningInterval = [];
var isP1Turn = true;
var gameOver = false;
var isDraw = false;
var againstAI = false;
var oArr = [], xArr = [];

function loadApp() {
    $container.hide().empty().fadeIn("slow");
    $(".links").show("slow");
    againstAI = false;
    rowSize = 3;
    players.p2.name = "";
    var h2 = $("<h2/>").text("Tic Tac Toe Pro");
    var miniContainer = $("<div/>").addClass("mini-container");
    var p = $("<p/>").text("O'yin sozlamalarini tanlang:");
    miniContainer.append(p);

    var divOpponent = $("<div/>").addClass("players");
    divOpponent.append($("<input type='radio' name='opp' id='pvp' checked value='p'>").click(playAgainst));
    divOpponent.append($("<label for='pvp'>PvP (Do'st bilan)</label>"));
    divOpponent.append($("<input type='radio' name='opp' id='pvai' value='ai'>").click(playAgainst));
    divOpponent.append($("<label for='pvai'>PvAI (Smart AI)</label>"));
    miniContainer.append(divOpponent);

    var divNames = $("<div/>").addClass("players").attr("id", "nameInputs");
    divNames.append($("<input type='text' id='p1name' placeholder='Player 1 Name'>").on("input", getNames));
    divNames.append($("<input type='text' id='p2name' placeholder='Player 2 Name'>").on("input", getNames));
    miniContainer.append(divNames);

    var gridPreference = $("<div/>").addClass("difficulty");
    gridPreference.append($("<label>Grid o'lchami: </label>"));
    [3, 4, 5].forEach(num => {
        gridPreference.append($(`<input type='radio' name='grid' id='grid${num}' ${num === 3 ? 'checked' : ''} value='${num}'>`).click(setDifficulty));
        gridPreference.append($(`<label for='grid${num}'>${num}x${num}</label>`));
    });
    miniContainer.append(gridPreference);

    var btn = $("<button/>").text("Boshlash").addClass("fas fa-play").click(gameInit);
    miniContainer.append(btn);
    $container.append(h2).append(miniContainer);
}

function playAgainst(e) {
    if (this.value === "p") {
        againstAI = false;
        $("#p2name").slideDown("fast");
    } else {
        againstAI = true;
        $("#p2name").slideUp("fast");
    }
}

function setDifficulty(e) {
    rowSize = parseInt(this.value);
}

function getNames(e) {
    if (this.id === "p1name") players.p1.name = this.value;
    if (this.id === "p2name") players.p2.name = this.value;
}

function gameInit(e) {
    gameOver = false;
    isDraw = false;
    isP1Turn = true;
    xArr = []; oArr = [];
    $(".score-container").remove();
    if (players.p1.name === "") players.p1.name = "P1";
    if (players.p2.name === "" && !againstAI) players.p2.name = "P2";
    else if (againstAI) players.p2.name = "Smart AI";
    $container.fadeOut("fast", function() {
        $container.empty();
        startGame();
    });
}

function startGame() {
    var scoreContainer = $("<div/>").addClass("score-container");
    var p1Disp = $("<p/>").attr("id", "p1-disp").text(players.p1.name + " ").append($("<span class='O'>O</span>"));
    var scoreDisp = $("<div/>").attr("id", "main-score").text(players.p1.score + " - " + players.p2.score);
    var p2Disp = $("<p/>").attr("id", "p2-disp").text(players.p2.name + " ").append($("<span class='X'>X</span>"));
    scoreContainer.append(p1Disp).append(scoreDisp).append(p2Disp);
    var homeBtn = $("<button/>").attr("id", "homeBtn").html("<i class='fas fa-home'></i>").click(goHome);
    $container.append(homeBtn).append(scoreContainer);
    $("#p1-disp").addClass("current-turn");

    $board = $("<div/>").addClass("board");
    $board.css({
        "grid-template-columns": "repeat(" + rowSize + ", 1fr)",
        "grid-template-rows": "repeat(" + rowSize + ", 1fr)",
        "display": "grid",
        "gap": "10px",
        "max-width": "400px",
        "margin": "20px auto"
    });

    for (let i = 0; i < rowSize; i++) {
        for (let j = 0; j < rowSize; j++) {
            let tile = $("<div/>").addClass("tile").attr("id", "t-" + i + "-" + j).click(function() {
                tileClicked(i, j);
            });
            $board.append(tile);
        }
    }
    $container.append($board);
    $tiles = $(".tile");
    var replayBtn = $("<button/>").text("Replay").addClass("replay").hide().click(reset);
    $container.append(replayBtn);
    $container.fadeIn("fast");
}

function tileClicked(r, c) {
    var id = "t-" + r + "-" + c;
    if ($("#" + id).text() !== "" || gameOver) return;
    playOn(id);
    if (againstAI && !gameOver) {
        // AI o'ylayotganini bildirish uchun kichik delay
        setTimeout(AILogic, 300);
    }
}

function playOn(tileID) {
    var toPlay = isP1Turn ? "O" : "X";
    var $el = $("#" + tileID);
    $el.text(toPlay).addClass(toPlay).off("click");
    isP1Turn ? oArr.push(tileID) : xArr.push(tileID);
    checkForMatch();
    if (!gameOver) switchTurns();
}

function switchTurns() {
    isP1Turn = !isP1Turn;
    $(".score-container p").toggleClass("current-turn");
}

// OPTIMIZATSIYA QILINGAN AI MANTIQI
function AILogic() {
    let available = getAvailableMoves();
    if (available.length === 0 || gameOver) return;

    let bestScore = -Infinity;
    let move;

    // Chuqurlikni grid o'lchamiga qarab cheklaymiz (QOTMASLIK UCHUN ASOSIY QISM)
    let maxDepth = (rowSize === 3) ? 9 : (rowSize === 4 ? 4 : 2);

    // Agar 4x4 yoki 5x5 bo'lsa va juda ko'p bo'sh joy bo'lsa, markazni egallashga harakat qiladi
    if (rowSize > 3 && available.length > (rowSize * rowSize) - 2) {
        let center = Math.floor(rowSize / 2);
        let centerID = `t-${center}-${center}`;
        move = $("#" + centerID).text() === "" ? centerID : available[Math.floor(Math.random() * available.length)];
    } else {
        for (let i = 0; i < available.length; i++) {
            let id = available[i];
            setVirtualTile(id, "X");
            let score = minimax(0, false, -Infinity, Infinity, maxDepth);
            setVirtualTile(id, "");
            if (score > bestScore) {
                bestScore = score;
                move = id;
            }
        }
    }
    if (move) playOn(move);
}

function minimax(depth, isMaximizing, alpha, beta, maxDepth) {
    let result = checkWinnerVirtual();
    if (result !== null) {
        if (result === "X") return 10 - depth;
        if (result === "O") return depth - 10;
        return 0;
    }

    if (depth >= maxDepth) return 0; // Chuqurlik yetganda to'xtatish

    let available = getAvailableMoves();
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < available.length; i++) {
            setVirtualTile(available[i], "X");
            let score = minimax(depth + 1, false, alpha, beta, maxDepth);
            setVirtualTile(available[i], "");
            bestScore = Math.max(score, bestScore);
            alpha = Math.max(alpha, score);
            if (beta <= alpha) break;
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < available.length; i++) {
            setVirtualTile(available[i], "O");
            let score = minimax(depth + 1, true, alpha, beta, maxDepth);
            setVirtualTile(available[i], "");
            bestScore = Math.min(score, bestScore);
            beta = Math.min(beta, score);
            if (beta <= alpha) break;
        }
        return bestScore;
    }
}

function getAvailableMoves() {
    let moves = [];
    $tiles.each(function() {
        if ($(this).text() === "") moves.push($(this).attr("id"));
    });
    return moves;
}

function setVirtualTile(id, val) {
    $("#" + id).text(val);
}

function checkWinnerVirtual() {
    let win = findWinningPattern();
    if (win) return $("#" + win[0]).text();
    if (getAvailableMoves().length === 0) return "tie";
    return null;
}

function checkForMatch() {
    let winPattern = findWinningPattern();
    if (winPattern) {
        didWin(winPattern);
    } else if (getAvailableMoves().length === 0) {
        isDraw = true;
        gameOver = true;
        showReplayBtn();
    }
}

function findWinningPattern() {
    let patterns = getPatterns();
    // Rows
    for (let r of patterns[0]) {
        let val = $("#" + r[0]).text();
        if (val !== "" && r.every(id => $("#" + id).text() === val)) return r;
    }
    // Cols
    for (let c of patterns[1]) {
        let val = $("#" + c[0]).text();
        if (val !== "" && c.every(id => $("#" + id).text() === val)) return c;
    }
    // Diagonals
    for (let d of patterns[2]) {
        let val = $("#" + d[0]).text();
        if (val !== "" && d.every(id => $("#" + id).text() === val)) return d;
    }
    return null;
}

function getPatterns() {
    var rows = [], cols = [], d1 = [], d2 = [];
    for (let i = 0; i < rowSize; i++) {
        let row = [], col = [];
        for (let j = 0; j < rowSize; j++) {
            row.push("t-" + i + "-" + j);
            col.push("t-" + j + "-" + i);
        }
        rows.push(row);
        cols.push(col);
        d1.push("t-" + i + "-" + i);
        d2.push("t-" + i + "-" + (rowSize - i - 1));
    }
    return [rows, cols, [d1, d2]];
}

function didWin(pattern) {
    gameOver = true;
    $tiles.addClass("tile-nohover").off("click");
    pattern.forEach(id => {
        let interval = setInterval(() => {
            $("#" + id).toggleClass("winning-tile");
        }, 300);
        winningInterval.push(interval);
    });
    if (isP1Turn) players.p1.score++;
    else players.p2.score++;
    $("#main-score").text(players.p1.score + " - " + players.p2.score);
    showReplayBtn();
}

function showReplayBtn() {
    setTimeout(() => { $(".replay").fadeIn("slow"); }, 500);
}

function reset() {
    winningInterval.forEach(clearInterval);
    winningInterval = [];
    gameInit();
}

function goHome() {
    players.p1.score = 0; players.p2.score = 0;
    winningInterval.forEach(clearInterval);
    winningInterval = [];
    $container.fadeOut("fast", loadApp);
}

$(document).ready(function() {
    loadApp();
});