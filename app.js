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

const state = {
  board: Array(9).fill(null),
  currentPlayer: "X",
  gameOver: false,
  mode: "pvp",
  scores: { X: 0, O: 0, draw: 0 },
};

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const cells = [...document.querySelectorAll(".cell")];
const scoreXEl = document.getElementById("score-x");
const scoreOEl = document.getElementById("score-o");
const scoreDrawEl = document.getElementById("score-draw");
const newGameBtn = document.getElementById("new-game");
const resetScoresBtn = document.getElementById("reset-scores");
const modeBtns = [...document.querySelectorAll(".mode-btn")];

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
  scoreXEl.textContent = state.scores.X;
  scoreOEl.textContent = state.scores.O;
  scoreDrawEl.textContent = state.scores.draw;
}

function setStatus(message, className = "") {
  statusEl.textContent = message;
  statusEl.className = `status${className ? ` ${className}` : ""}`;
}

function renderBoard() {
  cells.forEach((cell, index) => {
    const value = state.board[index];
    cell.textContent = value ?? "";
    cell.className = "cell";
    if (value) cell.classList.add(value.toLowerCase());
    cell.disabled = state.gameOver || value !== null;
  });
}

function endGame(result) {
  state.gameOver = true;

  if (result.winner) {
    result.line.forEach((index) => cells[index].classList.add("win"));
    state.scores[result.winner] += 1;
    const label = state.mode === "cpu" && result.winner === "O" ? "CPU" : result.winner;
    setStatus(`${label} wins!`, `winner-${result.winner.toLowerCase()}`);
  } else {
    state.scores.draw += 1;
    setStatus("It's a draw!", "draw");
  }

  updateScoresUI();
  cells.forEach((cell) => (cell.disabled = true));
}

function makeMove(index, player) {
  if (state.board[index] !== null || state.gameOver) return false;

  state.board[index] = player;
  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase(), "pop");
  cell.disabled = true;

  const result = getWinner(state.board);
  if (result) {
    endGame(result);
    return true;
  }

  state.currentPlayer = player === "X" ? "O" : "X";
  updateTurnStatus();
  return true;
}

function updateTurnStatus() {
  if (state.gameOver) return;

  if (state.mode === "cpu" && state.currentPlayer === "O") {
    setStatus("CPU is thinking…");
    return;
  }

  const label = state.currentPlayer === "X" ? "X" : state.mode === "cpu" ? "CPU (O)" : "O";
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
  const { index } = minimax(state.board, "O");
  makeMove(index, "O");
}

function handleCellClick(event) {
  const cell = event.target.closest(".cell");
  if (!cell || state.gameOver) return;

  const index = Number(cell.dataset.index);
  if (state.mode === "cpu" && state.currentPlayer === "O") return;

  const moved = makeMove(index, state.currentPlayer);
  if (!moved || state.gameOver) return;

  if (state.mode === "cpu" && !state.gameOver) {
    setTimeout(cpuMove, 400);
  }
}

function resetBoard() {
  state.board = Array(9).fill(null);
  state.currentPlayer = "X";
  state.gameOver = false;
  renderBoard();
  updateTurnStatus();
}

function setMode(mode) {
  state.mode = mode;
  modeBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  resetBoard();
}

boardEl.addEventListener("click", handleCellClick);
newGameBtn.addEventListener("click", resetBoard);
resetScoresBtn.addEventListener("click", () => {
  state.scores = { X: 0, O: 0, draw: 0 };
  updateScoresUI();
  resetBoard();
});
modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => setMode(btn.dataset.mode));
});

updateScoresUI();
updateTurnStatus();
