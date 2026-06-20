const GAME_TITLES = {
  tictactoe: "Tic Tac Toe",
  miner: "Miner",
  sokoban: "Sokoban",
};

const gamePanels = {
  tictactoe: document.getElementById("game-tictactoe"),
  miner: document.getElementById("game-miner"),
  sokoban: document.getElementById("game-sokoban"),
};

const navBtns = [...document.querySelectorAll(".game-nav-btn")];

function showGame(gameId) {
  navBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.game === gameId);
  });

  Object.entries(gamePanels).forEach(([id, panel]) => {
    const isActive = id === gameId;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  });

  document.title = GAME_TITLES[gameId] ?? "Game Hub";
}

navBtns.forEach((btn) => {
  btn.addEventListener("click", () => showGame(btn.dataset.game));
});

initTicTacToe();
initMiner();
initSokoban();
