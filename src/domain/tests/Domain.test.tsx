// Wordle is a single player guessing game where a user has 6 tries to guess a
// 5-letter "word of the day" and each incorrect guess reveals
// clues about the word of the day similar to game hangman

// Business Rules (functional requirements)

// a user can add a letter to the current guess
// - a letter is any character in the english alphabet from A-Z
// if the current guess has 5 letters, adding a letter should throw an error

// a user can remove the last letter from the current guess
// if the current guess does not have any letters, removing a letter should throw an error

// a user can submit the current guess which should annotate each of the letters of the current
// guess with a status as follows:
// - if the letter appears in the "word of the day" and is in the correct spot the letter should be marked green (fully correct)
// - if the letter appears in the "word of the day" but is not in the correct spot the letter should be marked yellow (partially correct)
// - if the letter does not appear in the "word of the day" the letter should be marked grey (incorrect)
// if the current guess is less than 5 letters long, submitting a guess should throw an error

// the game is over if the user either wins or loses the game where winning and losing is defined as follows:
// - the user wins the game if a submitted guess exactly matches the "word of the day"
// - the user loses the game if the user submits 6 incorrect guesses
// when the user loses the game, the hidden "word of the day" should be revealed to the user

// if the game is over, adding a letter to the current guess should throw an error
// if the game is over, removing a letter from the current guess should throw an error
// if the game is over, submitting the current guess should throw an error

// Code Guidelines (Non Functional Requirements)

// a user should only be able to modify the state of the game through the operations
// defined above, fields should be encapsulated accordingly

import {WordleGame} from "../api/WordleGame";
import {Letter} from "../api/Letter";
import {CellStatus} from "../api/CellStatus";
import {GameStatus} from "../api/GameStatus";

let _game: WordleGame;
let _wotd: string;
let _submitGuessResult: string;

function givenWordOfTheDayIs(wotd: string) {
    _wotd = wotd;
}

function whenCreateNewWordleGame() {
    _game = new WordleGame(_wotd);
}

function whenAddLetterToCurrentGuess(letter: Letter) {
    _game.addLetterToCurrentGuess(letter);
}

function whenRemoveLetterFromCurrentGuess() {
    _game.removeLastLetterFromCurrentGuess();
}

function whenSubmitCurrentGuess() {
    let result = _game.submitCurrentGuess();
    if(result !== undefined) {
        _submitGuessResult = result;
    }
}

function whenAddLettersToCurrentGuess(letters: string) {
    for (let letter = 0; letter < letters.length; letter++) {
        whenAddLetterToCurrentGuess(letters[letter] as Letter);
    }
}

function thenBoardShouldMatch(expectedGameBoard: string) {
    let expectedGuesses = expectedGameBoard.split("\n")
        .map(s => s.trim())
        .filter(s => s.length > 0);
    for (let guess = 0; guess < _game.guesses.length; guess++) {
        let expectedGuess = expectedGuesses[guess];
        for (let letter = 0; letter < _game.guesses[guess].cells.length; letter++) {
            let expectedLetter = expectedGuess[letter] === "_" ? undefined : expectedGuess[letter] as Letter;
            expect(_game.guesses[guess].cells[letter].letter).toBe(expectedLetter)
        }
    }
}

function thenGuessXShouldHaveAnnotations(guessRow: number, ...expectedStatuses: CellStatus[]) {
    for (let letter = 0; letter < _game.guesses[guessRow].cells.length; letter++) {
        expect(_game.guesses[guessRow].cells[letter].status).toBe(expectedStatuses[letter]);
    }
}

function thenGameStatusShouldMatch(expectedGameStatus: GameStatus) {
    expect(_game.status).toBe(expectedGameStatus);
}

function whenGuessesSubmitted(...guessesToSubmit: string[]) {
    for (const guessToSubmit of guessesToSubmit) {
        whenAddLettersToCurrentGuess(guessToSubmit);
        whenSubmitCurrentGuess();
    }
}

function thenRevealedWotdShouldBe(expectedRevealedWotd: string) {
    expect(_submitGuessResult).toBe(expectedRevealedWotd);
}

test('when new game created, game board initialized to 6 x 5 empty grid', () => {
    whenCreateNewWordleGame();
    thenBoardShouldMatch(`
       _____
       _____
       _____
       _____
       _____
       _____
    `);
});

test('a user can add a letter to the current guess', () => {

    whenCreateNewWordleGame();
    whenAddLetterToCurrentGuess(Letter.H);

    thenBoardShouldMatch(`
       H____
       _____
       _____
       _____
       _____
       _____
    `);
});

test('a user can add two letters to the current guess', () => {
    whenCreateNewWordleGame()
    whenAddLetterToCurrentGuess(Letter.H);
    whenAddLetterToCurrentGuess(Letter.E);

    thenBoardShouldMatch(`
       HE___
       _____
       _____
       _____
       _____
       _____
    `);
});

test('a user can remove a letter from the current guess', () => {
    whenCreateNewWordleGame();
    whenAddLetterToCurrentGuess(Letter.H);
    whenRemoveLetterFromCurrentGuess();

    thenBoardShouldMatch(`
       _____
       _____
       _____
       _____
       _____
       _____
    `);
});

test('a user can submit a 5 letter long guess', () => {
    givenWordOfTheDayIs("WWCSD");

    whenCreateNewWordleGame();
    whenAddLettersToCurrentGuess("WWCDE");
    whenSubmitCurrentGuess();

    thenBoardShouldMatch(`
       WWCDE
       _____
       _____
       _____
       _____
       _____
    `);
    thenGuessXShouldHaveAnnotations(
        0,
        CellStatus.CORRECT,
        CellStatus.CORRECT,
        CellStatus.CORRECT,
        CellStatus.PARTIALLY_CORRECT,
        CellStatus.INCORRECT,
    )
});



test('a user can win the game', () => {
    givenWordOfTheDayIs("WWCSD");

    whenCreateNewWordleGame();
    whenAddLettersToCurrentGuess("WWCSD");
    whenSubmitCurrentGuess();

    thenBoardShouldMatch(`
       WWCSD
       _____
       _____
       _____
       _____
       _____
    `);
    thenGuessXShouldHaveAnnotations(
        0,
        CellStatus.CORRECT,
        CellStatus.CORRECT,
        CellStatus.CORRECT,
        CellStatus.CORRECT,
        CellStatus.CORRECT,
    );
    thenGameStatusShouldMatch(GameStatus.PLAYER_WINS);
});

test('a user can lose the game', () => {
    givenWordOfTheDayIs("WWCSD");

    whenCreateNewWordleGame();
    whenGuessesSubmitted(
        "HELLO",
        "HELLO",
        "HELLO",
        "HELLO",
        "HELLO",
        "HELLO"
    )

    thenBoardShouldMatch(`
       HELLO
       HELLO
       HELLO
       HELLO
       HELLO
       HELLO
    `);
    thenGuessXShouldHaveAnnotations(
        0,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
    );
    thenGuessXShouldHaveAnnotations(
        1,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
    );
    thenGuessXShouldHaveAnnotations(
        2,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
    );
    thenGuessXShouldHaveAnnotations(
        3,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
    );
    thenGuessXShouldHaveAnnotations(
        4,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
    );
    thenGuessXShouldHaveAnnotations(
        5,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
        CellStatus.INCORRECT,
    );
    thenGameStatusShouldMatch(GameStatus.PLAYER_LOSES);
    thenRevealedWotdShouldBe("WWCSD");
})



