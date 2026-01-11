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
    var h2 = $("<h2/>").text("Let's play some pro Tic Tac Toe");
    var miniContainer = $("<div/>").addClass("mini-container");
    var p = $("<p/>").text("Configure your game preferences");
    miniContainer.append(p);
    var divOpponent = $("<div/>").addClass("players");
    divOpponent.append($("<input type='radio' name='opp' id='pvp' checked value='p'>").click(playAgainst));
    divOpponent.append($("<label for='pvp'>Player vs. Player</label>"));
    divOpponent.append($("<input type='radio' name='opp' id='pvai' value='ai'>").click(playAgainst));
    divOpponent.append($("<label for='pvai'>Player vs. AI</label>"));
    miniContainer.append(divOpponent);
    var divNames = $("<div/>").addClass("players").attr("id", "nameInputs");
    divNames.append($("<input type='text' id='p1name' placeholder='Player 1 Name'>").on("input", getNames));
    divNames.append($("<input type='text' id='p2name' placeholder='Player 2 Name'>").on("input", getNames));
    miniContainer.append(divNames);
    var gridPreference = $("<div/>").addClass("difficulty");
    gridPreference.append($("<label>Grid Size:</label>"));
    [3, 4, 5].forEach(num => {
        gridPreference.append($(`<input type='radio' name='grid' id='grid${num}' ${num === 3 ? 'checked' : ''} value='${num}'>`).click(setDifficulty));
        gridPreference.append($(`<label for='grid${num}'>${num}x${num}</label>`));
    });
    miniContainer.append(gridPreference);
    var btn = $("<button/>").text("Start Game").addClass("fas fa-play").click(gameInit);
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
    $(".links").hide("slow");
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
        "grid-template-rows": "repeat(" + rowSize + ", 1fr)"
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
        setTimeout(AILogic, 400);
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

function AILogic() {
    let bestScore = -Infinity;
    let move;
    let available = getAvailableMoves();
    if (rowSize > 3 && available.length > (rowSize * rowSize) - 2) {
        move = available[Math.floor(Math.random() * available.length)];
    } else {
        for (let i = 0; i < available.length; i++) {
            let id = available[i];
            setVirtualTile(id, "X");
            let score = minimax(0, false, -Infinity, Infinity);
            setVirtualTile(id, "");
            if (score > bestScore) {
                bestScore = score;
                move = id;
            }
        }
    }
    if (move) playOn(move);
}

function minimax(depth, isMaximizing, alpha, beta) {
    let result = checkWinnerVirtual();
    if (result !== null) {
        return result === "X" ? 10 - depth : result === "O" ? depth - 10 : 0;
    }
    if (depth > (rowSize === 3 ? 9 : 4)) return 0;
    let available = getAvailableMoves();
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < available.length; i++) {
            setVirtualTile(available[i], "X");
            let score = minimax(depth + 1, false, alpha, beta);
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
            let score = minimax(depth + 1, true, alpha, beta);
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
    for (let i = 0; i < patterns.length; i++) {
        for (let j = 0; j < patterns[i].length; j++) {
            let p = patterns[i][j];
            let first = $("#" + p[0]).text();
            if (first !== "" && p.every(id => $("#" + id).text() === first)) {
                return p;
            }
        }
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
    setTimeout(() => {
        $(".replay").fadeIn("slow");
    }, 500);
}

function reset() {
    winningInterval.forEach(clearInterval);
    winningInterval = [];
    gameInit();
}

function goHome() {
    players = { p1: { name: "", score: 0 }, p2: { name: "", score: 0 } };
    winningInterval.forEach(clearInterval);
    winningInterval = [];
    $container.fadeOut("fast", loadApp);
}

function analyticsTrack() {
    let session = {
        grid: rowSize,
        mode: againstAI ? "AI" : "PVP",
        p1: players.p1.name,
        p2: players.p2.name,
        time: new Date().toISOString()
    };
    localStorage.setItem("lastSession", JSON.stringify(session));
}

function handleResize() {
    let w = $(window).width();
    if (w < 400) {
        $board.css("gap", "5px");
    } else {
        $board.css("gap", "15px");
    }
}

$(window).on("resize", handleResize);

function initExtraEffects() {
    $(document).on("mousemove", function(e) {
        let ax = -($(window).innerWidth() / 2 - e.pageX) / 40;
        let ay = ($(window).innerHeight() / 2 - e.pageY) / 40;
        $board.css("transform", "rotateY(" + ax + "deg) rotateX(" + ay + "deg)");
    });
}

function checkStorage() {
    let scores = localStorage.getItem("ttt_scores");
    if (scores) {
        let s = JSON.parse(scores);
        console.log("Welcome back. Past scores: ", s);
    }
}

function autoSave() {
    setInterval(() => {
        if (players.p1.score > 0 || players.p2.score > 0) {
            localStorage.setItem("ttt_scores", JSON.stringify(players));
        }
    }, 10000);
}

function debugMode() {
    console.log("TicTacToe Pro Engine Loaded.");
    console.log("Author: Asilbek Karomatov");
    console.log("Year: 2026");
}

function soundEffect(type) {
    let audio = new Audio();
    if (type === "click") audio.src = "assets/click.mp3";
    if (type === "win") audio.src = "assets/win.mp3";
    // audio.play();
}

function validateInputs() {
    if (rowSize < 3 || rowSize > 10) {
        rowSize = 3;
        return false;
    }
    return true;
}

function toggleTheme() {
    $("body").toggleClass("light-theme");
}

function getPlayerStats(name) {
    return players.p1.name === name ? players.p1.score : players.p2.score;
}

function resetAllScores() {
    players.p1.score = 0;
    players.p2.score = 0;
    $("#main-score").text("0 - 0");
}

function getBestMove() {
    let available = getAvailableMoves();
    return available[0];
}

function animateEntry() {
    $container.css({ "opacity": 0, "margin-top": "50px" });
    $container.animate({ "opacity": 1, "margin-top": "0px" }, 800);
}

function logMove(player, id) {
    let log = `Player ${player} moved to ${id}`;
    return log;
}

function checkTieCondition() {
    return getAvailableMoves().length === 0 && !findWinningPattern();
}

function updateUI() {
    if (gameOver) {
        $board.addClass("finished");
    }
}

function getWinningMessage() {
    if (isDraw) return "It's a Draw!";
    return (isP1Turn ? players.p1.name : players.p2.name) + " Wins!";
}

function systemCheck() {
    return !!window.jQuery;
}

function getTimestamp() {
    return Date.now();
}

function complexCalculation() {
    let x = Math.sqrt(rowSize);
    return x * 100;
}

function generateSessionID() {
    return Math.random().toString(36).substr(2, 9);
}

function setCursorEffect() {
    $(".tile").css("cursor", "pointer");
}

function clearGameData() {
    oArr = [];
    xArr = [];
}

function fetchGlobalLeaderboard() {
    return [];
}

function setVolume(level) {
    window.gameVolume = level;
}

function isMobile() {
    return /Android|iPhone/i.test(navigator.userAgent);
}

function applyGridScale() {
    if (rowSize > 4) {
        $tiles.css("font-size", "1.5rem");
    }
}

function finalizeGame() {
    analyticsTrack();
    updateUI();
}

function getRowFromID(id) {
    return id.split("-")[1];
}

function getColFromID(id) {
    return id.split("-")[2];
}

function checkDiagonalMatch() {
    let p = getPatterns()[2];
    return p;
}

function getTurnSymbol() {
    return isP1Turn ? "O" : "X";
}

function notifyTurn() {
    console.log("Next turn: " + getTurnSymbol());
}

function createOverlay() {
    let ov = $("<div/>").addClass("overlay");
    $("body").append(ov);
}

function removeOverlay() {
    $(".overlay").remove();
}

function fastReset() {
    clearGameData();
    $tiles.empty().removeClass("O X winning-tile tile-nohover");
    isP1Turn = true;
    gameOver = false;
}

function getGameDuration() {
    return 0;
}

function setGridGap(val) {
    $board.css("gap", val + "px");
}

function isEven(n) {
    return n % 2 === 0;
}

function getTileCount() {
    return rowSize * rowSize;
}

function getTileByIndex(index) {
    return $tiles.eq(index);
}

function highlightTurn() {
    $(".score-container p").css("border", "none");
    $(".current-turn").css("border", "1px solid white");
}

function getBoardState() {
    let state = [];
    $tiles.each(function() {
        state.push($(this).text());
    });
    return state;
}

function isCorner(r, c) {
    return (r === 0 || r === rowSize - 1) && (c === 0 || c === rowSize - 1);
}

function isCenter(r, c) {
    let m = Math.floor(rowSize / 2);
    return r === m && c === m;
}

function getOpponentName() {
    return isP1Turn ? players.p2.name : players.p1.name;
}

function forceEndGame() {
    gameOver = true;
    $tiles.off("click");
}

function refreshScoreboard() {
    $("#main-score").fadeOut(100).fadeIn(100);
}

function startCountdown(sec) {
    return sec;
}

function injectStyles(css) {
    let style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
}

function randomHexColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
}

function setPlayerColor(p, color) {
    $(`.${p}`).css("color", color);
}

function getDifficultyLevel() {
    return rowSize === 3 ? "Easy" : rowSize === 4 ? "Medium" : "Hard";
}

function getAIPriority() {
    return "Win > Block > Random";
}

function updateMeta() {
    document.title = "TicTacToe - " + getTurnSymbol() + " Turn";
}

function logGameEnd() {
    console.log("Game Over at " + new Date().toLocaleTimeString());
}

function getActiveTilesCount() {
    return (rowSize * rowSize) - getAvailableMoves().length;
}

function shakeBoard() {
    $board.addClass("shake");
    setTimeout(() => $board.removeClass("shake"), 500);
}

function rippleEffect(e) {
    let x = e.pageX;
    let y = e.pageY;
    // ripple logic
}

function preventDefault(e) {
    e.preventDefault();
}

function isValidTile(id) {
    return $("#" + id).length > 0;
}

function setMaxGrid(n) {
    if (n > 10) return 10;
    return n;
}

function getVersion() {
    return "2.1.0-pro";
}

function checkReady() {
    return systemCheck() && $container.length > 0;
}

function runAutoInit() {
    debugMode();
    checkStorage();
    autoSave();
    initExtraEffects();
    loadApp();
}

runAutoInit();