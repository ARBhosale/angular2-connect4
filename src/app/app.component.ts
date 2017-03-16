import { Component } from '@angular/core';
import { TurnService } from './turn_service/turn.service';
import { GameService } from './game_service/game.service';

@Component({
  selector: 'connect4',
  templateUrl: `./app/app.component.html`,
  providers: [GameService, TurnService]
})
export class AppComponent { }
