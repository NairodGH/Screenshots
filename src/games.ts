import { Component, OnInit, Inject } from "@angular/core";
import { RouterModule } from "@angular/router";
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
    selector: "games",
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

        <div *ngIf="!games.length" class="centered" (click)="getScreenshots()">
            <p>Click to select local screenshots TSV file</p>
        </div>

        <div *ngIf="games.length">
            <mat-grid-list cols="4">
                <mat-grid-tile *ngFor="let game of games">
                    <a [routerLink]="[game]">
                        <img
                            [ngSrc]="game + '/' + game + '.png'"
                            [alt]="game + '/' + game + '.png missing'"
                            priority
                            fill
                        />
                    </a>
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
            .centered {
                display: flex;
                height: 100%;
                width: 100%;
                justify-content: center;
                align-items: center;
                cursor: pointer;
            }

            .buttons {
                display: flex;
                flex-direction: column;
                position: fixed;
                top: 0;
                right: 0;
            }
        `,
    ],
})
export class Games implements OnInit {
    protected games: string[] = [];

    constructor(private data: Data, private dialog: MatDialog) {}

    async ngOnInit(): Promise<void> {
        const data = await this.data.getScreenshots();
        if (data) this.games = Array.from(data.keys());
    }

    async getScreenshots(): Promise<void> {
        const data = await this.data.getScreenshots();
        if (data) this.games = Array.from(data.keys());
    }

    popup(): void {
        this.dialog
            .open(Dialog, {
                data: {
                    game: "",
                    imageUrl: "",
                },
            })
            .afterClosed()
            .subscribe(async (result) => {
                if (result) {
                    // game's icon "screenshot" has its name
                    await this.data.addScreenshot(
                        result.game,
                        result.game,
                        result.imageUrl
                    );
                    this.games.push(result.game);
                }
            });
    }

    delete(): void {
        this.data.delete();
        location.reload();
    }
}

@Component({
    selector: "dialog",
    imports: [
        CommonModule,
        MatDialogModule,
        MatInputModule,
        MatButtonModule,
        FormsModule,
    ],
    template: `
        <h1 mat-dialog-title align="center">Add Game</h1>
        <div mat-dialog-content align="center">
            <form #gameForm="ngForm">
                <mat-form-field appearance="fill">
                    <mat-label>Game Name</mat-label>
                    <input
                        matInput
                        [(ngModel)]="data.game"
                        name="game"
                        required
                    />
                </mat-form-field>
                <div
                    class="dropzone"
                    (dragover)="onDragOver($event)"
                    (drop)="onDrop($event)"
                    [class.hasImage]="data.imageUrl"
                >
                    <p *ngIf="!data.imageUrl">Drag & Drop an image here</p>
                    <img
                        *ngIf="data.imageUrl"
                        [src]="data.imageUrl"
                        alt="Dropped Image"
                    />
                </div>
                <mat-error *ngIf="!data.imageUrl && gameForm.submitted">
                    An image is required.
                </mat-error>
            </form>
        </div>
        <div mat-dialog-actions align="center">
            <button
                mat-button
                [mat-dialog-close]="data"
                [disabled]="!gameForm.form.valid || !data.imageUrl"
                (click)="gameForm.ngSubmit.emit()"
            >
                Add
            </button>
        </div>
    `,
    styles: [
        `
            .dropzone {
                width: 20vw;
                height: 20vw;
                border: 0.3vw dashed #ccc;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .dropzone.hasImage {
                border-color: green;
            }

            .dropzone img {
                max-width: 100%;
                max-height: 100%;
            }

            .dropzone p {
                text-align: center;
                color: #888;
            }
        `,
    ],
})
export class Dialog {
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
            item.getAsString((url) => (this.data.imageUrl = url));
        else if (item.kind === "file" && item.type.match("^image/")) {
            const file = item.getAsFile();
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => (this.data.imageUrl = e.target!.result);
                reader.readAsDataURL(file);
            }
        }
    }
}
