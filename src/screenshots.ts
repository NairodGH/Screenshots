import { Component, OnInit, Inject } from "@angular/core";
import { RouterModule, ActivatedRoute } from "@angular/router";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogModule,
} from "@angular/material/dialog";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { Data } from "./data";

@Component({
    selector: "screenshots",
    imports: [
        RouterModule,
        CommonModule,
        MatIconModule,
        MatGridListModule,
        MatButtonModule,
        MatDialogModule,
        MatInputModule,
        FormsModule,
        NgOptimizedImage,
    ],
    template: `
        <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet"
        />

        <div
            *ngIf="!screenshots.length"
            class="container"
            (click)="getScreenshots()"
        >
            <p>Database not found. Click to select one.</p>
        </div>

        <div *ngIf="screenshots.length">
            <mat-grid-list cols="4">
                <mat-grid-tile *ngFor="let screenshot of screenshots">
                    <div class="container">
                        <img
                            [ngSrc]="game + '/' + screenshot + '.png'"
                            [alt]="game + '/' + screenshot + '.png missing'"
                            priority
                            fill
                        />
                        <div class="description">
                            {{ screenshot }}
                        </div>
                    </div>
                </mat-grid-tile>
            </mat-grid-list>

            <div class="buttons">
                <button mat-icon-button (click)="popup()">
                    <mat-icon>add_circle_outline</mat-icon>
                </button>
                <button mat-icon-button (click)="delete()">
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
        `,
    ],
})
export class Screenshots implements OnInit {
    protected screenshots: string[] = [];
    protected game: string = "";

    constructor(
        private data: Data,
        private dialog: MatDialog,
        private route: ActivatedRoute
    ) {
        this.game = this.route.snapshot.params["game"];
    }

    async ngOnInit(): Promise<void> {
        const data = await this.data.getScreenshots();
        if (data) this.screenshots = data.get(this.game)!;
    }

    async getScreenshots(): Promise<void> {
        const data = await this.data.getScreenshots();
        if (data) this.screenshots = data.get(this.game)!;
    }

    popup(): void {
        this.dialog
            .open(ScreenshotDialog, {
                data: {
                    screenshot: "",
                    url: "",
                },
            })
            .afterClosed()
            .subscribe(async (result) => {
                if (result) {
                    await this.data.addScreenshot(
                        this.game,
                        result.screenshot,
                        result.url
                    );
                    this.screenshots.push(result.screenshot);
                }
            });
    }

    delete(): void {
        this.data.delete();
        location.reload();
    }
}

@Component({
    selector: "screenshot-dialog",
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatInputModule,
        MatButtonModule,
        FormsModule,
    ],
    template: `
        <h1 mat-dialog-title align="center">Add Screenshot</h1>
        <div mat-dialog-content align="center">
            <form #screenshotForm="ngForm">
                <mat-form-field appearance="fill">
                    <mat-label>Description</mat-label>
                    <input
                        matInput
                        [(ngModel)]="data.screenshot"
                        name="screenshot"
                        required
                    />
                </mat-form-field>
                <div
                    class="dropZone"
                    (dragover)="onDragOver($event)"
                    (drop)="onDrop($event)"
                    [class.hasImage]="data.url"
                >
                    <p *ngIf="!data.url">Drag & Drop an image here</p>
                    <img
                        *ngIf="data.url"
                        [src]="data.url"
                        alt="Dropped Image"
                    />
                </div>
                <mat-error *ngIf="!data.url && screenshotForm.submitted">
                    An image is required.
                </mat-error>
            </form>
        </div>
        <div mat-dialog-actions align="center">
            <button
                mat-button
                [mat-dialog-close]="data"
                [disabled]="!screenshotForm.form.valid || !data.url"
                (click)="screenshotForm.ngSubmit.emit()"
            >
                Add
            </button>
        </div>
    `,
    styles: [
        `
            .dropZone {
                width: 20vw;
                height: 20vw;
                border: 0.3vw dashed #ccc;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .dropZone.hasImage {
                border-color: green;
            }

            .dropZone img {
                max-width: 100%;
                max-height: 100%;
            }

            .dropZone p {
                text-align: center;
                color: #888;
            }
        `,
    ],
})
export class ScreenshotDialog {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        const item = event.dataTransfer!.items[0];
        if (item.kind === "string" && item.type.match("^text/plain"))
            item.getAsString((url) => (this.data.url = url));
        else if (item.kind === "file" && item.type.match("^image/")) {
            const file = item.getAsFile();
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => (this.data.url = e.target!.result);
                reader.readAsDataURL(file);
            }
        }
    }
}
