import React from "react";
import {WordleGame} from "./domain/api/WordleGame";
import {Guess} from "./domain/api/Guess";
import {Letter} from "./domain/api/Letter";
import {CellStatus} from "./domain/api/CellStatus";
import "./GameBoard.css"
import {GameStatus} from "./domain/api/GameStatus";

type GameBoardProps = {}

type GameBoardState = {
    game: WordleGame | undefined
    message: string | undefined
}

class Cell extends React.Component<{ letter: Letter | undefined, status: CellStatus | undefined }> {
    render() {
        return <div className={"cell-" + this.props.status}>
            {this.props.letter === undefined ? "_" : Letter[this.props.letter as Letter]}
        </div>;
    }
}

class GuessRow extends React.Component<{ guess: Guess }> {
    render() {
        return (
            <div className="guess-row">
                {this.props.guess.cells.map((cell, i) => <Cell letter={cell.letter} status={cell.status} key={i}/>)}
            </div>
        );
    }
}

enum ControlCharacter {
    BACKSPACE = "BACKSPACE",
    ENTER = "ENTER"
}

type KeyboardCharacter = Letter | ControlCharacter;

const keyboard: KeyboardCharacter[][] = [
    [Letter.Q, Letter.W, Letter.E, Letter.R, Letter.T, Letter.Y, Letter.U, Letter.I, Letter.O, Letter.P],
    [Letter.A, Letter.S, Letter.D, Letter.F, Letter.G, Letter.H, Letter.J, Letter.K, Letter.L],
    [ControlCharacter.ENTER, Letter.Z, Letter.X, Letter.C, Letter.V, Letter.B, Letter.N, Letter.M, ControlCharacter.BACKSPACE],
]

class KeyboardButton extends React.Component<{ notifyBtnClicked: () => void; character: KeyboardCharacter }> {

    render() {
        return <div className="keyboard-btn" onClick={() => this.onClick()}>{this.props.character}</div>;
    }

    onClick() {
        this.props.notifyBtnClicked();
    }
}

export class GameBoard extends React.Component<GameBoardProps, GameBoardState> {
    state: GameBoardState = {
        game: undefined,
        message: undefined
    }

    constructor(props: GameBoardProps, context: any) {
        super(props, context);
        this._handleKeyDown = this._handleKeyDown.bind(this);
    }

    componentDidMount() {
        this.setState({
            game: new WordleGame("WWCSD")
        });
        document.addEventListener("keydown", this._handleKeyDown, false);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this._handleKeyDown);
    }

    render() {
        return (
            <div className="game">
                <div className="message">{this.state.message}</div>
                <div className="guesses">
                    {this.state.game?.guesses.map((guess, i) => <GuessRow guess={guess} key={i}/>)}
                </div>
                <div className="keyboard">
                    {keyboard.map((keyboardRow, i) => {
                        return <div className="keyboard-row" key={i}>
                            {keyboardRow.map((key, j) => <KeyboardButton
                                notifyBtnClicked={() => this.buttonClicked(key)}
                                character={key}
                                key={j}/>)}
                        </div>
                    })}
                </div>
            </div>
        );
    }

    buttonClicked(key: KeyboardCharacter) {
        this.handleKeyEntry(key);
    }

    _handleKeyDown(event: KeyboardEvent): any {
        this.handleKeyEntry(event.key.toUpperCase() as KeyboardCharacter);
    }

    private handleKeyEntry(key: KeyboardCharacter) {
        this.state.message = "";
        try {
            switch (key) {
                case ControlCharacter.BACKSPACE:
                    this.state.game?.removeLastLetterFromCurrentGuess();
                    break;
                case ControlCharacter.ENTER:
                    this.state.message = this.state.game?.submitCurrentGuess();
                    if (this.state.game?.status === GameStatus.PLAYER_WINS) {
                        this.state.message = "You Win!";
                    }
                    break;
                default:
                    if (/^[A-Z]$/.test(Letter[key])) {
                        this.state.game?.addLetterToCurrentGuess(key as Letter);
                    }
            }
        } catch (e) {
            this.state.message = (e as Error).message;
        }
        this.setState(this.state);
    }
}
