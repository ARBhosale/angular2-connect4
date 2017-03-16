import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { BoardComponent } from './board/board.component';
import { CellComponent } from './cell/cell.component';

import { TurnService } from './turn_service/turn.service';
import { GameService } from './game_service/game.service';

@NgModule({
  imports: [BrowserModule],
  declarations: [AppComponent, BoardComponent, CellComponent],
  bootstrap: [AppComponent]

})
export class AppModule { }
