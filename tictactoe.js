const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const tttState = {
  board: Array(9).fill(null),
  currentPlayer: "X",
  gameOver: false,
  mode: "pvp",
  scores: { X: 0, O: 0, draw: 0 },
};

let boardEl;
let statusEl;
let cells;
let scoreXEl;
let scoreOEl;
let scoreDrawEl;
let newGameBtn;
let resetScoresBtn;
let modeBtns;

function getWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winner: null, line: null };
  }
  return null;
}

function updateScoresUI() {
  scoreXEl.textContent = tttState.scores.X;
  scoreOEl.textContent = tttState.scores.O;
  scoreDrawEl.textContent = tttState.scores.draw;
}

function setStatus(message, className = "") {
  statusEl.textContent = message;
  statusEl.className = `status${className ? ` ${className}` : ""}`;
}

function renderBoard() {
  cells.forEach((cell, index) => {
    const value = tttState.board[index];
    cell.textContent = value ?? "";
    cell.className = "cell";
    if (value) cell.classList.add(value.toLowerCase());
    cell.disabled = tttState.gameOver || value !== null;
  });
}

function endGame(result) {
  tttState.gameOver = true;

  if (result.winner) {
    result.line.forEach((index) => cells[index].classList.add("win"));
    tttState.scores[result.winner] += 1;
    const label = tttState.mode === "cpu" && result.winner === "O" ? "CPU" : result.winner;
    setStatus(`${label} wins!`, `winner-${result.winner.toLowerCase()}`);
  } else {
    tttState.scores.draw += 1;
    setStatus("It's a draw!", "draw");
  }

  updateScoresUI();
  cells.forEach((cell) => (cell.disabled = true));
}

function makeMove(index, player) {
  if (tttState.board[index] !== null || tttState.gameOver) return false;

  tttState.board[index] = player;
  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase(), "pop");
  cell.disabled = true;

  const result = getWinner(tttState.board);
  if (result) {
    endGame(result);
    return true;
  }

  tttState.currentPlayer = player === "X" ? "O" : "X";
  updateTurnStatus();
  return true;
}

function updateTurnStatus() {
  if (tttState.gameOver) return;

  if (tttState.mode === "cpu" && tttState.currentPlayer === "O") {
    setStatus("CPU is thinking…");
    return;
  }

  const label =
    tttState.currentPlayer === "X" ? "X" : tttState.mode === "cpu" ? "CPU (O)" : "O";
  setStatus(`${label}'s turn`);
}

function minimax(board, player) {
  const result = getWinner(board);
  if (result) {
    if (result.winner === "O") return { score: 1, index: null };
    if (result.winner === "X") return { score: -1, index: null };
    return { score: 0, index: null };
  }

  const moves = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] !== null) continue;

    const next = board.slice();
    next[i] = player;
    const { score } = minimax(next, player === "O" ? "X" : "O");
    moves.push({ index: i, score });
  }

  if (player === "O") {
    return moves.reduce((best, move) => (move.score > best.score ? move : best));
  }
  return moves.reduce((best, move) => (move.score < best.score ? move : best));
}

function cpuMove() {
  const { index } = minimax(tttState.board, "O");
  makeMove(index, "O");
}

function handleCellClick(event) {
  const cell = event.target.closest(".cell");
  if (!cell || tttState.gameOver) return;

  const index = Number(cell.dataset.index);
  if (tttState.mode === "cpu" && tttState.currentPlayer === "O") return;

  const moved = makeMove(index, tttState.currentPlayer);
  if (!moved || tttState.gameOver) return;

  if (tttState.mode === "cpu" && !tttState.gameOver) {
    setTimeout(cpuMove, 400);
  }
}

function resetBoard() {
  tttState.board = Array(9).fill(null);
  tttState.currentPlayer = "X";
  tttState.gameOver = false;
  renderBoard();
  updateTurnStatus();
}

function setMode(mode) {
  tttState.mode = mode;
  modeBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  resetBoard();
}

function initTicTacToe() {
  boardEl = document.getElementById("board");
  statusEl = document.getElementById("status");
  cells = [...document.querySelectorAll("#game-tictactoe .cell")];
  scoreXEl = document.getElementById("score-x");
  scoreOEl = document.getElementById("score-o");
  scoreDrawEl = document.getElementById("score-draw");
  newGameBtn = document.getElementById("new-game");
  resetScoresBtn = document.getElementById("reset-scores");
  modeBtns = [...document.querySelectorAll("#game-tictactoe .mode-btn")];

  boardEl.addEventListener("click", handleCellClick);
  newGameBtn.addEventListener("click", resetBoard);
  resetScoresBtn.addEventListener("click", () => {
    tttState.scores = { X: 0, O: 0, draw: 0 };
    updateScoresUI();
    resetBoard();
  });
  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });

  updateScoresUI();
  updateTurnStatus();
}
