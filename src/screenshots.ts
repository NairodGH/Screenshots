import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Data } from "./data";
import { MatGridListModule } from "@angular/material/grid-list";

@Component({
    selector: "screenshots",
    standalone: true,
    imports: [RouterModule, CommonModule, MatGridListModule],
    template: `
        <mat-grid-list cols="2" rowHeight="2:1">
            <mat-grid-tile *ngFor="let screenshot of screenshots">
                <img [src]="gameId + '/' + screenshot.id + '.png'" />
                <p>{{ screenshot.description }}</p>
            </mat-grid-tile>
        </mat-grid-list>
    `,
    styles: [],
})
export class Screenshots implements OnInit {
    gameId!: string;
    screenshots: { id: number; description: string }[] = [];

    constructor(private route: ActivatedRoute, private data: Data) {}

    async ngOnInit(): Promise<void> {}
}
