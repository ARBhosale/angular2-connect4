import { Injectable } from '@angular/core';
import { CellValue } from '../cell/cell.value';

@Injectable()
export class TurnService {

    private currentPlayer: CellValue = CellValue.A;
    private nextPlayer: CellValue = CellValue.B;

    constructor() {
    }

    public whoIsPlaying(): CellValue{
        return this.currentPlayer;
    }

    public whoIsNext(): CellValue{
        return this.nextPlayer;
    }

    public turnComplete(playerJustPlayed: CellValue): void{
        this.currentPlayer = this.nextPlayer;
        this.nextPlayer = playerJustPlayed;
    }

    public getOtherPlayer(player: CellValue): CellValue{
        return player === CellValue.A ? CellValue.B : CellValue.A;
    }

}