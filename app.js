"use strict";

const state = {
    board: Array(9).fill(null),
    players: { X: "", O: "" },
    symbols: ['X', 'O'],
    isGameActive: false,
    mode: 'pvp'
};

// G'alaba kombinatsiyalari va chizig'i (Dinamik)
const winPatterns = [
    { combo: [0, 1, 2], s: { width: "100%", height: "6px", top: "16.5%", left: "0" } },
    { combo: [3, 4, 5], s: { width: "100%", height: "6px", top: "50%", left: "0" } },
    { combo: [6, 7, 8], s: { width: "100%", height: "6px", top: "83.5%", left: "0" } },
    { combo: [0, 3, 6], s: { width: "6px", height: "100%", left: "16.5%", top: "0" } },
    { combo: [1, 4, 7], s: { width: "6px", height: "100%", left: "50%", top: "0" } },
    { combo: [2, 5, 8], s: { width: "6px", height: "100%", left: "83.5%", top: "0" } },
    { combo: [0, 4, 8], s: { width: "140%", height: "6px", top: "50%", left: "-20%", transform: "rotate(45deg)" } },
    { combo: [2, 4, 6], s: { width: "140%", height: "6px", top: "50%", left: "-20%", transform: "rotate(-45deg)" } }
];

window.setMode = (m) => {
    state.mode = m;
    const inputs = document.getElementById('player-inputs');
    inputs.classList.remove('hidden');

    // Tugmalarga aktiv klass qo'shish (CSS uchun)
    if (m === 'pvc') {
        document.getElementById('p2-input').value = "🤖 CyberBot";
        document.getElementById('p2-input').disabled = true;
    } else {
        document.getElementById('p2-input').value = "";
        document.getElementById('p2-input').disabled = false;
    }
};

document.getElementById('start-btn').onclick = () => {
    state.players.X = document.getElementById('p1-input').value || "O'yinchi 1";
    state.players.O = document.getElementById('p2-input').value || "O'yinchi 2";
    startGame();
};

function startGame() {
    state.board.fill(null);
    state.isGameActive = true;
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    document.getElementById('strike').style.display = 'none';

    document.querySelectorAll('.cell').forEach(c => {
        c.innerText = '';
        c.className = 'cell';
    });
    updateStatus();
}

function updateStatus() {
    const symbol = state.symbols[0];
    const color = symbol === 'X' ? '#38bdf8' : '#f472b6';
    document.getElementById('statusText').innerHTML =
        `Navbat: <span style="color: ${color}; text-shadow: 0 0 10px ${color}">${state.players[symbol]}</span>`;
}

document.querySelectorAll('.cell').forEach(cell => {
    cell.onclick = (e) => {
        const idx = e.target.dataset.index;
        if (state.board[idx] || !state.isGameActive) return;

        handleMove(idx);

        if (state.isGameActive && state.mode === 'pvc') {
            state.isGameActive = false;
            setTimeout(() => {
                const aiMove = getBestMove(state.board);
                handleMove(aiMove);
                state.isGameActive = true;
            }, 600);
        }
    };
});

function handleMove(idx) {
    const symbol = state.symbols[0];
    state.board[idx] = symbol;

    const el = document.querySelector(`[data-index='${idx}']`);
    el.innerText = symbol;
    el.classList.add(symbol.toLowerCase());

    const win = checkWin(state.board, symbol);
    if (win) {
        endGame(symbol, win);
    } else if (state.board.every(b => b)) {
        endGame(null);
    } else {
        state.symbols.reverse();
        updateStatus();
    }
}

function checkWin(b, p) {
    return winPatterns.find(pat => pat.combo.every(i => b[i] === p));
}

function endGame(winner, winObj) {
    state.isGameActive = false;
    const status = document.getElementById('statusText');

    if (winner) {
        const strike = document.getElementById('strike');
        strike.style.display = 'block';
        Object.assign(strike.style, winObj.s);

        winObj.combo.forEach(i => document.querySelector(`[data-index='${i}']`).classList.add('winner'));
        state.board.forEach((val, i) => {
            if (val && !winObj.combo.includes(i)) document.querySelector(`[data-index='${i}']`).classList.add('loser');
        });

        status.innerHTML = `🏆 <span style="color:#4ade80">${state.players[winner]} yutdi!</span>`;
    } else {
        status.innerHTML = `<span style="color:#cbd5e1">🤝 Durang bo'ldi!</span>`;
    }
}

// Qayta boshlash mantiqi (Har doim belgilar almashadi)
document.getElementById('restart-btn').onclick = () => {
    // 1. Belgilarni almashtirish (X o'rniga O boshlaydi yoki aksincha)
    state.symbols.reverse();

    // 2. Boardni tozalash
    state.board.fill(null);
    state.isGameActive = true;

    // 3. UI ni yangilash
    document.getElementById('strike').style.display = 'none';
    document.querySelectorAll('.cell').forEach(c => {
        c.className = 'cell';
        c.innerText = '';
    });
    updateStatus();
};

// Rejim tanlanganda vizual effekt (SetMode yangilandi)
window.setMode = (m) => {
    state.mode = m;
    document.getElementById('player-inputs').classList.remove('hidden');

    const p2Input = document.getElementById('p2-input');
    if (m === 'pvc') {
        p2Input.value = "🤖 CyberBot";
        p2Input.disabled = true;
    } else {
        p2Input.value = "";
        p2Input.disabled = false;
        p2Input.placeholder = "O'yinchi 2 nomi";
    }
};

document.getElementById('exit-btn').onclick = () => location.reload();

// --- AI LOGIC (MINIMAX) ---

function getBestMove(b) {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
        if (!b[i]) {
            b[i] = 'O';
            let score = minimax(b, 0, false);
            b[i] = null;
            if (score > bestScore) { bestScore = score; move = i; }
        }
    }
    return move;
}

function minimax(b, depth, isMax) {
    if (checkWin(b, 'O')) return 10 - depth;
    if (checkWin(b, 'X')) return depth - 10;
    if (b.every(s => s)) return 0;

    if (isMax) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (!b[i]) {
                b[i] = 'O';
                best = Math.max(best, minimax(b, depth + 1, false));
                b[i] = null;
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (!b[i]) {
                b[i] = 'X';
                best = Math.min(best, minimax(b, depth + 1, true));
                b[i] = null;
            }
        }
        return best;
    }
}