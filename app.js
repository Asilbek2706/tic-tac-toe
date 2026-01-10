// TODO: AI

// ---- Variables ---- //
var $container = $(".container"); // Main container
var $board; // Game Board
var $tiles; // Squares on the board
var players = { p1: { name: "", score: 0 }, p2: { name: "", score: 0 } }; // Players names
var rowSize = 3; // Row size (Row size of 3 means 3*3 grid)
var winningInterval = []; // Winning Intervals (to reset intervals)
var replayBtn; // Replay button
// Flags
var isP1Turn = true; // To track turns
var gameOver = false; // Game over
var isDraw = false;
var againstAI = false; // Against AI or Player
// Variables to hold plays
var oArr = [],
    xArr = [];

// ---- Functions ---- //

// ** MAIN VIEW ** //
// Load main page
function loadApp() {
    // fade container in and clear it
    $container.hide();
    $container.empty().fadeIn("slow");
    $(".links").show("slow");
    // Reset preferences
    againstAI = false;
    rowSize = 3;
    players.p2.name = "";

    // Heading
    var h2 = $("<h2/>").text("Let's play some pro Tic Tac Toe");
    // Container to hold elements
    var miniContainer = $("<div/>").addClass("mini-container");
    // Paragraph
    var p = $("<p/>").text("You can write your name(s) if you wnat");
    miniContainer.append(p);

    // Div to hold user preferences
    var div = $("<div/>").addClass("players");
    // Radio Selections and Labels
    var radio = $("<input type='radio' id='pvp' checked value='p'>").click(
        playAgainst
    );
    div.append(radio);
    var label = $("<label>")
        .attr("for", "pvp")
        .text("Player vs. Player");
    div.append(label);
    div.append($("<br>")); // Add break
    var radio = $("<input type='radio' id='pvai' value='ai'>").click(playAgainst);
    div.append(radio);
    var label = $("<label>")
        .attr("for", "pvai")
        .text("Player vs. AI");
    div.append(label);
    miniContainer.append(div);

    // New div to hold player name inputs
    div = $("<div/>").addClass("players");
    // Input for names
    var input1 = $("<input type='text' placeholder='Player 1'>").on(
        "input",
        getNames
    );
    div.append(input1);
    div.append($("<br>"));
    var input2 = $("<input type='text' placeholder='Player 2'>").on("input", getNames);
    div.append(input2);
    miniContainer.append(div);

    // Grid preference
    var gridPreference = $("<div/>").addClass("difficulty");
    label = $("<label/>").text("Difficulty: ");
    gridPreference.append(label);
    radio = $("<input type='radio' id='grid3' checked value='3'>").click(
        setDifficulty
    );
    gridPreference.append(radio);
    label = $("<label/>")
        .attr("for", "grid3")
        .text("3x3");
    gridPreference.append(label);
    radio = $("<input type='radio' id='grid4' value='4'>").click(setDifficulty);
    gridPreference.append(radio);
    label = $("<label/>")
        .attr("for", "grid4")
        .text("4x4");
    gridPreference.append(label);
    radio = $("<input type='radio' id='grid5' value='5'>").click(setDifficulty);
    gridPreference.append(radio);
    label = $("<label/>")
        .attr("for", "grid5")
        .text("5x5");
    gridPreference.append(label);
    miniContainer.append(gridPreference);

    // Play button
    var btn = $("<button/>")
        .text(" Play")
        .addClass("fas fa-th")
        .click(gameInit);
    miniContainer.append(btn);

    // Add to the main container
    $container.append(h2);
    $container.append(miniContainer);
}

// Change opponent function
function playAgainst(e) {
    // Get and reset radio buttons
    var radioes = $(".players input[type=radio]");
    for (r of radioes) r.checked = false;
    // Mark the clicked button
    this.checked = true;
    // Deside wether the second input field is needed
    if (this.value === "p") {
        againstAI = false;
        $(".players input[placeholder='Player 2']").slideDown("fast");
    } else {
        againstAI = true;
        $(".players input[placeholder='Player 2']").slideUp("fast");
    }
}

// Set difficulty level based on selection
function setDifficulty(e) {
    // Get and reset radio buttons
    var btns = $(".difficulty input");
    for (i of btns) i.checked = false;
    // Mark the clicked button
    this.checked = true;
    // Set the row size for the grid
    rowSize = this.value;
}

// Get names on key up (while typing)
function getNames(e) {
    // Get the last character of the placeholder
    var player = this.placeholder.charAt(this.placeholder.length - 1);
    // Set the names properly
    if (player === "1") players.p1.name = this.value;
    if (player === "2") players.p2.name = this.value;
}

// ** TRANSIOTIONING ** //

// Initialize the game
function gameInit(e) {
    // Reset flags and variables
    gameOver = false;
    isDraw = false;
    isP1Turn = true;
    (xArr = []), (oArr = []);
    // Remove score continer
    $(".score-container").remove();
    if (players.p1.name === "") players.p1.name = "P1";
    if (players.p2.name === "" && !againstAI) players.p2.name = "P2";
    else if (againstAI) players.p2.name = "AI";
    // Remove content with animation
    $container.fadeOut("fast");
    setTimeout(() => {
        $container.empty();
        startGame();
    }, 500);

    $(".links").hide("slow");
}

// Start the game
function startGame(e) {
    var scoreContainer = $("<div/>").addClass("score-container");

    var p = $("<p/>")
        .text(players.p1.name + " ")
        .append($("<span class='O'>O</span>"));
    scoreContainer.append(p);
    var div = $("<div/>");

    if (localStorage.getItem("scores") === null)
        localStorage.setItem("scores", players.p2.score + " - " + players.p2.score);
    div.text(players.p1.score + " - " + players.p2.score);
    scoreContainer.append(div);

    p = $("<p/>")
        .text(players.p2.name + " ")
        .append($("<span class='X'>X</span>"));
    scoreContainer.append(p);
    $container.prepend(scoreContainer);

    var homeBtn = $("<button/>")
        .text("Home ")
        .append($("<i/>").addClass("fas fa-home no-font	"))
        .css("margin", "0")
        .click(goHome);
    $container.prepend(homeBtn);
    $($(".score-container p")[0]).addClass("current-turn");
    // console.log($($(".score-container p")[0]).addClass("a"));

    // Add board div
    $board = $("<div/>").addClass("board");
    // Give it proper grid size
    $board.css("grid-template-columns", "repeat(" + rowSize + ", 1fr)");
    $board.css("grid-template-rows", "repeat(" + rowSize + ", 1fr)");

    // Generate tiles based on row size
    for (let i = 0; i < rowSize; i++) {
        for (let j = 0; j < rowSize; j++) {
            let tile = $("<div/>").addClass("tile");
            tile.attr("id", "" + i + j).click(tileClicked);
            $board.append(tile);
        }
    }
    // Add to container
    $container.append($board);
    $tiles = $(".tile");
    // Set time out to show
    setTimeout(() => {
        $container.fadeIn("fast");
    }, 500);

    var replayBtn = $("<button/>")
        .text(" Replay ")
        .css({ display: "block", margin: "auto", float: "right" })
        .addClass("replay")
        .append($("<i/>").addClass("fas fa-redo"))
        .click(reset);
    replayBtn.hide();
    $container.prepend(replayBtn);
}

// On square click
function tileClicked(e) {
    // var clickedTile = this;
    palyOn(this.id);
    if (againstAI && !gameOver) AITurn();
}

function palyOn(tileID) {
    // Check what to play
    var toPlay = isP1Turn ? "O" : "X";
    // Remove event from the clicked tile
    $("#" + tileID).off("click");
    // Push the play accordingly to the proper array
    isP1Turn ? oArr.push(tileID) : xArr.push(tileID);
    $("#" + tileID)
        .text(toPlay)
        .addClass(toPlay);

    $(".score-container div").className = toPlay;
    // Check for match
    checkForMatch();
    // Switch turns
    switchTurns();
}

function AITurn() {
    var patterns = getPatterns();
    var emptyTile = [],
        allEmpty = [],
        count = 0;
    allPatterns: for (let i = 0; i < patterns.length; i++) {
        // to count player's moves
        for (let j = 0; j < patterns[i].length; j++) {
            // If player is winning - interrupt
            // if(oArr.length < 3) return;
            // debugger;
            emptyTile = [];
            count = 0;
            if (!patterns[i][j].every(isFilled)) {
                for (let o = 0; o < patterns[i][j].length; o++) {
                    if ($("#" + patterns[i][j][o]).text() === "X") {
                        count++;
                    } else if ($("#" + patterns[i][j][o]).text() === "") {
                        allEmpty.push(patterns[i][j][o]);
                        emptyTile.push(patterns[i][j][o]);
                    }
                    if (count > 1) {
                        for (let k = 0; k < patterns[i][j].length; k++) {
                            if ($("#" + patterns[i][j][k]).text() === "") {
                                allEmpty.push(patterns[i][j][k]);
                                emptyTile.push(patterns[i][j][k]);
                            }
                        }
                        break allPatterns;
                    }
                }
            }
        }
    }
    console.log(count);
    if (count > 1) {
        console.log("Winning");
        console.log(emptyTile, count);
        palyOn(emptyTile.shift());
        return;
    }

    allPatterns1: for (let i = 0; i < patterns.length; i++) {
        // to count player's moves
        for (let j = 0; j < patterns[i].length; j++) {
            // If player is winning - interrupt
            // if(oArr.length < 3) return;
            // debugger;
            emptyTile = [];
            count = 0;
            if (!patterns[i][j].every(isFilled)) {
                for (let o = 0; o < patterns[i][j].length; o++) {
                    if ($("#" + patterns[i][j][o]).text() === "O") {
                        count++;
                    } else if ($("#" + patterns[i][j][o]).text() === "") {
                        allEmpty.push(patterns[i][j][o]);
                        emptyTile.push(patterns[i][j][o]);
                    }
                    if (count > 1) {
                        for (let k = 0; k < patterns[i][j].length; k++) {
                            if ($("#" + patterns[i][j][k]).text() === "") {
                                allEmpty.push(patterns[i][j][k]);
                                emptyTile.push(patterns[i][j][k]);
                            }
                        }
                        break allPatterns1;
                    }
                }
            }
        }
    }
    console.log(count);
    if (count > 1) {
        console.log("Danger");
        console.log(emptyTile, count);
        palyOn(emptyTile.shift());
        return;
    } else {
        console.log("No Danger");
        console.log(allEmpty);
        palyOn(allEmpty.pop());
        return;
    }
}

function isFilled(element) {
    return $("#" + element).text() !== "";
}

function switchTurns() {
    if (gameOver) return;
    isP1Turn = !isP1Turn;
    $(".score-container p").toggleClass("current-turn");
}

function goHome() {
    players = { p1: { name: "", score: 0 }, p2: { name: "", score: 0 } };
    reset();
    $container.fadeOut("slow");
    setTimeout(loadApp, 500);
}

// Check for match function
function checkForMatch() {
    // Return if no one played at least 3 times
    if (oArr.length < rowSize && xArr.length < rowSize) return;
    // Get the winning patterns
    var patterns = getPatterns();
    // Loop through patterns and finish the game if match is found
    for (let i = 0; i < patterns.length; i++) {
        for (let j = 0; j < patterns[i].length; j++) {
            if (patterns[i][j].every(isO)) {
                didWin(patterns[i][j]);
                return;
            } else if (patterns[i][j].every(isX)) {
                didWin(patterns[i][j]);
                return;
            }
        }
    }
    if (oArr.length + xArr.length === rowSize * rowSize) {
        isDraw = true;
        gameOver = true;
        showReplayBtn();
    }
}

// Test if all elements are match for X or O
function isO(currentVal) {
    return $("#" + currentVal).text() === "O";
}
function isX(currentVal) {
    return $("#" + currentVal).text() === "X";
}

function togglePattern(id) {
    winningInterval.push(
        setInterval(() => {
            $("#" + id).toggleClass("winning-tile");
        }, 500)
    );
}

function didWin(winningPattern) {
    gameOver = true;
    for (var t of $tiles) {
        $(t).off("click");
        $(t).addClass("tile-nohover");
        $(t).removeClass("tile");
    }
    for (id of winningPattern) togglePattern(id);
    isP1Turn ? players.p1.score++ : players.p2.score++;
    showReplayBtn();
}

function showReplayBtn() {
    setTimeout(() => {
        $(".replay").show("slow");
    }, 800);
}

function reset() {
    gameInit();
    for (interval of winningInterval) {
        clearInterval(interval);
    }
}

// Get patterns function: it loops through the grid to identify the winning patterns
function getPatterns() {
    var rows = [],
        cols = [],
        cross1 = [],
        cross2 = [];
    for (let i = 0; i < rowSize; i++) {
        var aRow = [],
            aCol = [];
        for (var j = 0; j < rowSize; j++) {
            aRow.push("" + i + j);
            aCol.push("" + j + i);
            if (i === j) cross1.push("" + i + j);
        }
        rows.push(aRow);
        cols.push(aCol);
        cross2.push("" + i + (rowSize - i - 1));
    }
    return [rows, cols, [cross1, cross2]];
}
// Load app from beginning
loadApp();