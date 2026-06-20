const SOKOBAN_LEVELS = [
  [
    "#####",
    "#@  #",
    "# $ #",
    "# . #",
    "#####",
  ].join("\n"),
  ["####", "#@ #", "#$ #", "#. #", "####"].join("\n"),
  ["#####", "#   #", "#@$ #", "#  .#", "#####"].join("\n"),
  ["#####", "#.  #", "#$@ #", "#   #", "#####"].join("\n"),
  ["#####", "# @ #", "#.$ #", "#   #", "#####"].join("\n"),
  ["#####", "#   #", "#@$ #", "# . #", "#####"].join("\n"),
  [
    "  #####",
    "  #   #",
    "  #.$ #",
    "###@$ #",
    "# .   #",
    "#######",
  ].join("\n"),
  [
    "########",
    "#   .  #",
    "# $$@  #",
    "#  .   #",
    "########",
  ].join("\n"),
  ["#####", "#. .#", "#$$ #", "# @ #", "#####"].join("\n"),
  ["#####", "# . #", "#@$$#", "#  .#", "#####"].join("\n"),
  [
    "  ######",
    "  # .  #",
    "  # $$ #",
    "  #  .@#",
    "  ######",
  ].join("\n"),
  [
    "  ######",
    "  # .  #",
    "  #@$$ #",
    "  #  . #",
    "  ######",
  ].join("\n"),
  [
    "  #######",
    "  # . . #",
    "  # $$$ #",
    "  # .@  #",
    "  #######",
  ].join("\n"),
  [
    "  #######",
    "  # . . #",
    "  # $$$ #",
    "  #  .@ #",
    "  #######",
  ].join("\n"),
  [
    "  ########",
    "  # .  . #",
    "  # $ $$ #",
    "  #  . @ #",
    "  ########",
  ].join("\n"),
  [
    "  ########",
    "  # .  . #",
    "  # $$ $ #",
    "  #   @  #",
    "  # .    #",
    "  ########",
  ].join("\n"),
  [
    "  #########",
    "  # . . . #",
    "  # $ $ $ #",
    "  #   @   #",
    "  #########",
  ].join("\n"),
  [
    "  ##########",
    "  # . . . .#",
    "  # $ $ $ $#",
    "  #   @    #",
    "  ##########",
  ].join("\n"),
  [
    "  ##########",
    "  #  .  .  #",
    "  # $$$$   #",
    "  #    @   #",
    "  #  .  .  #",
    "  ##########",
  ].join("\n"),
  [
    "  ############",
    "  #   .  .   #",
    "  #  $$ $$   #",
    "  #     @    #",
    "  #   .  .   #",
    "  ############",
  ].join("\n"),
];

const TILE = {
  WALL: "#",
  FLOOR: " ",
  GOAL: ".",
  BOX: "$",
  PLAYER: "@",
  BOX_GOAL: "*",
  PLAYER_GOAL: "+",
};

const DIRECTIONS = {
  up: { dr: -1, dc: 0 },
  down: { dr: 1, dc: 0 },
  left: { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 },
};

const sokobanState = {
  grid: [],
  player: { row: 0, col: 0 },
  moves: 0,
  levelIndex: 0,
  won: false,
};

let sokobanPanel;
let sokobanBoardEl;
let sokobanStatusEl;
let sokobanMovesEl;
let sokobanLevelEl;
let sokobanPrevBtn;
let sokobanNextBtn;
let sokobanResetBtn;

function isBox(tile) {
  return tile === TILE.BOX || tile === TILE.BOX_GOAL;
}

function isGoal(tile) {
  return tile === TILE.GOAL || tile === TILE.BOX_GOAL || tile === TILE.PLAYER_GOAL;
}

function isWalkable(tile) {
  return tile !== TILE.WALL && !isBox(tile);
}

function playerTileAt(goal) {
  return goal ? TILE.PLAYER_GOAL : TILE.PLAYER;
}

function boxTileAt(goal) {
  return goal ? TILE.BOX_GOAL : TILE.BOX;
}

function parseLevel(levelText) {
  const rows = levelText.split("\n");
  const width = Math.max(...rows.map((row) => row.length));
  const grid = rows.map((row) => {
    const padded = row.padEnd(width, " ");
    return [...padded];
  });

  let player = { row: 0, col: 0 };
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const tile = grid[row][col];
      if (tile === TILE.PLAYER || tile === TILE.PLAYER_GOAL) {
        player = { row, col };
        grid[row][col] = isGoal(tile) ? TILE.GOAL : TILE.FLOOR;
      }
    }
  }

  return { grid, player };
}

function loadLevel(index) {
  sokobanState.levelIndex = index;
  sokobanState.moves = 0;
  sokobanState.won = false;

  const { grid, player } = parseLevel(SOKOBAN_LEVELS[index]);
  sokobanState.grid = grid;
  sokobanState.player = player;

  sokobanLevelEl.textContent = `${index + 1} / ${SOKOBAN_LEVELS.length}`;
  updateSokobanStatus();
  renderSokobanBoard();
}

function tileSymbol(tile) {
  switch (tile) {
    case TILE.WALL:
      return "";
    case TILE.GOAL:
      return "◎";
    case TILE.BOX:
      return "▣";
    case TILE.BOX_GOAL:
      return "▣";
    case TILE.PLAYER:
      return "●";
    case TILE.PLAYER_GOAL:
      return "●";
    default:
      return "";
  }
}

function tileClasses(tile) {
  const classes = ["sokoban-cell"];
  if (tile === TILE.WALL) classes.push("wall");
  if (isGoal(tile)) classes.push("goal");
  if (isBox(tile)) classes.push("box", isGoal(tile) ? "on-goal" : "");
  if (tile === TILE.PLAYER || tile === TILE.PLAYER_GOAL) classes.push("player");
  return classes.filter(Boolean).join(" ");
}

function getTileAt(row, col) {
  if (row < 0 || col < 0 || row >= sokobanState.grid.length) return TILE.WALL;
  if (col >= sokobanState.grid[row].length) return TILE.WALL;
  return sokobanState.grid[row][col];
}

function setTileAt(row, col, tile) {
  sokobanState.grid[row][col] = tile;
}

function checkSokobanWin() {
  for (const row of sokobanState.grid) {
    for (const tile of row) {
      if (tile === TILE.GOAL) return false;
    }
  }
  return true;
}

function updateSokobanStatus() {
  sokobanMovesEl.textContent = String(sokobanState.moves);

  if (sokobanState.won) {
    const isLast = sokobanState.levelIndex === SOKOBAN_LEVELS.length - 1;
    sokobanStatusEl.textContent = isLast
      ? "All levels complete!"
      : "Level complete! Try the next one.";
    sokobanStatusEl.className = "status winner-x";
    return;
  }

  sokobanStatusEl.textContent = "Push every box onto a goal";
  sokobanStatusEl.className = "status";
}

function renderSokobanBoard() {
  const { grid, player } = sokobanState;
  sokobanBoardEl.innerHTML = "";
  sokobanBoardEl.style.gridTemplateColumns = `repeat(${grid[0].length}, var(--sokoban-cell-size))`;

  grid.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      let displayTile = tile;
      if (player.row === rowIndex && player.col === colIndex) {
        displayTile = isGoal(tile) ? TILE.PLAYER_GOAL : TILE.PLAYER;
      }

      const cell = document.createElement("div");
      cell.className = tileClasses(displayTile);
      cell.textContent = tileSymbol(displayTile);
      cell.setAttribute("role", "gridcell");
      sokobanBoardEl.appendChild(cell);
    });
  });
}

function movePlayer(dr, dc) {
  if (sokobanState.won) return;

  const { row, col } = sokobanState.player;
  const nextRow = row + dr;
  const nextCol = col + dc;
  const ahead = getTileAt(nextRow, nextCol);

  if (ahead === TILE.WALL) return;

  if (!isBox(ahead)) {
    if (!isWalkable(ahead)) return;
    setTileAt(row, col, isGoal(getTileAt(row, col)) ? TILE.GOAL : TILE.FLOOR);
    sokobanState.player = { row: nextRow, col: nextCol };
  } else {
    const beyondRow = nextRow + dr;
    const beyondCol = nextCol + dc;
    const beyond = getTileAt(beyondRow, beyondCol);

    if (!isWalkable(beyond)) return;

    const currentIsGoal = isGoal(getTileAt(row, col));
    const aheadIsGoal = isGoal(ahead);
    const beyondIsGoal = isGoal(beyond);

    setTileAt(row, col, currentIsGoal ? TILE.GOAL : TILE.FLOOR);
    setTileAt(nextRow, nextCol, aheadIsGoal ? TILE.GOAL : TILE.FLOOR);
    setTileAt(beyondRow, beyondCol, boxTileAt(beyondIsGoal));
    sokobanState.player = { row: nextRow, col: nextCol };
  }

  sokobanState.moves += 1;

  if (checkSokobanWin()) {
    sokobanState.won = true;
  }

  updateSokobanStatus();
  renderSokobanBoard();
}

function handleSokobanKey(event) {
  if (sokobanPanel.hidden) return;

  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right",
  };

  const direction = keyMap[event.key];
  if (!direction) return;

  event.preventDefault();
  const { dr, dc } = DIRECTIONS[direction];
  movePlayer(dr, dc);
}

function initSokoban() {
  sokobanPanel = document.getElementById("game-sokoban");
  sokobanBoardEl = document.getElementById("sokoban-board");
  sokobanStatusEl = document.getElementById("sokoban-status");
  sokobanMovesEl = document.getElementById("sokoban-moves");
  sokobanLevelEl = document.getElementById("sokoban-level");
  sokobanPrevBtn = document.getElementById("sokoban-prev");
  sokobanNextBtn = document.getElementById("sokoban-next");
  sokobanResetBtn = document.getElementById("sokoban-reset");

  document.querySelectorAll(".sokoban-dir").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { dr, dc } = DIRECTIONS[btn.dataset.dir];
      movePlayer(dr, dc);
    });
  });

  sokobanPrevBtn.addEventListener("click", () => {
    const nextIndex =
      (sokobanState.levelIndex - 1 + SOKOBAN_LEVELS.length) % SOKOBAN_LEVELS.length;
    loadLevel(nextIndex);
  });

  sokobanNextBtn.addEventListener("click", () => {
    const nextIndex = (sokobanState.levelIndex + 1) % SOKOBAN_LEVELS.length;
    loadLevel(nextIndex);
  });

  sokobanResetBtn.addEventListener("click", () => loadLevel(sokobanState.levelIndex));
  document.addEventListener("keydown", handleSokobanKey);

  loadLevel(0);
}
