import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { gameData } from '../game-data';

@Component({
  selector: 'screenshots',
  standalone: true,  // Marking the component as standalone
  imports: [RouterModule, CommonModule],
  templateUrl: './screenshots.component.html',
  styleUrls: ['./screenshots.component.less']
})
export class ScreenshotsComponent implements OnInit {
  gameId!: string;
  screenshotIds: number[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.gameId = params['gameId'];
      this.screenshotIds = Object.keys(gameData[this.gameId as keyof typeof gameData] || {}).map(Number).slice(1);
    });
  }
}
