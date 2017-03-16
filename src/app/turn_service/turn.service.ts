import { Injectable } from '@angular/core';
import { CellValue } from '../cell/cell.value';

@Injectable()
export class TurnService {

    private player: CellValue = CellValue.B;

    constructor() {
    }

    public whoseMoveIsit(): CellValue {
        this.player = this.player == CellValue.A ? CellValue.B : CellValue.A;
        return this.player;
    }

}