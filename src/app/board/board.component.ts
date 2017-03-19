import { Component, Directive } from '@angular/core';
import { Cell } from '../cell/cell';
import { CellValue } from '../cell/cell.value';
import { CellComponent } from '../cell/cell.component';
import { TurnService } from '../turn_service/turn.service';
import { GameService } from '../game_service/game.service';

export const NUMBER_OF_COLUMNS: number = 7;
export const NUMBER_OF_ROWS: number = 6;
export class ReturnCell{
    cell: Cell;
    score: number;
}
@Component({
    selector: 'board',
    styleUrls: [`./app/board/board.component.css`],
    templateUrl: `./app/board/board.component.html`,
})
export class BoardComponent {

    private initialScores: number[] = [-2, -1, 0, 1, 0, -1, 2];

    public board: Cell[][] = [];
    private botBoard: Cell[][] = [];
    private isGameOver: boolean = false;
    private winner: CellValue;
    private gameService: GameService;
    private numberOfMovesPlayed: number = 0;
    private numberOfMovesPlayedOnBotBoard: number = 0;
    public returnCell: ReturnCell;

    constructor(private turnService: TurnService) {
        this.gameService = new GameService();
    }

    ngOnInit() {
        this.initializeCellValues();
    }

    public playMove(board: Cell[][], moveSelectedInColumnNumber: number): void {
        if (this.isGameOver)
            return;
        let cell = this.getFirstEmptyCellInColumn(board, moveSelectedInColumnNumber);
        if (this.isCellAvailable(cell)) {
            let currentPlayer = this.turnService.whoIsPlaying();
            this.captureCell(cell, currentPlayer);
        }
    }

    public botMove(): void{
        this.resetBotBoard();
        let playerToPlayNext = this.turnService.whoIsPlaying();
        let alpha = -NUMBER_OF_ROWS*NUMBER_OF_COLUMNS/2;
        let beta = NUMBER_OF_ROWS*NUMBER_OF_COLUMNS/2
        this.returnCell = this.getScore(alpha, beta);
        if(this.turnService.whoIsPlaying()!==playerToPlayNext){
            this.turnService.turnComplete(this.turnService.whoIsPlaying());
        }
        
    }

    public restartGame(): void {
        this.board = [];
        this.botBoard = [];
        this.initializeCellValues();
        this.gameService = new GameService();
        this.winner = null;
        this.isGameOver = false;
    }

    private isCellAvailable(cell: Cell): boolean {
        return cell ? cell.isEmpty() : false;
    }

    private captureCell(cell: Cell, player: CellValue): void {
        cell.setValue(player);
        this.movePlayedByPlayer(player);
        this.declareWinnerIfGameOver(player);
    }

    private movePlayedByPlayer(player: CellValue): void {
        this.turnService.turnComplete(player);
        this.numberOfMovesPlayed++;
        this.numberOfMovesPlayedOnBotBoard++;
    }

    private declareWinnerIfGameOver(player: CellValue): void {
        if (this.gameService.isGameOver(this.board)) {
            this.isGameOver = true;
            this.winner = player;
        }
    }

    private getFirstEmptyCellInColumn(board: Cell[][], columnNumber: number): Cell {
        for (let i = NUMBER_OF_ROWS - 1; i >= 0; i--) {
            let cell = board[i][columnNumber];
            if (cell.isEmpty())
                return cell;
        }
        return null;
    }

    private initializeCellValues(): void {
        for (let i = 0; i < NUMBER_OF_ROWS; i++) {
            let row: Cell[] = [];
            let botRow: Cell[] = [];
            for (let j = 0; j < NUMBER_OF_COLUMNS; j++) {
                let cell = new Cell(i, j);
                let botCell = new Cell(i, j);
                cell.setValue(CellValue.Empty);
                botCell.setValue(CellValue.Empty);
                row.push(cell);
                botRow.push(botCell);
            }
            this.board.push(row);
            this.botBoard.push(botRow);
        }
    }

    private resetBotBoard(): void {
        this.returnCell = null;
        this.botBoard = [];
        for (let i = 0; i < NUMBER_OF_ROWS; i++) {
            let row: Cell[] = [];
            for (let j = 0; j < NUMBER_OF_COLUMNS; j++) {
                let cell = new Cell(i, j);
                cell.setValue(this.board[i][j].getValue());
                row.push(cell);
            }
            this.botBoard.push(row);
        }
    }

    private getScore(alpha: number, beta: number): ReturnCell {
        
        if (this.numberOfMovesPlayedOnBotBoard == NUMBER_OF_ROWS * NUMBER_OF_COLUMNS){
            return {cell:null, score: 0};
        }
        
        for (let i = 0; i < NUMBER_OF_COLUMNS; i++) {
            let cell = this.getFirstEmptyCellInColumn(this.botBoard, i);

            if (this.isCellAvailable(cell)) {
                let player = this.turnService.whoIsPlaying();
                cell.setValue(player);
                this.numberOfMovesPlayedOnBotBoard++;
                let isGameOver = this.gameService.isGameOver(this.botBoard);
                if (isGameOver){
                    let returnCellScore = {cell:cell, score: (NUMBER_OF_ROWS * NUMBER_OF_COLUMNS + 1 - (this.numberOfMovesPlayedOnBotBoard + 1)) / 2};
                    return returnCellScore;
                }
                else{
                    cell.setValue(CellValue.Empty);
                    this.numberOfMovesPlayedOnBotBoard--;
                }
            }
        }
        let max = (NUMBER_OF_ROWS * NUMBER_OF_COLUMNS - 1 - (this.numberOfMovesPlayedOnBotBoard)) / 2;
        if (beta > max) {
            beta = max;
            if (alpha >= beta)
                return {cell: null,score:beta};
        }
        let returnCell: Cell;
        for (let i = 0; i < NUMBER_OF_COLUMNS; i++) {
            let cell = this.getFirstEmptyCellInColumn(this.botBoard, i);
            if (this.isCellAvailable(cell)) {
                let nextPlayer = this.turnService.whoIsPlaying();
                cell.setValue(nextPlayer);
                this.numberOfMovesPlayedOnBotBoard++;
                this.turnService.turnComplete(nextPlayer);
                let score = -this.getScore(-beta, -alpha).score;
                if (score >= beta)
                    return {cell: cell, score:beta};
                if (score > alpha){
                    alpha = score;
                    returnCell = cell;
                }
            }
        }
        let a= 5;
        return {cell: returnCell, score: alpha};

    }
}
