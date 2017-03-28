import { Component, Directive } from '@angular/core';
import { Cell } from '../cell/cell';
import { CellValue } from '../cell/cell.value';
import { CellComponent } from '../cell/cell.component';
import { TurnService } from '../turn_service/turn.service';
import { GameService } from '../game_service/game.service';
import { Board } from './board';

export const NUMBER_OF_COLUMNS: number = 7;
export const NUMBER_OF_ROWS: number = 6;
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
    private depth = 12;

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
    private autoMove = false;
    private opponentMoveScores: MoveScore[];
    private selfMoveScores: MoveScore[];

    constructor(private turnService: TurnService) {
        this.board = new Board();
        this.gameService = new GameService();
        this.botBoard = new Board();
    }

    public playMove(board: Cell[][], moveSelectedInColumnNumber: number): void {
        if (this.isGameOver)
            return;
        this.autoMove = true;
        let cell = this.getFirstEmptyCellInColumn(board, moveSelectedInColumnNumber);
        if (this.isCellAvailable(cell)) {
            let currentPlayer = this.turnService.whoIsPlaying();
            this.captureCell(cell, currentPlayer);
            let timeOut = setTimeout(function (_this) {
                if (_this.autoMove)
                    _this.botMove();
                _this.autoMove = false;
                clearTimeout(timeOut);
            }, 100, this);
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
        do {
            this.evalMoves();
            this.depth++;
            console.log("depth:"+this.depth);
        } while (this.areAllSame(this.opponentMoveScores)&&this.depth <= 15);
        this.depth = 12;
        let minOpponentScore = this.getMin(this.opponentMoveScores);
        let maxSelfScore = this.getMax(this.selfMoveScores);
        let columnToPlay;
        if (!minOpponentScore.cell && maxSelfScore.cell)
            columnToPlay = maxSelfScore.cell.columnNumber;
        else if (maxSelfScore.score >= 0 && minOpponentScore.score < 0)
            columnToPlay = Math.abs(maxSelfScore.score) > Math.abs(minOpponentScore.score)
                ? maxSelfScore.cell.columnNumber : minOpponentScore.cell.columnNumber;
        else
            columnToPlay = minOpponentScore.cell.columnNumber;

        // if ( maxSelfScore.cell && minOpponentScore.cell && maxSelfScore.score == minOpponentScore.score) {
        //     colomnToPlay = minOpponentScore.cell.columnNumber;
        // }
        // else if(maxSelfScore.cell && minOpponentScore.cell && maxSelfScore.score < 0) {
        //     colomnToPlay = minOpponentScore.cell.columnNumber;
        // }
        // else if(maxSelfScore.cell && minOpponentScore.cell && maxSelfScore.score >= 0) {
        //     colomnToPlay =  maxSelfScore.cell.columnNumber;
        // }
        // else if (!maxSelfScore.cell && !minOpponentScore.cell) {
        //     colomnToPlay = this.getNextMoveCells(this.board).pop().columnNumber;
        // }
        // else if(!maxSelfScore.cell) {
        //     colomnToPlay = minOpponentScore.cell.columnNumber;
        //     colomnToPlay = this.getMax(this.opponentMoveScores).cell.columnNumber;
        // }
        // else if (!minOpponentScore.cell) {
        //     colomnToPlay = maxSelfScore.cell.columnNumber;
        //     //colomnToPlay = this.getMin(this.selfMoveScores).cell.columnNumber;
        // }

        let topMostEmptyCell = this.getFirstEmptyCellInColumn(this.board.board, columnToPlay);
        if (this.isCellAvailable(topMostEmptyCell)) {
            let currentPlayer = this.turnService.whoIsPlaying();
            this.captureCell(topMostEmptyCell, currentPlayer);
        }
    }

    private evalMoves(): void {
        this.resetBotBoard();
        this.moveScores = [];
        let currentPlayer = this.turnService.whoIsPlaying();
        let alpha = -NUMBER_OF_COLUMNS * NUMBER_OF_ROWS;
        let beta = NUMBER_OF_COLUMNS * NUMBER_OF_ROWS;
        this.getScores(this.turnService.getOtherPlayer(currentPlayer), this.botBoard, alpha, beta);
        this.opponentMoveScores = this.moveScores;
        this.resetBotBoard();
        this.moveScores = [];
        this.getScores(currentPlayer, this.botBoard, alpha, beta);
        this.selfMoveScores = this.moveScores;
        console.log(this.opponentMoveScores);
        console.log(this.selfMoveScores);
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
        let min: MoveScore = { cell: null, score: NUMBER_OF_ROWS * NUMBER_OF_COLUMNS };

        for (let i = 0; i < scores.length; i++) {
            if (scores[i].score < min.score)
                min = scores[i];
        }
        return min;
    }

    private getMax(scores: MoveScore[]): MoveScore {
        let max: MoveScore = { cell: null, score: -NUMBER_OF_ROWS * NUMBER_OF_COLUMNS };

        for (let i = 0; i < scores.length; i++) {
            if (scores[i].score >= max.score)
                max = scores[i];
        }
        return max;
    }

    private areAllSame(scores: MoveScore[]): boolean {
        for (let i = 0; i < scores.length - 1; i++) {
            if (scores[i].score != scores[i + 1].score)
                return false;
        }
        return true;
    }

    private isGameDraw(board: Board): boolean {
        return NUMBER_OF_ROWS * NUMBER_OF_COLUMNS === board.numberOfMovesPlayed;

    }

    private getScores(player: CellValue, board: Board, alpha: number, beta: number): number {
        if (this.isGameDraw(board)) {
            return 0;
        }

        let nextMoveCells = this.getNextMoveCells(board);
        for (let possibleMove = 0; possibleMove < nextMoveCells.length; possibleMove++) {
            let currentPlayer = player;
            let moveBoard = this.getCopyOfBoard(board);
            let moveCellRow = nextMoveCells[possibleMove].rowNumber;
            let moveCellColumn = nextMoveCells[possibleMove].columnNumber;
            let moveCell = moveBoard.board[moveCellRow][moveCellColumn];
            moveCell.setValue(currentPlayer);
            moveBoard.numberOfMovesPlayed++;
            if (this.gameService.isGameOver(board.board) ||
                (this.botBoard.numberOfMovesPlayed + this.depth) == moveBoard.numberOfMovesPlayed) {
                return (NUMBER_OF_ROWS * NUMBER_OF_COLUMNS - moveBoard.numberOfMovesPlayed) / 2;
            }
        }

        // for (let possibleMove = 0; possibleMove < nextMoveCells.length; possibleMove++) {
        //     let currentPlayer = player;
        //     let moveBoard = this.getCopyOfBoard(board);
        //     let moveCellRow = nextMoveCells[possibleMove].rowNumber;
        //     let moveCellColumn = nextMoveCells[possibleMove].columnNumber;
        //     let moveCell = moveBoard.board[moveCellRow][moveCellColumn];
        //     moveCell.setValue(currentPlayer);
        //     moveBoard.numberOfMovesPlayed++;
        //     if (this.gameService.isOneConnectionLeft(board.board)){
        //         return (NUMBER_OF_ROWS * NUMBER_OF_COLUMNS - moveBoard.numberOfMovesPlayed + 1) / 2;
        //     }
        // }


        let moveScores: MoveScore[] = [];

        for (let possibleMove = 0; possibleMove < nextMoveCells.length; possibleMove++) {
            let moveCellRow = nextMoveCells[possibleMove].rowNumber;
            let moveCellColumn = nextMoveCells[possibleMove].columnNumber;
            let currentPlayer = player;
            let moveBoard = this.getCopyOfBoard(board);
            let moveCell = moveBoard.board[moveCellRow][moveCellColumn];
            moveCell.setValue(currentPlayer);
            moveBoard.numberOfMovesPlayed++;
            let nextPlayer = this.turnService.getOtherPlayer(currentPlayer);
            // moveScore = -this.getScores(nextPlayer, moveBoard, alpha, beta);


            let moveScore = -this.getScores(nextPlayer, moveBoard, -beta, -alpha);

            if (moveScore >= beta) {
                return moveScore;
            }
            if (moveScore > alpha) {
                alpha = moveScore;
            }
            // if(moveScore<beta) {
            //     beta = moveScore;
            // }
            // if(moveScore >= alpha){
            //     return moveScore;
            // }

            moveScores[possibleMove] = { cell: moveCell, score: moveScore };
        }
        this.moveScores = moveScores;

        return alpha;
    }

    private getCellsInColumnSortedOrder(cells: MoveScore[]): MoveScore[] {
        let columnSortedOrderCells: MoveScore[] = [];
        if (!cells || cells.length == 0)
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
        let middleCell;
        for (let i = 0; i < moveCells.length; i++) {
            let cell = moveCells[i];
            if (optimalMoveCells.indexOf(cell) == -1) {
                if (cell.columnNumber == (NUMBER_OF_COLUMNS / 2) - 0.5) {
                    //optimalMoveCells = [cell].concat(optimalMoveCells);
                    middleCell = cell;
                    continue;
                }
                if (cell.columnNumber == 0 || cell.columnNumber == (NUMBER_OF_COLUMNS - 1)) {
                    optimalMoveCells = [cell].concat(optimalMoveCells);
                    continue;
                }
                optimalMoveCells.push(cell);
            }
        }
        if (middleCell)
            optimalMoveCells = [middleCell].concat(optimalMoveCells);
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
        this.board.numberOfMovesPlayed++;
        this.botBoard.numberOfMovesPlayed++;
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
            this.botBoard.numberOfMovesPlayed = this.board.numberOfMovesPlayed;
        }
    }
}
