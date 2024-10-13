import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { gameData } from '../game-data';

@Component({
  selector: 'games',
  standalone: true,  // Marking the component as standalone
  imports: [RouterModule, CommonModule],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.less']
})
export class GamesComponent {
  gameIds: string[] = Object.keys(gameData);
}
