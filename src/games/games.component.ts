import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Parser } from "../parser";

@Component({
  selector: 'games',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.less'],
})
export class GamesComponent implements OnInit {
  gameIds: string[] = [];

  constructor(private parser: Parser) {}

  async ngOnInit(): Promise<void> {
    const data = await this.parser.parseTSV<{ game: string; id: number; description: string }>('/data.tsv');
    this.gameIds = [...new Set(data.map((entry) => entry.game))];
  }
}