import { Component, Directive } from '@angular/core';
import { Cell } from '../cell/cell';
import { CellValue } from '../cell/cell.value';
import { CellComponent } from '../cell/cell.component';
import { TurnService } from '../turn_service/turn.service';
import { GameService } from '../game_service/game.service';
import { Board } from './board';

export const NUMBER_OF_COLUMNS: number = 3;
export const NUMBER_OF_ROWS: number = 3;
export class MoveScore {
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

    public board: Board;
    private botBoard: Board;
    private isGameOver: boolean = false;
    private winner: CellValue;
    private gameService: GameService;
    private numberOfMovesPlayed: number = 0;
    private numberOfMovesPlayedOnBotBoard: number = 0;
    public returnCell: Cell;
    public score: string;
    private moveScores: MoveScore[];
    public columnToSuggest: number;
    private lastCellCaptured: Cell;

    constructor(private turnService: TurnService) {
        this.board = new Board();
        this.gameService = new GameService();
        this.botBoard = new Board();
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
        let currentPlayer = this.turnService.whoIsPlaying();
        this.getScores(this.turnService.getOtherPlayer(currentPlayer), this.botBoard);
        this.moveScores = this.getCellsInColumnSortedOrder(this.moveScores);
        this.score = this.moveScores.join(',');
        let minScore = this.getMin(this.moveScores);
        let topMostEmptyCell = this.getFirstEmptyCellInColumn(this.board.board, minScore.cell.columnNumber);
        if(topMostEmptyCell) {
            this.playMove(this.board.board, topMostEmptyCell.columnNumber);
        }
    }

    public restartGame(): void {
        this.board = new Board();
        this.botBoard = new Board();
        this.gameService = new GameService();
        this.winner = null;
        this.isGameOver = false;
    }

    private isCellAvailable(cell: Cell): boolean {
        return cell ? cell.isEmpty() : false;
    }

    private getMin(scores: MoveScore[]): MoveScore {
        let min: MoveScore = {cell: null, score: NUMBER_OF_ROWS * NUMBER_OF_COLUMNS};

        for (let i = 0; i < scores.length; i++) {
            if (scores[i].score <= min.score)
                min = scores[i];
        }
        return min;
    }

    private getMax(scores: number[]): number {
        let max = -NUMBER_OF_ROWS * NUMBER_OF_COLUMNS;
        for (let i = 0; i < scores.length; i++) {
            if (scores[i] >= max)
                max = scores[i];
        }
        return max;
    }

    private isGameDraw(board: Board): boolean {
        return NUMBER_OF_ROWS * NUMBER_OF_COLUMNS === board.numberOfMovesPlayed;

    }

    private getScores(player: CellValue, board: Board): number {
        if (this.isGameDraw(board)) {
            return 0;
        }
        if (this.gameService.isGameOver(board.board)) {
            return NUMBER_OF_ROWS * NUMBER_OF_COLUMNS - board.numberOfMovesPlayed;
        }
        let nextMoveCells = this.getNextMoveCells(board);
        let moveScores: MoveScore[] = [];
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
            moveScores[possibleMove] = { cell: moveCell, score: moveScore };
        }
        this.moveScores = moveScores;

        return moveScore;
    }

    private getCellsInColumnSortedOrder(cells: MoveScore[]): MoveScore[] {
        let columnSortedOrderCells: MoveScore[] = [];
        if (cells.length == 0)
            return cells;
        columnSortedOrderCells.push(cells[0]);
        for (let i = 0; i < cells.length; i++) {
            for (let j = 0; j < columnSortedOrderCells.length; j++) {
                if (columnSortedOrderCells.indexOf(cells[i]) == -1) {
                    if (cells[i].cell.columnNumber < columnSortedOrderCells[j].cell.columnNumber) {
                        columnSortedOrderCells = [cells[i]].concat(columnSortedOrderCells);
                        continue;
                    }
                    columnSortedOrderCells.push(cells[i]);
                }
            }
        }
        return columnSortedOrderCells;
    }

    private getMoveCellsInOptimalOrder(moveCells: Cell[]): Cell[] {
        if (moveCells.length == 0)
            return moveCells;
        let optimalMoveCells: Cell[] = [];
        optimalMoveCells.push(moveCells[0]);
        for (let i = 0; i < moveCells.length; i++) {
            let cell = moveCells[i];
            if (optimalMoveCells.indexOf(cell) == -1) {
                if (cell.columnNumber == (NUMBER_OF_COLUMNS / 2) - 0.5) {
                    optimalMoveCells = [cell].concat(optimalMoveCells);
                    continue;
                }
                if (cell.columnNumber == 0 || cell.columnNumber == (NUMBER_OF_COLUMNS - 1)) {
                    optimalMoveCells = [cell].concat(optimalMoveCells);
                    continue;
                }
                optimalMoveCells.push(cell);
            }
        }
        return optimalMoveCells;
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

    private getNextMoveCells(board: Board): Cell[] {
        let nextMoveCells: Cell[] = [];
        for (let i = 0; i < NUMBER_OF_COLUMNS; i++) {
            let cell = this.getFirstEmptyCellInColumn(board.board, i);
            if (cell)
                nextMoveCells.push(cell);
        }
        nextMoveCells = this.getMoveCellsInOptimalOrder(nextMoveCells);
        return nextMoveCells;
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
        if (this.gameService.isGameOver(this.board.board)) {
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

    // private initializeCellValues(): void {
    //     for (let i = 0; i < NUMBER_OF_ROWS; i++) {
    //         let row: Cell[] = [];
    //         let botRow: Cell[] = [];
    //         for (let j = 0; j < NUMBER_OF_COLUMNS; j++) {
    //             let cell = new Cell(i, j);
    //             let botCell = new Cell(i, j);
    //             cell.setValue(CellValue.Empty);
    //             botCell.setValue(CellValue.Empty);
    //             row.push(cell);
    //             botRow.push(botCell);
    //         }
    //         this.board.board.push(row);
    //         this.botBoard.board.push(botRow);
    //     }
    // }

    private resetBotBoard(): void {
        this.botBoard = new Board();
        this.botBoard.board = [];
        for (let i = 0; i < NUMBER_OF_ROWS; i++) {
            let row: Cell[] = [];
            for (let j = 0; j < NUMBER_OF_COLUMNS; j++) {
                let cell = new Cell(i, j);
                cell.setValue(this.board.board[i][j].getValue());
                row.push(cell);
            }
            this.botBoard.board.push(row);
            this.botBoard.numberOfMovesPlayed = this.numberOfMovesPlayed;
        }
    }

    // private getScore(alpha: number, beta: number): number {

    //     if (this.numberOfMovesPlayedOnBotBoard == NUMBER_OF_ROWS * NUMBER_OF_COLUMNS) {
    //         return 0
    //     }

    //     for (let i = 0; i < NUMBER_OF_COLUMNS; i++) {
    //         let cell = this.getFirstEmptyCellInColumn(this.botBoard.board, i);

    //         if (this.isCellAvailable(cell)) {
    //             let player = this.turnService.whoIsPlaying();
    //             cell.setValue(player);
    //             this.numberOfMovesPlayedOnBotBoard++;
    //             let isGameOver = this.gameService.isGameOver(this.botBoard.board);
    //             if (isGameOver) {
    //                 let returnCellScore = { cell: cell, score: (NUMBER_OF_ROWS * NUMBER_OF_COLUMNS + 1 - this.numberOfMovesPlayedOnBotBoard) / 2 };
    //                 return returnCellScore.score;
    //             }
    //             else {
    //                 cell.setValue(CellValue.Empty);
    //                 this.numberOfMovesPlayedOnBotBoard--;
    //             }
    //         }
    //     }
    //     let max = (NUMBER_OF_ROWS * NUMBER_OF_COLUMNS - 1 - (this.numberOfMovesPlayedOnBotBoard)) / 2;
    //     if (beta > max) {
    //         beta = max;
    //         if (alpha >= beta)
    //             return beta;
    //     }
    //     let returnCellScore: number;
    //     for (let i = 0; i < NUMBER_OF_COLUMNS; i++) {
    //         let cell = this.getFirstEmptyCellInColumn(this.botBoard.board, i);
    //         if (this.isCellAvailable(cell)) {
    //             let currentPlayer = this.turnService.whoIsPlaying();
    //             cell.setValue(currentPlayer);
    //             this.numberOfMovesPlayedOnBotBoard++;
    //             this.turnService.turnComplete(currentPlayer);
    //             returnCellScore = -this.getScore(-beta, -alpha);
    //             if (returnCellScore >= beta)
    //                 return returnCellScore;
    //             if (returnCellScore > alpha) {
    //                 alpha = returnCellScore;
    //             }
    //         }
    //         if (cell)
    //             this.returnCell = cell;
    //     }
    //     return returnCellScore;

    // }
}
