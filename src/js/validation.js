class Validation {
  constructor(completedGameModal) {
    this.completedGameModal = completedGameModal
    this.board = document.querySelector("#board");
    this.validNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.inputValues = [];
    this.countingOccurrences = {};
    this.eventListeners();
  }

  eventListeners() {
    this.board.querySelectorAll("input").forEach((input) => {
      input.addEventListener("keyup", () =>
        this.actionsAfterBoardUpdate(input)
      );
      input.addEventListener("blur", () =>
        this.actionsAfterBoardUpdate(input)
      );
    });
    document.querySelectorAll("#numbers-bar button").forEach((button) => {
      button.addEventListener("click", () =>
        this.actionsAfterBoardUpdate(button)
      );
    });
  }
  actionsAfterBoardUpdate(input) {
    this.getAllInputsValue();
    this.getTimesEachNumberHasBeenUsed();
    this.setActionsBasedOnNumberOccurrences();
    this.checkGroupsRepetitions(input);
    this.checkIfBoardIsCompleted();
  }
  getAllInputsValue() {
    let inputValues = [];
    this.board.querySelectorAll("input").forEach((input) => {
      if (input.value) inputValues.push(parseInt(input.value));

      // remove repeated numbers class
      input.classList.remove("input__error--border")
      
    });
    this.inputValues = inputValues;
  }
  getTimesEachNumberHasBeenUsed() {
    this.validNumbers.forEach((number) => {
      if (number != "") {
        this.countingOccurrences[number] = this.inputValues.filter(
          (inputValue) => inputValue == number
        ).length;
      }
    });
  }
  setActionsBasedOnNumberOccurrences() {
    Object.keys(this.countingOccurrences).forEach((key) => {
      // disableOnNineOccurrences
      document.querySelector(`#numbers-bar button[value="${key}"]`).disabled =
        this.countingOccurrences[key] >= 9;

      // errorOnPlusNineOccurrences
      this.moreThanNineOccurrencesError(key);
    });
  }
  moreThanNineOccurrencesError(number) {
    this.board.querySelectorAll("input").forEach((input) => {
      if (input.value == number) {
        this.countingOccurrences[number] > 9
          ? input.classList.add("input__error--text")
          : input.classList.remove("input__error--text");
      }
    });
  }
  checkGroupsRepetitions(){
    ["x", "y", "box"].forEach(group => {
      this.validNumbers.forEach(number => {
        this.lookForRepetitionsInASpecificGroup(group, number - 1)
      })
    })
  }
  lookForRepetitionsInASpecificGroup(group, groupId) {
      let usedNumbersInfos = [];
      usedNumbersInfos = this.getGroupInputValues(group, groupId)
      const repeatedNumbers = this.lookForRepeatedNumbers(usedNumbersInfos)

      this.addClassOnInputsWithRepeatedNumbers(repeatedNumbers, usedNumbersInfos)
      
      return !repeatedNumbers.length > 0
  }

  getGroupInputValues(group, groupId){
    let usedNumbersInfos = [];
    this.board.querySelectorAll(`[data-${group} = '${groupId}']`).forEach((input) => {
      if (input.value != "") {
        usedNumbersInfos.push({
          x: input.dataset.x,
          y: input.dataset.y,
          box: input.dataset.box,
          value: input.value,
        });
      }
    });
    return usedNumbersInfos
  }
  lookForRepeatedNumbers(usedNumbersInfos){
    return usedNumbersInfos
        .sort((num1, num2) => (num1.value < num2.value ? -1 : 1))
        .filter(
          (numInfos, index) =>
            numInfos.value ==
            (index > 0 ? usedNumbersInfos[index - 1].value : 0)
        );
  }
  addClassOnInputsWithRepeatedNumbers(repeatedNumbers, usedNumbersInfos){
    // get inputs with repeated numbers
    repeatedNumbers.forEach((repeatedNumber) => {
      usedNumbersInfos
        .filter(
          (usedNumberInfos) => usedNumberInfos.value == repeatedNumber.value
        )
        // add class to inputs with repeated numbers to highlight errors
      .forEach((input) =>
        this.board
          .querySelector(`[data-x = '${input.x}'][data-y = '${input.y}']`)
          .classList.add("input__error--border")
      );
    });
  }

  checkIfBoardIsCompleted() {
    if (this.inputValues.length == 81) {
      this.checkFinalAnswer();
    }
  }
  checkFinalAnswer() {
    let numbers = this.checkNineOccurrencesForEachNumber();
    
    const x = this.checkRepetitionsInEachGroup("x");
    const y = this.checkRepetitionsInEachGroup("y");
    const box = this.checkRepetitionsInEachGroup("box");

    if(
      numbers &&
      x.right.length === 9 &&
      y.right.length === 9 &&
      box.right.length === 9
    ) this.gameCompletedActions()
  }
  checkNineOccurrencesForEachNumber() {
    let checker = [];
    Object.keys(this.countingOccurrences).forEach((number) => {
      checker.push(this.countingOccurrences[number] == 9);
    });
    return checker.indexOf(false) == -1;
  }
  checkRepetitionsInEachGroup(group){
    let right = [];
    let wrong = [];

    this.validNumbers.forEach(number => {
      let groupNumber = `${group}-${number - 1}`
      this.lookForRepetitionsInASpecificGroup(group, number - 1) 
        ? right.push(groupNumber) 
        : wrong.push(groupNumber)
    })

    return {right, wrong}
  }
  gameCompletedActions() {
    this.completedGameModal.show();
    this.updateGameProgress(false);
  }
  updateGameProgress(status) {
    const currentLevel = document.querySelector("#modal-level").dataset.level;

    let gameProgress = JSON.parse(localStorage.getItem("gameProgress"));

    gameProgress[currentLevel] = status;

    localStorage.setItem("gameProgress", JSON.stringify(gameProgress));
  }
}
