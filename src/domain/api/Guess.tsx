import {Cell} from "./Cell";

export class Guess {
    cells: readonly Cell[];

    constructor() {
        this.cells = Array(5).fill(undefined).map(_ => new Cell());
    }
}