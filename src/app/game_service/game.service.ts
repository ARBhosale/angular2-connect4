import { Injectable } from '@angular/core';
import { Cell } from '../cell/cell';
import { CellValue } from '../cell/cell.value';
import { BoardComponent, NUMBER_OF_ROWS, NUMBER_OF_COLUMNS } from '../board/board.component';

@Injectable()
export class GameService {

    constructor() {
    }

    public isGameOver(board: Cell[][]): boolean {
        return this.checkVerticalConnection(board) || this.checkHorizontalConnection(board) || this.checkDiagonalConnection(board);
    }

    private checkDiagonalConnection(board: Cell[][]): boolean {
        for (let i = 0; i + 3 < NUMBER_OF_ROWS; i++) {
            for (let j = 0; j + 3 < NUMBER_OF_COLUMNS; j++) {
                let firstCellValue = board[i][j].getValue();
                if (firstCellValue === CellValue.Empty)
                    continue;

                let secondCellValue = board[i + 1][j + 1].getValue();
                let thirdCellValue = board[i + 2][j + 2].getValue();
                let fourthCellValue = board[i + 3][j + 3].getValue();

                if ((firstCellValue == secondCellValue) && (secondCellValue == thirdCellValue) && (thirdCellValue == fourthCellValue))
                    return true;
            }
        }
        for (let i = NUMBER_OF_ROWS - 1; i - 3 >= 0; i--) {
            for (let j = 0; j + 3 < NUMBER_OF_COLUMNS; j++) {
                let firstCellValue = board[i][j].getValue();
                if (firstCellValue === CellValue.Empty)
                    continue;

                let secondCellValue = board[i - 1][j + 1].getValue();
                let thirdCellValue = board[i - 2][j + 2].getValue();
                let fourthCellValue = board[i - 3][j + 3].getValue();

                if ((firstCellValue == secondCellValue) && (secondCellValue == thirdCellValue) && (thirdCellValue == fourthCellValue))
                    return true;
            }
        }
        return false;
    }

    private checkVerticalConnection(board: Cell[][]): boolean {
        for (let i = NUMBER_OF_ROWS - 1; i - 3 >= 0; i--) {
            for (let j = 0; j < NUMBER_OF_COLUMNS; j++) {
                let firstCellValue = board[i][j].getValue();
                if (firstCellValue === CellValue.Empty)
                    continue;

                let secondCellValue = board[i - 1][j].getValue();
                let thirdCellValue = board[i - 2][j].getValue();
                let fourthCellValue = board[i - 3][j].getValue();

                if ((firstCellValue == secondCellValue) && (secondCellValue == thirdCellValue) && (thirdCellValue == fourthCellValue))
                    return true;
            }
        }
        return false;
    }

    private checkHorizontalConnection(board: Cell[][]): boolean {
        for (let i = NUMBER_OF_ROWS - 1; i >= 0; i--) {
            for (let j = 0; j + 3 < NUMBER_OF_COLUMNS; j++) {
                let firstCellValue = board[i][j].getValue();
                if (firstCellValue === CellValue.Empty)
                    continue;

                let secondCellValue = board[i][j + 1].getValue();
                let thirdCellValue = board[i][j + 2].getValue();
                let fourthCellValue = board[i][j + 3].getValue();

                if ((firstCellValue == secondCellValue) && (secondCellValue == thirdCellValue) && (thirdCellValue == fourthCellValue))
                    return true;
            }
        }
        return false;
    }

}