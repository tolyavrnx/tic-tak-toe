const MINER_ROWS = 9;
const MINER_COLS = 9;
const MINER_MINES = 10;

const minerState = {
  cells: [],
  minesPlaced: false,
  gameOver: false,
  won: false,
  flagCount: 0,
};

let minerBoardEl;
let minerStatusEl;
let minesLeftEl;
let flagsEl;
let minerNewGameBtn;

function cellIndex(row, col) {
  return row * MINER_COLS + col;
}

function neighbors(row, col) {
  const result = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < MINER_ROWS && c >= 0 && c < MINER_COLS) {
        result.push([r, c]);
      }
    }
  }
  return result;
}

function createEmptyBoard() {
  return Array.from({ length: MINER_ROWS * MINER_COLS }, () => ({
    mine: false,
    revealed: false,
    flagged: false,
    adjacent: 0,
  }));
}

function placeMines(safeRow, safeCol) {
  const safeZone = new Set(
    neighbors(safeRow, safeCol).map(([r, c]) => cellIndex(r, c))
  );
  safeZone.add(cellIndex(safeRow, safeCol));

  let placed = 0;
  while (placed < MINER_MINES) {
    const index = Math.floor(Math.random() * minerState.cells.length);
    if (minerState.cells[index].mine || safeZone.has(index)) continue;
    minerState.cells[index].mine = true;
    placed += 1;
  }

  minerState.cells.forEach((cell, index) => {
    if (cell.mine) return;
    const row = Math.floor(index / MINER_COLS);
    const col = index % MINER_COLS;
    cell.adjacent = neighbors(row, col).filter(([r, c]) => {
      return minerState.cells[cellIndex(r, c)].mine;
    }).length;
  });

  minerState.minesPlaced = true;
}

function updateMinerHud() {
  const minesLeft = Math.max(MINER_MINES - minerState.flagCount, 0);
  minesLeftEl.textContent = minesLeft;
  flagsEl.textContent = minerState.flagCount;
}

function setMinerStatus(message, className = "") {
  minerStatusEl.textContent = message;
  minerStatusEl.className = `status${className ? ` ${className}` : ""}`;
}

function renderMinerCell(button, cell) {
  button.className = "miner-cell";
  button.textContent = "";
  button.disabled = minerState.gameOver;

  if (cell.flagged) {
    button.classList.add("flagged");
    button.textContent = "⚑";
    button.setAttribute("aria-label", "Flagged");
    return;
  }

  if (!cell.revealed) {
    button.setAttribute("aria-label", "Hidden cell");
    return;
  }

  button.classList.add("revealed");
  button.disabled = true;

  if (cell.mine) {
    button.classList.add("mine");
    button.textContent = "💣";
    button.setAttribute("aria-label", "Mine");
    return;
  }

  if (cell.adjacent > 0) {
    button.classList.add(`n${cell.adjacent}`);
    button.textContent = String(cell.adjacent);
    button.setAttribute("aria-label", `${cell.adjacent} adjacent mines`);
  } else {
    button.setAttribute("aria-label", "Empty");
  }
}

function renderMinerBoard() {
  minerState.cells.forEach((cell, index) => {
    renderMinerCell(minerBoardEl.children[index], cell);
  });
  updateMinerHud();
}

function checkWin() {
  const allSafeRevealed = minerState.cells.every(
    (cell) => cell.mine || cell.revealed
  );
  if (!allSafeRevealed) return;

  minerState.gameOver = true;
  minerState.won = true;
  setMinerStatus("You win!", "winner-x");
  minerState.cells.forEach((cell, index) => {
    if (!cell.mine) return;
    const button = minerBoardEl.children[index];
    button.classList.add("mine-hint");
    button.textContent = "💣";
  });
  renderMinerBoard();
}

function revealAllMines() {
  minerState.cells.forEach((cell, index) => {
    if (!cell.mine) return;
    cell.revealed = true;
    const button = minerBoardEl.children[index];
    button.classList.add("revealed", "mine", "exploded");
    button.textContent = "💣";
  });
}

function endMinerGame(lost) {
  minerState.gameOver = true;
  minerState.won = !lost;
  if (lost) {
    setMinerStatus("Boom! Game over.", "winner-o");
    revealAllMines();
  }
  renderMinerBoard();
}

function revealCell(row, col) {
  const index = cellIndex(row, col);
  const cell = minerState.cells[index];

  if (cell.revealed || cell.flagged || minerState.gameOver) return;

  if (!minerState.minesPlaced) {
    placeMines(row, col);
  }

  cell.revealed = true;

  if (cell.mine) {
    renderMinerCell(minerBoardEl.children[index], cell);
    minerBoardEl.children[index].classList.add("exploded");
    endMinerGame(true);
    return;
  }

  const queue = [[row, col]];
  const visited = new Set([index]);

  while (queue.length) {
    const [r, c] = queue.shift();
    const i = cellIndex(r, c);
    const current = minerState.cells[i];
    current.revealed = true;

    if (current.adjacent !== 0) continue;

    for (const [nr, nc] of neighbors(r, c)) {
      const ni = cellIndex(nr, nc);
      const neighbor = minerState.cells[ni];
      if (neighbor.revealed || neighbor.flagged || neighbor.mine) continue;
      if (visited.has(ni)) continue;
      visited.add(ni);
      queue.push([nr, nc]);
    }
  }

  renderMinerBoard();
  checkWin();
}

function toggleFlag(row, col) {
  const index = cellIndex(row, col);
  const cell = minerState.cells[index];

  if (cell.revealed || minerState.gameOver) return;

  cell.flagged = !cell.flagged;
  minerState.flagCount += cell.flagged ? 1 : -1;
  renderMinerCell(minerBoardEl.children[index], cell);
  updateMinerHud();
}

function handleMinerPointer(event) {
  const button = event.target.closest(".miner-cell");
  if (!button || minerState.gameOver) return;

  const row = Number(button.dataset.row);
  const col = Number(button.dataset.col);

  if (event.type === "contextmenu") {
    event.preventDefault();
    toggleFlag(row, col);
    return;
  }

  if (event.button !== 0) return;
  revealCell(row, col);
}

function buildMinerBoard() {
  minerBoardEl.innerHTML = "";
  minerBoardEl.style.gridTemplateColumns = `repeat(${MINER_COLS}, var(--miner-cell-size))`;

  for (let row = 0; row < MINER_ROWS; row++) {
    for (let col = 0; col < MINER_COLS; col++) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "miner-cell";
      button.dataset.row = String(row);
      button.dataset.col = String(col);
      button.setAttribute("role", "gridcell");
      minerBoardEl.appendChild(button);
    }
  }
}

function resetMiner() {
  minerState.cells = createEmptyBoard();
  minerState.minesPlaced = false;
  minerState.gameOver = false;
  minerState.won = false;
  minerState.flagCount = 0;
  setMinerStatus("Left-click to reveal, right-click to flag");
  renderMinerBoard();
}

function initMiner() {
  minerBoardEl = document.getElementById("miner-board");
  minerStatusEl = document.getElementById("miner-status");
  minesLeftEl = document.getElementById("miner-mines-left");
  flagsEl = document.getElementById("miner-flags");
  minerNewGameBtn = document.getElementById("miner-new-game");

  buildMinerBoard();
  minerBoardEl.addEventListener("click", handleMinerPointer);
  minerBoardEl.addEventListener("contextmenu", handleMinerPointer);
  minerNewGameBtn.addEventListener("click", resetMiner);

  resetMiner();
}
