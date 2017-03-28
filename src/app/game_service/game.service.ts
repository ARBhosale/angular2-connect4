import { Injectable } from '@angular/core';
import { Cell } from '../cell/cell';
import { CellValue } from '../cell/cell.value';
import { BoardComponent, NUMBER_OF_ROWS, NUMBER_OF_COLUMNS } from '../board/board.component';

export const LENGTHOFCONNECTION = 4;
@Injectable()
export class GameService {

    constructor() {
    }

    public isGameOver(board: Cell[][]): boolean {
        return this.checkVerticalConnection(board, LENGTHOFCONNECTION) || this.checkHorizontalConnection(board, LENGTHOFCONNECTION) || this.checkDiagonalConnection(board, LENGTHOFCONNECTION);
    }

    public isOneConnectionLeft(board: Cell[][]): boolean {
        return this.checkVerticalConnection(board, LENGTHOFCONNECTION - 1) 
        || this.checkHorizontalConnection(board, LENGTHOFCONNECTION - 1)
        || this.checkDiagonalConnection(board, LENGTHOFCONNECTION - 1);
    }

    private checkDiagonalConnection(board: Cell[][], lengthOfConnection: number): boolean {
        for (let i = 0; i + lengthOfConnection - 1 < NUMBER_OF_ROWS; i++) {
            for (let j = 0; j + lengthOfConnection - 1 < NUMBER_OF_COLUMNS; j++) {
                let firstCellValue = board[i][j].getValue();
                if (firstCellValue === CellValue.Empty)
                    continue;
                let k = 1;
                for(k = 1; k< lengthOfConnection; k++){
                    let cellValue = board[i + k][j + k].getValue();
                    if(firstCellValue !== cellValue){
                        break;
                    }
                }
                if (k == lengthOfConnection)
                    return true;
            }
        }
        for (let i = NUMBER_OF_ROWS - 1; i - (lengthOfConnection - 1) >= 0; i--) {
            for (let j = 0; j + (lengthOfConnection - 1) < NUMBER_OF_COLUMNS; j++) {
                let firstCellValue = board[i][j].getValue();
                if (firstCellValue === CellValue.Empty)
                    continue;
                let k = 1;
                for(k = 1; k< lengthOfConnection; k++){
                    let cellValue = board[i - k][j + k].getValue();
                    if(firstCellValue !== cellValue){
                        break;
                    }
                }
                if (k == lengthOfConnection)
                    return true;
            }
        }
        return false;
    }

    private checkVerticalConnection(board: Cell[][], lengthOfConnection: number): boolean {
        for (let i = NUMBER_OF_ROWS - 1; i - (lengthOfConnection - 1) >= 0; i--) {
            for (let j = 0; j < NUMBER_OF_COLUMNS; j++) {
                let firstCellValue = board[i][j].getValue();
                if (firstCellValue === CellValue.Empty)
                    continue;
                let k = 1;
                for(k = 1; k< lengthOfConnection; k++){
                    let cellValue = board[i - k][j].getValue();
                    if(firstCellValue !== cellValue){
                        break;
                    }
                }
                if (k == lengthOfConnection)
                    return true;
            }
        }
        return false;
    }

    private checkHorizontalConnection(board: Cell[][], lengthOfConnection: number): boolean {
        for (let i = NUMBER_OF_ROWS - 1; i >= 0; i--) {
            for (let j = 0; j + (lengthOfConnection - 1) < NUMBER_OF_COLUMNS; j++) {
                let firstCellValue = board[i][j].getValue();
                if (firstCellValue === CellValue.Empty)
                    continue;
                let k = 1;
                for(k = 1; k< lengthOfConnection; k++){
                    let cellValue = board[i][j+k].getValue();
                    if(firstCellValue !== cellValue){
                        break;
                    }
                }
                if (k == lengthOfConnection)
                    return true;
            }
        }
        return false;
    }

}