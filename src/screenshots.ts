import { Component } from "@angular/core";
import { RouterModule, ActivatedRoute } from "@angular/router";
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
    selector: "screenshots",
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
            <p>Database not found. Click to select one.</p>
        </div>

        <div *ngIf="this.data.db">
            <mat-toolbar>
                <button
                    mat-icon-button
                    (click)="addScreenshot()"
                    matTooltip="Add screenshot"
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
                <span>Screenshots</span>
            </mat-toolbar>
            <mat-grid-list [cols]="cols">
                <mat-grid-tile *ngFor="let screenshot of screenshots">
                    <div class="container">
                        <div class="buttons">
                            <button
                                mat-icon-button
                                (click)="removeScreenshot(screenshot.name)"
                                matTooltip="Delete screenshot"
                            >
                                <mat-icon>delete_outline</mat-icon>
                            </button>
                        </div>
                        <img
                            [src]="screenshot.src"
                            alt="Restart the app"
                            class="fill"
                            (click)="selected = screenshot.src"
                        />
                        <div class="description">
                            {{ screenshot.name }}
                        </div>
                    </div>
                </mat-grid-tile>
            </mat-grid-list>
        </div>

        <div *ngIf="selected" class="selected" (click)="selected = null">
            <img [src]="selected" class="fill" />
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

            .selected {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `,
    ],
})
export class Screenshots {
    protected screenshots: Info[] = [];
    protected game: string = "";
    protected selected: string | null = null;
    protected cols: number = 4;

    constructor(
        protected data: Data,
        private dialog: MatDialog,
        private route: ActivatedRoute
    ) {
        this.game = this.route.snapshot.params["game"];
    }

    async ngOnInit(): Promise<void> {
        this.loadScreenshots();
    }

    async getScreenshots(): Promise<void> {
        this.loadScreenshots();
    }

    private async loadScreenshots(): Promise<void> {
        this.data
            .getScreenshots()
            .then((screenshots) => {
                this.screenshots = screenshots
                    .get(this.game)!
                    .filter((info: Info) => info.name !== this.game)
                    .map((info: Info) => ({
                        name: info.name,
                        src: info.src,
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));
            })
            .catch(() => {});
    }

    addScreenshot(): void {
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
                    this.data
                        .addScreenshot(this.game, result.name, result.src)
                        .then((src) => {
                            this.screenshots.push({
                                name: result.name,
                                src,
                            });
                            this.screenshots.sort((a, b) =>
                                a.name.localeCompare(b.name)
                            );
                        });
                }
            });
    }

    async removeScreenshot(name: string): Promise<void> {
        this.data.delete(this.game, name).then(() => {
            this.screenshots = this.screenshots.filter(
                (info) => info.name !== name
            );
        });
    }
}
