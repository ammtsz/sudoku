if (!localStorage.getItem("gameProgress")) {
  localStorage.setItem(
    "gameProgress",
    JSON.stringify({
      easy: false,
      medium: false,
      hard: false,
    })
  );
}

let currentLevel = "";
let completedGameModal = new bootstrap.Modal(
  document.getElementById("completedGameModal")
);
let sudoku = new Sudoku();
let validation = new Validation(completedGameModal);

selectLevelModal();


function selectLevelModal() {
  JSON.parse(localStorage.getItem("gameProgress"));

  let myModal = new bootstrap.Modal(
    document.getElementById("selectLevelModal"),
    {
      keyboard: false,
      backdrop: "static",
    }
  );
  myModal.show();
}
function recoverGame() {
  sudoku.recoverGame(currentLevel);
  validation.actionsAfterBoardUpdate();
}
function startNewGame() {
  let gameProgress = JSON.parse(localStorage.getItem("gameProgress"));
  gameProgress[currentLevel] = false;

  localStorage.setItem("gameProgress", JSON.stringify(gameProgress));
  getSudoku(currentLevel);
}
function getSudoku() {
  let gameProgress = JSON.parse(localStorage.getItem("gameProgress"));

  if (!gameProgress[currentLevel]) {
    sudoku.fetchNewSudoku(currentLevel);

    gameProgress[currentLevel] = true;
    localStorage.setItem("gameProgress", JSON.stringify(gameProgress));
  } else {
    resumeGameModal();
  }
  validation.actionsAfterBoardUpdate();
}
function resumeGameModal() {
  document.querySelector(
    "#resume-game-level"
  ).textContent = document.querySelector(`#btn-${currentLevel}`).textContent;

  let myModal = new bootstrap.Modal(
    document.getElementById("resumeGameModal"),
    {
      keyboard: false,
      backdrop: "static",
    }
  );
  myModal.show();
}
function selectLevel(level) {
  currentLevel = level;
  setBtnLevelCSS();
  getSudoku();
}
function setBtnLevelCSS() {
  btnLevel = document.querySelector(`#btn-${currentLevel}`);

  document.querySelectorAll(`#level button`).forEach((btn) => {
    btn.classList.add("btn-sm");
    btn.classList.remove("bg__primary");
  });

  btnLevel.classList.remove("btn-sm");
  btnLevel.classList.add("bg__primary");
}
function resetBoard() {
  sudoku.resetBoard();
  selectLevelModal();
}
function startOver() {
  sudoku.startLevelOver();
}
function undo() {
  sudoku.undo();
  validation.actionsAfterBoardUpdate()
}
// function redo() {
//   sudoku.redo();
// }
