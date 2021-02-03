class Sudoku {
  constructor() {
    this.boardHtml = document.querySelector("#board");
    this.numbersBarHtml = document.querySelector("#numbers-bar");
    this.levelHtml = document.querySelector("#modal-level");

    this.validNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.lastClick = [];
    this.level;
    this.inputOnFocus;
    this.inputOnBlur;
    this.lastNumberClicked;
    this.isMobile
    this.initialize();
  }

  initialize() {
    this.isItAMobile()
    this.addDOMclickEvent();
    this.createDatasets();
    this.setBoardInputsEvents();
    this.setBoardInputsRestrictions();
    this.setNumbersBarEvents();
  }

  // Called by Constructor or EventsListeners
  isItAMobile(){
    this.isMobile = getComputedStyle(document.querySelector("#mobile-devices")).display == "none"
  }
  addDOMclickEvent() {
    document.addEventListener("click", (event) => {
      if (this.lastClick[0]) this.lastClick[1] = this.lastClick[0];
      this.lastClick[0] = event.target;
    });
  }
  createDatasets() {
    this.boardHtml.querySelectorAll("input").forEach((input) => {
      input.dataset.lastkey = "";
    });
  }
  highlight_x_y_box() {
    this.highlightEqualNumbers();

    this.boardHtml
      .querySelectorAll(`[data-box = '${this.inputOnFocus.box}']`)
      .forEach((input) => {
        input.classList.add("input__highlight");
      });
    this.boardHtml
      .querySelectorAll(`[data-x = '${this.inputOnFocus.x}']`)
      .forEach((input) => {
        input.classList.add("input__highlight");
      });
    this.boardHtml
      .querySelectorAll(`[data-y = '${this.inputOnFocus.y}']`)
      .forEach((input) => {
        input.classList.add("input__highlight");
      });
  }
  resetHighlighted_x_y_box() {
    this.resetHighlightedEqualNumbers();

    this.boardHtml
      .querySelectorAll(`[data-x = '${this.inputOnFocus.x}']`)
      .forEach((input) => {
        input.classList.remove("input__highlight");
      });
    this.boardHtml
      .querySelectorAll(`[data-y = '${this.inputOnFocus.y}']`)
      .forEach((input) => {
        input.classList.remove("input__highlight");
      });
    this.boardHtml
      .querySelectorAll(`[data-box = '${this.inputOnFocus.box}']`)
      .forEach((input) => {
        input.classList.remove("input__highlight");
      });
  }
  highlightEqualNumbers(number = this.inputOnFocus.value) {
    if (number != "") {
      this.boardHtml
        .querySelectorAll(`[data-lastkey = '${number}']`)
        .forEach((cell) => cell.classList.add("border__highlighted"));
    }
  }
  resetHighlightedEqualNumbers(number = this.inputOnBlur.value) {
    if (number != "") {
      this.boardHtml
        .querySelectorAll(`[data-lastkey = '${number}']`)
        .forEach((cell) => cell.classList.remove("border__highlighted"));
    }
  }
  // -------------------------
  setBoardInputsEvents() {
    this.boardHtml.querySelectorAll("input").forEach((input) => {
      this.inputOnFocus(input);
      this.inputOnBlur(input);
      this.inputOnKeyup(input);
    });
  }
  inputOnFocus(input) {
    input.addEventListener("focus", (event) => {

      const dataset = event.target.dataset;

      if(!JSON.parse(dataset.fetched) && !this.isMobile){
        event.target.readOnly = false
      }

      this.inputOnFocus = {
        x: dataset.x,
        y: dataset.y,
        value: dataset.lastkey,
        box: dataset.box,
      };

      this.highlight_x_y_box();
    });
  }
  inputOnBlur(input) {
    input.addEventListener("blur", (event) => {

      const dataset = event.target.dataset;

      event.target.readOnly = true

      this.inputOnBlur = {
        x: dataset.x,
        y: dataset.y,
        value: dataset.lastkey,
        box: dataset.box,
      };

      this.resetHighlighted_x_y_box();

      if (
        !JSON.parse(event.target.dataset.fetched) &&
        this.inputOnFocus.value != this.inputOnBlur.value
      ) {
        this.saveNewSolvedInputsOnLocalStorage("blur");
        this.saveHistoryOnLocalStorage();
      }
    });
  }
  inputOnKeyup(input) {
    input.addEventListener("keyup", (event) => {
      if (this.inputOnFocus.value != event.target.value) {
        this.resetHighlightedEqualNumbers(this.inputOnFocus.value);
      }
    });
  }
  saveNewSolvedInputsOnLocalStorage(event) {
    if (this.level) {
      
      let value = (event == "blur") ? this.inputOnBlur.value : this.lastNumberClicked

      let solvedInputs = {};
      if (localStorage.getItem(`${this.level}Solving`)) {
        solvedInputs = JSON.parse(localStorage.getItem(`${this.level}Solving`));
      }
      
      solvedInputs = {
        ...solvedInputs,
        [`${this.inputOnFocus.x}_${this.inputOnFocus.y}`]: parseInt(
          value
        ),
      };

      localStorage.setItem(
        `${this.level}Solving`,
        JSON.stringify(solvedInputs)
      );
    }
  }
  saveHistoryOnLocalStorage() {
    if (this.level) {
      let history = JSON.parse(localStorage.getItem(`${this.level}History`));

      history.push({
        x: this.inputOnFocus.x,
        y: this.inputOnFocus.y,
        value: this.inputOnFocus.value,
      });

      localStorage.setItem(`${this.level}History`, JSON.stringify(history));
    }
  }
  // -------------------------
  setBoardInputsRestrictions() {
    this.boardHtml.querySelectorAll("input").forEach((input) => {
      input.addEventListener("beforeinput", (event) => {
        const x = input.dataset.x;
        const y = input.dataset.y;
        const box = input.dataset.box;
        const lastkey = input.dataset.lastkey;
        const inputValue = event.data;

        if (this.isValidInput(event)) {
          if (event.target.value.length === 1) {
            event.preventDefault();
            input.value = inputValue;
          }

          this.resetHighlighted_x_y_box(x, y, box, lastkey);
          this.resetHighlightedEqualNumbers(lastkey);
          input.dataset.lastkey =
            this.validNumbers.indexOf(parseInt(inputValue)) >= 0
              ? inputValue
              : "";
          this.highlightEqualNumbers(inputValue);
          this.highlight_x_y_box(x, y, box, inputValue);
        } else {
          event.preventDefault();
        }
      });
    });
  }
  isValidInput(event) {
    return (
      this.validNumbers.indexOf(parseInt(event.data)) >= 0 ||
      event.inputType === "deleteContentBackward" ||
      event.inputType === "deleteContentForward"
    );
  }
  // -------------------------
  setNumbersBarEvents() {
    this.numbersBarHtml.querySelectorAll("button").forEach((button) => {
      this.numbersBarOnClick(button);

      button.addEventListener("focus", (event) => {
        this.highlightEqualNumbers(event.target.value);
      });

      button.addEventListener("blur", (event) => {
        this.resetHighlightedEqualNumbers(event.target.value);
      });
    });
  }
  numbersBarOnClick(button) {
    button.addEventListener("click", (event) => {
      const lastSelectedInput = this.lastClick[0];

      if (lastSelectedInput.dataset.x) {
        if (!JSON.parse(lastSelectedInput.dataset.fetched)) {
          lastSelectedInput.value = event.target.value;
          lastSelectedInput.dataset.lastkey = event.target.value;
          this.lastNumberClicked = event.target.value

          this.saveNewSolvedInputsOnLocalStorage("click");
          this.saveHistoryOnLocalStorage();
        }
      }
    });
  }
  // Called by scripts.js (selectLevel)
  fetchNewSudoku(level) {
    this.level = level;

    fetch(`https://sudoku-server.ammtsz.vercel.app/${this.level}`)
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        this.saveInputsOnLocalStorage(json);
        this.resetBoard();
        this.printSudoku(json, "fetched");
      });
  }
  saveInputsOnLocalStorage(fetchedArray) {
    localStorage.setItem(`${this.level}Original`, JSON.stringify(fetchedArray));
    localStorage.setItem(`${this.level}History`, JSON.stringify([]));
    localStorage.setItem(`${this.level}Solving`, JSON.stringify({}));
  }
  resetBoard() {
    this.boardHtml.reset();
    this.boardHtml.querySelectorAll("input").forEach((input) => {
      input.dataset.lastkey = "";
      input.dataset.fetched = false;
      input.classList.remove("input__error--border");
    });

    this.levelHtml.innerHTML = document.querySelector(
      `#btn-${this.level}`
    ).textContent;
    this.levelHtml.dataset.level = this.level;
  }
  printSudoku(fetchedArray, type) {
    fetchedArray.forEach(({ x, y, value }) => {
      const cell = this.boardHtml.querySelector(
        `[data-x = '${x}'][data-y = '${y}']`
      );
      cell.value = value;
      cell.dataset.fetched = type == "fetched"
      cell.dataset.lastkey = value;

    });
  }
  // Called by scripts.js (selectLevel)
  recoverGame(level) {
    this.level = level;
    const originalGameArray = this.recoverOriginalGame();
    this.resetBoard();
    this.printSudoku(originalGameArray, "fetched");
    const recoveredGameArray = this.recoveredGameObjectToArray();
    this.printSudoku(recoveredGameArray, "");
  }
  recoverOriginalGame() {
    return JSON.parse(localStorage.getItem(`${this.level}Original`));
  }
  recoveredGameObjectToArray() {
    const recoveredGame = JSON.parse(
      localStorage.getItem(`${this.level}Solving`)
    );

    let recoveredGameArray = [];
    Object.keys(recoveredGame).forEach((key) => {
      let x = parseInt(key.slice(0, 1));
      let y = parseInt(key.slice(2, 3));
      let value = recoveredGame[key];
      recoveredGameArray.push({ x, y, value });
    });
    return recoveredGameArray;
  }

  // Called by scripts.js (startOver)
  startLevelOver() {
    localStorage.setItem(`${this.level}Solving`, JSON.stringify({}));
    localStorage.setItem(`${this.level}History`, JSON.stringify([]));

    this.resetBoard();
    const originalGameArray = this.recoverOriginalGame();
    this.printSudoku(originalGameArray, "fetched");
  }
  // Called by scripts.js (undo)
  undo() {
    // getHistory
    let gameHistory = JSON.parse(localStorage.getItem(`${this.level}History`));

    if (gameHistory.length > 0) {
      // getLastMove
      let lastMove = gameHistory.pop();

      // printLastMoveUpdated
      let inputHtml = this.boardHtml.querySelector(
        `input[data-x = '${lastMove.x}'][data-y = '${lastMove.y}']`
      );
      inputHtml.value = lastMove.value;
      inputHtml.dataset.lastkey = lastMove.value;

      // updateLastMoveOnHistory
      localStorage.setItem(`${this.level}History`, JSON.stringify(gameHistory));

      // updateSolvingOnLocalStorage
      let solvedInputs = JSON.parse(
        localStorage.getItem(`${this.level}Solving`)
      );

      // updateLastInputOnSolving
      if (lastMove.value == "") {
        delete solvedInputs[`${lastMove.x}_${lastMove.y}`];
      } else {
        solvedInputs[`${lastMove.x}_${lastMove.y}`] = lastMove.value;
      }
      localStorage.setItem(
        `${this.level}Solving`,
        JSON.stringify(solvedInputs)
      );
    }
  }
  // Called by scripts.js (redo)
  // redo() {
  //   console.log("refazer");
  // }
}
