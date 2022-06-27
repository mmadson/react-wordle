import {Letter} from "./Letter";
import {CellStatus} from "./CellStatus";

export class Cell {
    private _letter: Letter | undefined;
    private _status: CellStatus | undefined;

    get letter(): Letter | undefined {
        return this._letter;
    }

    set letter(value: Letter | undefined) {
        this._letter = value;
    }

    get status(): CellStatus | undefined {
        return this._status;
    }

    set status(value: CellStatus | undefined) {
        this._status = value;
    }
}