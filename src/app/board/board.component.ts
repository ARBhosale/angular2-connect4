import { Component, Directive } from '@angular/core';
import { Cell } from '../cell/cell';
import { CellValue } from '../cell/cell.value';
import { CellComponent } from '../cell/cell.component';
import { TurnService } from '../turn_service/turn.service';
import { GameService } from '../game_service/game.service';

export const NUMBER_OF_COLUMNS: number = 7;
export const NUMBER_OF_ROWS: number = 6;

@Component({
    selector: 'board',
    styleUrls: [`./app/board/board.component.css`],
    templateUrl: `./app/board/board.component.html`,
})
export class BoardComponent {

    private board: Cell[][] = [];
    private isGameOver: boolean = false;
    private winner: CellValue;
    private gameService: GameService;
    constructor(private turnService: TurnService) {
        this.gameService = new GameService();
    }

    ngOnInit(){
        this.initializeCellValues();
    }

    public playMove(moveSelectedInColumnNumber: number): void {
        if(this.isGameOver)
            return;
        let cell = this.getFirstEmptyCellInColumn(moveSelectedInColumnNumber);
        if (cell)
            this.captureCell(cell, this.turnService.whoseMoveIsit());
    }

    public restartGame():void{
        this.board = [];
        this.initializeCellValues();
        this.gameService = new GameService();
        this.winner = null;
        this.isGameOver = false;
    }

    private captureCell(cell: Cell, player: CellValue): void {
        if (!cell.isEmpty()) {
            return;
        }
        cell.setValue(player);
        if (this.gameService.isGameOver(this.board)){
            this.isGameOver = true;
            this.winner = player;
        }
    }

    private getFirstEmptyCellInColumn(columnNumber: number): Cell {
        for (let i = NUMBER_OF_ROWS - 1; i >= 0; i--) {
            let cell = this.board[i][columnNumber];
            if (cell.isEmpty())
                return cell;
        }
        return null;
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
