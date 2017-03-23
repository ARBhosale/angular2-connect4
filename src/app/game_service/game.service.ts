import { Injectable } from '@angular/core';
import { Cell } from '../cell/cell';
import { CellValue } from '../cell/cell.value';
import { BoardComponent, NUMBER_OF_ROWS, NUMBER_OF_COLUMNS } from '../board/board.component';

export const LENGTHOFCONNECTION = 3;
@Injectable()
export class GameService {

    constructor() {
    }

    public isGameOver(board: Cell[][]): boolean {
        return this.checkVerticalConnection(board) || this.checkHorizontalConnection(board) || this.checkDiagonalConnection(board);
    }

    private checkDiagonalConnection(board: Cell[][]): boolean {
        for (let i = 0; i + LENGTHOFCONNECTION - 1 < NUMBER_OF_ROWS; i++) {
            for (let j = 0; j + LENGTHOFCONNECTION - 1 < NUMBER_OF_COLUMNS; j++) {
                let firstCellValue = board[i][j].getValue();
                if (firstCellValue === CellValue.Empty)
                    continue;
                let k = 1;
                for(k = 1; k< LENGTHOFCONNECTION; k++){
                    let cellValue = board[i + k][j + k].getValue();
                    if(firstCellValue !== cellValue){
                        break;
                    }
                }
                if (k == LENGTHOFCONNECTION)
                    return true;
            }
        }
        for (let i = NUMBER_OF_ROWS - 1; i - (LENGTHOFCONNECTION - 1) >= 0; i--) {
            for (let j = 0; j + (LENGTHOFCONNECTION - 1) < NUMBER_OF_COLUMNS; j++) {
                let firstCellValue = board[i][j].getValue();
                if (firstCellValue === CellValue.Empty)
                    continue;
                let k = 1;
                for(k = 1; k< LENGTHOFCONNECTION; k++){
                    let cellValue = board[i - k][j + k].getValue();
                    if(firstCellValue !== cellValue){
                        break;
                    }
                }
                if (k == LENGTHOFCONNECTION)
                    return true;
            }
        }
        return false;
    }

    private checkVerticalConnection(board: Cell[][]): boolean {
        for (let i = NUMBER_OF_ROWS - 1; i - (LENGTHOFCONNECTION - 1) >= 0; i--) {
            for (let j = 0; j < NUMBER_OF_COLUMNS; j++) {
                let firstCellValue = board[i][j].getValue();
                if (firstCellValue === CellValue.Empty)
                    continue;
                let k = 1;
                for(k = 1; k< LENGTHOFCONNECTION; k++){
                    let cellValue = board[i - k][j].getValue();
                    if(firstCellValue !== cellValue){
                        break;
                    }
                }
                if (k == LENGTHOFCONNECTION)
                    return true;
            }
        }
        return false;
    }

    private checkHorizontalConnection(board: Cell[][]): boolean {
        for (let i = NUMBER_OF_ROWS - 1; i >= 0; i--) {
            for (let j = 0; j + (LENGTHOFCONNECTION - 1) < NUMBER_OF_COLUMNS; j++) {
                let firstCellValue = board[i][j].getValue();
                if (firstCellValue === CellValue.Empty)
                    continue;
                let k = 1;
                for(k = 1; k< LENGTHOFCONNECTION; k++){
                    let cellValue = board[i][j+k].getValue();
                    if(firstCellValue !== cellValue){
                        break;
                    }
                }
                if (k == LENGTHOFCONNECTION)
                    return true;
            }
        }
        return false;
    }

}