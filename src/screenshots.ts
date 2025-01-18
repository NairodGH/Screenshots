import { Component } from "@angular/core";
import { RouterModule, ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FormsModule } from "@angular/forms";
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
            <mat-grid-list cols="4">
                <mat-grid-tile *ngFor="let screenshot of screenshots">
                    <div class="container">
                        <img
                            [src]="screenshot.src"
                            [alt]="screenshot.name + ' missing'"
                            class="fill"
                        />
                        <div class="description">
                            {{ screenshot.name }}
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
export class Screenshots {
    protected screenshots: Info[] = [];
    protected game: string = "";

    constructor(
        protected data: Data,
        private dialog: MatDialog,
        private route: ActivatedRoute
    ) {
        this.game = this.route.snapshot.params["game"];
    }

    async ngOnInit(): Promise<void> {
        await this.loadScreenshots();
    }

    async getScreenshots(): Promise<void> {
        await this.loadScreenshots();
    }

    private async loadScreenshots(): Promise<void> {
        const data = await this.data.getScreenshots();
        if (data) {
            this.screenshots = data
                .get(this.game)!
                .filter((info: Info) => info.name !== this.game)
                .map((info: Info) => ({
                    name: info.name,
                    src: info.src,
                }));
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
                    const src = await this.data.addScreenshot(
                        this.game,
                        result.name,
                        result.src
                    );
                    if (src) {
                        this.screenshots.push({
                            name: result.name,
                            src,
                        });
                    }
                }
            });
    }
}
