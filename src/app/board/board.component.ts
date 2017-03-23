import { Component, Directive } from '@angular/core';
import { Cell } from '../cell/cell';
import { CellValue } from '../cell/cell.value';
import { CellComponent } from '../cell/cell.component';
import { TurnService } from '../turn_service/turn.service';
import { GameService } from '../game_service/game.service';
import { Board } from './board';

export const NUMBER_OF_COLUMNS: number = 3;
export const NUMBER_OF_ROWS: number = 3;
export class ReturnCell {
    cell: Cell;
    score: number;
}
@Component({
    selector: 'board',
    styleUrls: [`./app/board/board.component.css`],
    templateUrl: `./app/board/board.component.html`,
})
export class BoardComponent {
    static depth = 3;
    private initialScoresForAIFirst: number[] = [-2, -1, 0, 1, 0, -1, 2];
    private initialScoresForAISecond: number[][] = [
        [-1, 2, 1, 2, -1, 1, -2],
        [-2, 0, 1, 0, -2, -2, -3],
        [-2, -2, 0, 0, 0, 0, -3],
        [-4, -2, -2, -1, -2, -2, -4],
        [-3, 0, 0, 0, 0, -2, -2],
        [-3, -2, -2, 0, 1, 0, -2],
        [-2, 1, -1, 2, 1, 2, -1]
    ];

    public board: Cell[][] = [];
    private botBoard: Board;
    private isGameOver: boolean = false;
    private winner: CellValue;
    private gameService: GameService;
    private numberOfMovesPlayed: number = 0;
    private numberOfMovesPlayedOnBotBoard: number = 0;
    public returnCell: Cell;
    public score: string;
    private moveScores: number[];
    public columnToSuggest: number;
    private lastCellCaptured: Cell;

    constructor(private turnService: TurnService) {
        this.gameService = new GameService();
        this.botBoard = new Board();
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

    public undoMove(): void {
        let currentPlayer = this.turnService.whoIsPlaying();
        this.turnService.turnComplete(currentPlayer);
        this.lastCellCaptured.setValue(CellValue.Empty);
        this.numberOfMovesPlayed--;
        this.numberOfMovesPlayedOnBotBoard--;
    }

    public botMove(): void {
        this.resetBotBoard();
        // let playerToPlayNext = this.turnService.whoIsPlaying();
        // let alpha = -NUMBER_OF_ROWS * NUMBER_OF_COLUMNS / 2;
        // let beta = NUMBER_OF_ROWS * NUMBER_OF_COLUMNS / 2
        // this.score = this.getScore(alpha, beta);
        // if (this.turnService.whoIsPlaying() !== playerToPlayNext) {
        //     this.turnService.turnComplete(this.turnService.whoIsPlaying());
        // }
        let currentPlayer = this.turnService.whoIsPlaying();
        this.getScores(this.turnService.getOtherPlayer(currentPlayer), this.botBoard);
        this.score = this.moveScores.join(',');
        let minScore = this.getMin(this.moveScores);
        let columnIndexOrder = this.moveScores.indexOf(minScore);
        let emptyColumnsFound = 0;
        for(let i = 0; i< NUMBER_OF_COLUMNS; i++){
            let topCell = this.getFirstEmptyCellInColumn(this.board, i);
            if(topCell){
                if(emptyColumnsFound == columnIndexOrder){
                    this.playMove(this.board, i);
                    break;
                }
                emptyColumnsFound++
            }
        }
    }

    public restartGame(): void {
        this.board = [];
        this.botBoard = new Board();
        this.initializeCellValues();
        this.gameService = new GameService();
        this.winner = null;
        this.isGameOver = false;
    }

    private getMin(scores: number[]): number {
        let min = NUMBER_OF_ROWS*NUMBER_OF_COLUMNS;
        for(let i=0; i< scores.length; i++) {
            if(scores[i]<=min)
                min = scores[i];
        }
        return min;
    }

    private getMax(scores: number[]): number {
        let max = -NUMBER_OF_ROWS*NUMBER_OF_COLUMNS;
        for(let i=0; i< scores.length; i++) {
            if(scores[i]>=max)
                max = scores[i];
        }
        return max;
    }

    private getScores(player: CellValue, board: Board): number {
        if (this.isGameDraw(board.board)) {
            return 0;
        }
        if (this.gameService.isGameOver(board.board)) {
            return NUMBER_OF_ROWS * NUMBER_OF_COLUMNS - board.numberOfMovesPlayed;
        }
        let nextMoveCells = this.getNextMoveCells(board);
        let moveScores: number[] = [];
        let moveScore = 0;
        for (let possibleMove = 0; possibleMove < nextMoveCells.length; possibleMove++) {
            let moveCellRow = nextMoveCells[possibleMove].rowNumber;
            let moveCellColumn = nextMoveCells[possibleMove].columnNumber;
            let currentPlayer = player;
            let moveBoard = this.getCopyOfBoard(board);
            let moveCell = moveBoard.board[moveCellRow][moveCellColumn];
            moveCell.setValue(currentPlayer);
            moveBoard.numberOfMovesPlayed++;
            let nextPlayer = this.turnService.getOtherPlayer(currentPlayer);
            moveScore = -this.getScores(nextPlayer, moveBoard);
            moveScores[possibleMove] = moveScore;
        }
        this.moveScores = moveScores;
        
        return moveScore;
    }

    private getCopyOfBoard(board: Board): Board {
        let copy = new Board();
        copy.board = [];
        for (let i = 0; i < NUMBER_OF_ROWS; i++) {
            let row: Cell[] = [];
            for (let j = 0; j < NUMBER_OF_COLUMNS; j++) {
                let cell = new Cell(i, j);
                cell.setValue(board.board[i][j].getValue());
                row.push(cell);
            }
            copy.board.push(row);
        }
        copy.numberOfMovesPlayed = board.numberOfMovesPlayed;
        return copy;
    }

    private getNumberOfMovesPlayed(board: Cell[][]): number {
        return board == this.board ? this.numberOfMovesPlayed : this.numberOfMovesPlayedOnBotBoard;
    }

    private isGameDraw(board: Cell[][]): boolean {
        let numberOfMovesPlayed = this.getNumberOfMovesPlayed(board);
        return NUMBER_OF_ROWS * NUMBER_OF_COLUMNS === numberOfMovesPlayed;

    }

    private getNextMoveCells(board: Board): Cell[] {
        let nextMoveCells: Cell[] = [];
        for (let i = 0; i < NUMBER_OF_COLUMNS; i++) {
            let cell = this.getFirstEmptyCellInColumn(board.board, i);
            if(cell)
                nextMoveCells.push(cell);
        }
        return nextMoveCells;
    }

    private isCellAvailable(cell: Cell): boolean {
        return cell ? cell.isEmpty() : false;
    }

    private captureCell(cell: Cell, player: CellValue): void {
        cell.setValue(player);
        this.lastCellCaptured = cell;
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
            this.botBoard.board.push(botRow);
        }
    }

    private resetBotBoard(): void {
        this.returnCell = null;
        this.botBoard.board = [];
        for (let i = 0; i < NUMBER_OF_ROWS; i++) {
            let row: Cell[] = [];
            for (let j = 0; j < NUMBER_OF_COLUMNS; j++) {
                let cell = new Cell(i, j);
                cell.setValue(this.board[i][j].getValue());
                row.push(cell);
            }
            this.botBoard.board.push(row);
            this.botBoard.numberOfMovesPlayed = this.numberOfMovesPlayed;
        }
    }

    private getScore(alpha: number, beta: number): number {

        if (this.numberOfMovesPlayedOnBotBoard == NUMBER_OF_ROWS * NUMBER_OF_COLUMNS) {
            return 0
        }

        for (let i = 0; i < NUMBER_OF_COLUMNS; i++) {
            let cell = this.getFirstEmptyCellInColumn(this.botBoard.board, i);

            if (this.isCellAvailable(cell)) {
                let player = this.turnService.whoIsPlaying();
                cell.setValue(player);
                this.numberOfMovesPlayedOnBotBoard++;
                let isGameOver = this.gameService.isGameOver(this.botBoard.board);
                if (isGameOver) {
                    let returnCellScore = { cell: cell, score: (NUMBER_OF_ROWS * NUMBER_OF_COLUMNS + 1 - this.numberOfMovesPlayedOnBotBoard) / 2 };
                    return returnCellScore.score;
                }
                else {
                    cell.setValue(CellValue.Empty);
                    this.numberOfMovesPlayedOnBotBoard--;
                }
            }
        }
        let max = (NUMBER_OF_ROWS * NUMBER_OF_COLUMNS - 1 - (this.numberOfMovesPlayedOnBotBoard)) / 2;
        if (beta > max) {
            beta = max;
            if (alpha >= beta)
                return beta;
        }
        let returnCellScore: number;
        for (let i = 0; i < NUMBER_OF_COLUMNS; i++) {
            let cell = this.getFirstEmptyCellInColumn(this.botBoard.board, i);
            if (this.isCellAvailable(cell)) {
                let currentPlayer = this.turnService.whoIsPlaying();
                cell.setValue(currentPlayer);
                this.numberOfMovesPlayedOnBotBoard++;
                this.turnService.turnComplete(currentPlayer);
                returnCellScore = -this.getScore(-beta, -alpha);
                if (returnCellScore >= beta)
                    return returnCellScore;
                if (returnCellScore > alpha) {
                    alpha = returnCellScore;
                }
            }
            if (cell)
                this.returnCell = cell;
        }
        return returnCellScore;

    }
}
