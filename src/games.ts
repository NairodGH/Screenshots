import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FormsModule } from "@angular/forms";
import { Data, Info } from "./data";
import { Dialog } from "./dialog";

@Component({
    selector: "games",
    imports: [
        RouterModule,
        CommonModule,
        MatIconModule,
        MatGridListModule,
        MatButtonModule,
        FormsModule,
    ],
    template: `
        <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet"
        />

        <div *ngIf="!this.data.db" class="container" (click)="getScreenshots()">
            <p>Click to select local screenshots TSV file</p>
        </div>

        <div *ngIf="this.data.db">
            <mat-grid-list cols="4">
                <mat-grid-tile *ngFor="let game of games">
                    <div class="container">
                        <a [routerLink]="[game.name]">
                            <img
                                [src]="game.src"
                                [alt]="game.name + ' missing'"
                                class="fill"
                            />
                        </a>
                        <div class="description">
                            {{ game.name }}
                        </div>
                    </div>
                </mat-grid-tile>
            </mat-grid-list>

            <div class="buttons">
                <button mat-icon-button (click)="openDialog()">
                    <mat-icon>add_circle_outline</mat-icon>
                </button>
                <button mat-icon-button (click)="this.data.delete()">
                    <mat-icon>delete_outline</mat-icon>
                </button>
            </div>
        </div>
    `,
    styles: [
        `
            .buttons {
                display: flex;
                flex-direction: column;
                position: fixed;
                top: 0;
                right: 0;
            }

            .container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                width: 100%;
                cursor: pointer;
                position: relative;
            }

            .description {
                position: absolute;
                bottom: 0;
                width: 100%;
                text-align: center;
                background-color: rgba(0, 0, 0, 0.5);
                color: white;
            }

            .fill {
                width: 100%;
                height: 100%;
                object-fit: scale-down;
            }
        `,
    ],
})
export class Games {
    protected games: Info[] = [];

    constructor(protected data: Data, private dialog: MatDialog) {}

    async ngOnInit(): Promise<void> {
        await this.loadGames();
    }

    async getScreenshots(): Promise<void> {
        await this.loadGames();
    }

    private async loadGames(): Promise<void> {
        const data = await this.data.getScreenshots();
        if (data) {
            this.games = Array.from(data.entries())
                .map(([game, infos]) =>
                    infos.find((info) => info.name === game)
                )
                .filter((info) => info !== undefined);
        }
    }

    openDialog(): void {
        this.dialog
            .open(Dialog, {
                data: {
                    name: "",
                    src: "",
                },
            })
            .afterClosed()
            .subscribe(async (result) => {
                if (result) {
                    // game's icon "screenshot" has its name
                    (await this.data.addScreenshot(
                        result.name,
                        result.name,
                        result.src
                    )) && this.games.push(result.name);
                }
            });
    }
}
