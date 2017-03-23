import { CellValue } from './cell.value';

export class Cell{
    private value: CellValue;

    constructor(public rowNumber: number, public columnNumber: number){}

    public getValue():CellValue{
        return this.value;
    }
    public setValue(value: CellValue):void{
        this.value = value;
    }
    public isEmpty():boolean{
        return this.value == CellValue.Empty;
    }
}