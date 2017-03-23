import { CellValue } from '../cell/cell.value';
import { Cell } from '../cell/cell';
import { NUMBER_OF_COLUMNS, NUMBER_OF_ROWS } from './board.component';

export class Board{

    public numberOfMovesPlayed = 0;
    public board: Cell[][] = [];

    constructor() {
        this.initializeCellValues();
        this.numberOfMovesPlayed = 0;
    }

    private initializeCellValues(): void {
        for (let i = 0; i < NUMBER_OF_ROWS; i++) {
            let row: Cell[] = [];
            for (let j = 0; j < NUMBER_OF_COLUMNS; j++) {
                let cell = new Cell(i, j);
                cell.setValue(CellValue.Empty);
                row.push(cell);
            }
            this.board.push(row);
        }
    }
}