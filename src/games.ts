import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FormsModule } from "@angular/forms";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSliderModule } from "@angular/material/slider";
import { MatToolbarModule } from "@angular/material/toolbar";
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
        MatTooltipModule,
        MatSliderModule,
        MatToolbarModule,
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
            <mat-toolbar>
                <button
                    mat-icon-button
                    (click)="addGame()"
                    matTooltip="Add game"
                >
                    <mat-icon>add_circle_outline</mat-icon>
                </button>
                <button
                    mat-icon-button
                    (click)="this.data.delete()"
                    matTooltip="Clear data"
                >
                    <mat-icon>clear</mat-icon>
                </button>
                <mat-slider
                    min="2"
                    max="10"
                    step="1"
                    matTooltip="Change columns"
                >
                    <input matSliderThumb [(ngModel)]="cols" />
                </mat-slider>
                <span style="flex: 1 1 auto;"></span>
                <span>Games</span>
            </mat-toolbar>
            <mat-grid-list [cols]="cols">
                <mat-grid-tile *ngFor="let game of games">
                    <div class="container">
                        <div class="buttons">
                            <button
                                mat-icon-button
                                (click)="removeGame(game.name)"
                                matTooltip="Delete game"
                            >
                                <mat-icon>delete_outline</mat-icon>
                            </button>
                        </div>
                        <a [routerLink]="[game.name]">
                            <img
                                [src]="game.src"
                                alt="Restart the app"
                                class="fill"
                            />
                        </a>
                        <div class="description">
                            {{ game.name }}
                        </div>
                    </div>
                </mat-grid-tile>
            </mat-grid-list>
        </div>
    `,
    styles: [
        `
            .buttons {
                display: flex;
                flex-direction: column;
                position: absolute;
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
    protected cols: number = 4;

    constructor(protected data: Data, private dialog: MatDialog) {}

    async ngOnInit(): Promise<void> {
        this.loadGames();
    }

    async getScreenshots(): Promise<void> {
        this.loadGames();
    }

    private async loadGames(): Promise<void> {
        this.data
            .getScreenshots()
            .then((screenshots) => {
                this.games = Array.from(screenshots.entries())
                    .map(([game, infos]) =>
                        infos.find((info) => info.name === game)
                    )
                    .filter((info) => info !== undefined)
                    .sort((a, b) => a.name.localeCompare(b.name));
            })
            .catch(() => {});
    }

    addGame(): void {
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
                    this.data
                        .addScreenshot(result.name, result.name, result.src)
                        .then((src) => {
                            this.games.push({
                                name: result.name,
                                src,
                            });
                            this.games.sort((a, b) =>
                                a.name.localeCompare(b.name)
                            );
                        });
                }
            });
    }

    async removeGame(game: string): Promise<void> {
        this.data.delete(game).then(() => {
            this.games = this.games.filter((info) => info.name !== game);
        });
    }
}
