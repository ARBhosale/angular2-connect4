import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CellValue } from './cell.value';
import { Cell } from './cell';

@Component({
    selector: 'cell',
    styleUrls: [`./app/cell/cell.component.css`],
    templateUrl: `./app/cell/cell.component.html`,
})

export class CellComponent {
    @Input() cell: Cell;
    @Output() cellClicked: EventEmitter<number> = new EventEmitter();

    constructor() { 
        
    }

    public handleCellClick():void{
        this.cellClicked.emit(this.cell.getCellColumnNumber());
    }
}
