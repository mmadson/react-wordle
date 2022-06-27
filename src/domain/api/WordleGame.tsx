import {Letter} from "./Letter";
import {Guess} from "./Guess";
import {CellStatus} from "./CellStatus";
import {GameStatus} from "./GameStatus";

export class WordleGame {
    guesses: readonly Guess[];

    private readonly _wotd: string;
    private _status: GameStatus;
    private _currentGuess: number;
    private _currentCell: number;

    constructor(wotd: string) {
        this._wotd = wotd;
        this._status = GameStatus.IN_PROGRESS;
        this.guesses = Object.freeze(Array(6).fill(undefined).map(_ => new Guess()));
        this._currentGuess = 0;
        this._currentCell = 0;
    }

    addLetterToCurrentGuess(letter: Letter) {
        if (this._status !== GameStatus.IN_PROGRESS) {
            throw new Error(this._status === GameStatus.PLAYER_WINS ? "You Win!" : this._wotd);
        }
        if (this._currentCell === 5) {
            throw new Error("Too many letters");
        }
        this.guesses[this._currentGuess].cells[this._currentCell].letter = letter;
        this.guesses[this._currentGuess].cells[this._currentCell].status = CellStatus.UNSUBMITTED;
        this._currentCell++;
    }

    removeLastLetterFromCurrentGuess() {
        if (this._status !== GameStatus.IN_PROGRESS) {
            throw new Error(this._status === GameStatus.PLAYER_WINS ? "You Win!" : this._wotd);
        }
        if(this._currentCell === 0) {
            throw new Error("No letters to delete")
        }
        this._currentCell--;
        this.guesses[this._currentGuess].cells[this._currentCell].letter = undefined;
        this.guesses[this._currentGuess].cells[this._currentCell].status = undefined;
    }

    submitCurrentGuess(): string | undefined {
        if (this._status !== GameStatus.IN_PROGRESS) {
            throw new Error(this._status === GameStatus.PLAYER_WINS ? "You Win!" : this._wotd);
        }
        if (this._currentCell < 5) {
            throw new Error("Not enough letters to submit");
        }

        for (let i = 0; i < 5; i++) {
            let guessedLetter: Letter = this.guesses[this._currentGuess].cells[i].letter as Letter;
            if (this._wotd[i] as Letter === guessedLetter) {
                this.guesses[this._currentGuess].cells[i].status = CellStatus.CORRECT;
            } else if (this._wotd.indexOf(Letter[guessedLetter]) !== -1) {
                this.guesses[this._currentGuess].cells[i].status = CellStatus.PARTIALLY_CORRECT;
            } else {
                this.guesses[this._currentGuess].cells[i].status = CellStatus.INCORRECT;
            }
        }

        let currentGuessIsIncorrect = this.guesses[this._currentGuess].cells.some(cell => cell.status !== CellStatus.CORRECT);
        if (currentGuessIsIncorrect) {
            this._status = this._currentGuess === 5 ? GameStatus.PLAYER_LOSES : GameStatus.IN_PROGRESS;
        } else {
            this._status = GameStatus.PLAYER_WINS;
        }

        this._currentCell = 0;
        this._currentGuess++;

        return this._status === GameStatus.PLAYER_LOSES ? this._wotd : undefined;
    }


    get status(): GameStatus {
        return this._status;
    }
}