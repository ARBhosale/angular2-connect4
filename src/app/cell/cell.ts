import { CellValue } from './cell.value';

export class Cell{
    private value: CellValue;

    constructor(private rowNumber: number, private columnNumber: number){}

    public getValue():CellValue{
        return this.value;
    }
    public setValue(value: CellValue):void{
        this.value = value;
    }
    public getCellColumnNumber():number{
        return this.columnNumber;
    }
    public isEmpty():boolean{
        return this.value == CellValue.Empty;
    }
}