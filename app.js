const TicTacToe = (() => {
    let state = {
        grid: 3,
        mode: 'pvp',
        aiLevel: 'impossible',
        p1: { name: 'Player 1', score: 0, mark: 'O' },
        p2: { name: 'Player 2', score: 0, mark: 'X' },
        isP1Turn: true,
        board: [],
        gameOver: false
    };

    const init = () => {
        renderMenu();
        bindGlobalEvents();
    };

    const renderMenu = () => {
        const $c = $('.container').empty().append(`
            <h2>Pro <strong>TicTacToe</strong></h2>
            <div class="mini-container">
                <div class="option-group">
                    <label class="title">O'yin Rejimi</label>
                    <div class="selector-grid">
                        <div class="radio-btn">
                            <input type="radio" name="mode" id="pvp" value="pvp" ${state.mode === 'pvp' ? 'checked' : ''}>
                            <label for="pvp"><i class="fas fa-users"></i> PvP</label>
                        </div>
                        <div class="radio-btn">
                            <input type="radio" name="mode" id="pvai" value="pvai" ${state.mode === 'pvai' ? 'checked' : ''}>
                            <label for="pvai"><i class="fas fa-robot"></i> AI</label>
                        </div>
                    </div>
                </div>

                <div id="aiLevelsContainer" class="option-group" style="display: ${state.mode === 'pvai' ? 'block' : 'none'}">
                    <label class="title">AI Darajasi</label>
                    <div class="ai-grid selector-grid" style="grid-template-columns: repeat(4, 1fr)">
                        ${['easy', 'normal', 'hard', 'impossible'].map(lvl => `
                            <div class="radio-btn">
                                <input type="radio" name="aiLvl" id="${lvl}" value="${lvl}" ${state.aiLevel === lvl ? 'checked' : ''}>
                                <label for="${lvl}">${lvl.charAt(0).toUpperCase() + lvl.slice(1)}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="option-group">
                    <label class="title">Grid O'lchami</label>
                    <div class="selector-grid" style="grid-template-columns: repeat(3, 1fr)">
                        ${[3, 4, 5].map(n => `
                            <div class="radio-btn">
                                <input type="radio" name="grid" id="g${n}" value="${n}" ${state.grid === n ? 'checked' : ''}>
                                <label for="g${n}">${n}x${n}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="name-inputs">
                    <input type="text" id="p1name" placeholder="P1 Nomi" value="${state.p1.name}">
                    <input type="text" id="p2name" placeholder="P2 Nomi" value="${state.p2.name}" style="display: ${state.mode === 'pvp' ? 'block' : 'none'}">
                </div>

                <button class="btn-start">O'yinni Boshlash</button>
            </div>
        `);

        bindMenuEvents();
    };

    const bindMenuEvents = () => {
        $('input[name="mode"]').change(function () {
            state.mode = $(this).val();
            $('#aiLevelsContainer').slideToggle(state.mode === 'pvai');
            $('#p2name').fadeToggle(state.mode === 'pvp');
        });

        $('input[name="grid"]').change(function () { state.grid = parseInt($(this).val()); });
        $('input[name="aiLvl"]').change(function () { state.aiLevel = $(this).val(); });
        $('#p1name').on('input', function () { state.p1.name = $(this).val() || 'P1'; });
        $('#p2name').on('input', function () { state.p2.name = $(this).val() || 'P2'; });

        $('.btn-start').click(startGame);
    };

    const startGame = () => {
        state.gameOver = false;
        state.isP1Turn = true;
        state.board = Array(state.grid * state.grid).fill(null);
        if (state.mode === 'pvai') state.p2.name = `AI (${state.aiLevel})`;

        $('.container').fadeOut(300, function () {
            renderBoard();
            $(this).fadeIn(300);
        });
    };

    const renderBoard = () => {
        const $c = $('.container').empty().append(`
            <div class="controls">
                <button id="backBtn"><i class="fas fa-chevron-left"></i></button>
                <button id="resetBtn"><i class="fas fa-sync-alt"></i></button>
            </div>
            <div class="score-container">
                <div class="score-item p1-score active">
                    <span class="name">${state.p1.name}</span>
                    <span class="mark O">O</span>
                    <div class="val">${state.p1.score}</div>
                </div>
                <div class="score-divider">:</div>
                <div class="score-item p2-score">
                    <span class="name">${state.p2.name}</span>
                    <span class="mark X">X</span>
                    <div class="val">${state.p2.score}</div>
                </div>
            </div>
            <div class="board"></div>
        `);

        const $board = $('.board').css({
            'grid-template-columns': `repeat(${state.grid}, 1fr)`,
        });

        state.board.forEach((_, i) => {
            $board.append(`<div class="tile" data-index="${i}"></div>`);
        });

        bindBoardEvents();
    };

    const bindBoardEvents = () => {
        $('.tile').click(function () {
            const idx = $(this).data('index');
            if (!state.board[idx] && !state.gameOver) handleMove(idx);
        });

        $('#backBtn').click(() => {
            state.p1.score = 0; state.p2.score = 0;
            renderMenu();
        });

        $('#resetBtn').click(startGame);
    };

    const handleMove = (idx) => {
        const symbol = state.isP1Turn ? 'O' : 'X';
        state.board[idx] = symbol;
        $(`.tile[data-index="${idx}"]`).text(symbol).addClass(symbol).addClass('tile-nohover');

        const winData = checkWinner(state.board);
        if (winData) {
            endGame(winData);
        } else if (state.board.every(t => t !== null)) {
            endGame('draw');
        } else {
            state.isP1Turn = !state.isP1Turn;
            updateTurnUI();
            if (!state.isP1Turn && state.mode === 'pvai') {
                setTimeout(aiMove, 600);
            }
        }
    };

    const updateTurnUI = () => {
        $('.score-item').removeClass('active');
        state.isP1Turn ? $('.p1-score').addClass('active') : $('.p2-score').addClass('active');
    };

    const checkWinner = (board) => {
        const lines = getWinningLines();
        for (let line of lines) {
            const [a, ...rest] = line;
            if (board[a] && rest.every(i => board[i] === board[a])) {
                return { winner: board[a], line };
            }
        }
        return null;
    };

    const getWinningLines = () => {
        const n = state.grid;
        const lines = [];
        for (let i = 0; i < n; i++) {
            let row = [];
            for (let j = 0; j < n; j++) row.push(i * n + j);
            lines.push(row);
        }
        for (let i = 0; i < n; i++) {
            let col = [];
            for (let j = 0; j < n; j++) col.push(j * n + i);
            lines.push(col);
        }
        let d1 = [], d2 = [];
        for (let i = 0; i < n; i++) {
            d1.push(i * n + i);
            d2.push(i * n + (n - 1 - i));
        }
        lines.push(d1, d2);
        return lines;
    };

    const aiMove = () => {
        let move;
        const available = state.board.map((v, i) => v === null ? i : null).filter(v => v !== null);

        if (state.aiLevel === 'easy') {
            move = available[Math.floor(Math.random() * available.length)];
        } else if (state.aiLevel === 'normal') {
            move = Math.random() > 0.5 ? minimax(state.board, 0, -Infinity, Infinity, true, 2).index : available[Math.floor(Math.random() * available.length)];
        } else if (state.aiLevel === 'hard') {
            move = minimax(state.board, 0, -Infinity, Infinity, true, 4).index;
        } else {
            const depth = state.grid === 3 ? 10 : 5;
            move = minimax(state.board, 0, -Infinity, Infinity, true, depth).index;
        }

        handleMove(move);
    };

    const minimax = (board, depth, alpha, beta, isMax, maxD) => {
        const result = checkWinner(board);
        if (result && result.winner === 'X') return { score: 10 - depth };
        if (result && result.winner === 'O') return { score: depth - 10 };
        if (board.every(t => t !== null) || depth === maxD) return { score: 0 };

        const moves = [];
        board.forEach((val, i) => {
            if (val === null) {
                board[i] = isMax ? 'X' : 'O';
                const score = minimax(board, depth + 1, alpha, beta, !isMax, maxD).score;
                board[i] = null;
                moves.push({ index: i, score });
                if (isMax) alpha = Math.max(alpha, score);
                else beta = Math.min(beta, score);
                if (beta <= alpha) return;
            }
        });

        if (isMax) {
            let best = { score: -Infinity };
            moves.forEach(m => { if (m.score > best.score) best = m; });
            return best;
        } else {
            let best = { score: Infinity };
            moves.forEach(m => { if (m.score < best.score) best = m; });
            return best;
        }
    };

    const endGame = (data) => {
        state.gameOver = true;
        let msg = "Durang!";
        if (data !== 'draw') {
            data.line.forEach(i => $(`.tile[data-index="${i}"]`).addClass('winning-tile'));
            if (data.winner === 'O') {
                state.p1.score++;
                msg = `${state.p1.name} G'alaba qozondi!`;
            } else {
                state.p2.score++;
                msg = `${state.p2.name} G'alaba qozondi!`;
            }
        }

        setTimeout(() => {
            $('.container').append(`
                <div class="replay-overlay">
                    <h3>${msg}</h3>
                    <button class="btn-replay">Yana bir bor?</button>
                </div>
            `);
            $('.btn-replay').click(startGame);
        }, 800);
    };

    const bindGlobalEvents = () => {
    };

    return { init };
})();

$(document).ready(() => TicTacToe.init());