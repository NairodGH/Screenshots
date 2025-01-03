import { Component, OnInit, Inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
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
    ],
    template: `
        <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet"
        />

        <div *ngIf="!games.length" class="centered" (click)="getData()">
            <p>Click to select local screenshots TSV file</p>
        </div>

        <div *ngIf="games.length">
            <mat-grid-list cols="4">
                <mat-grid-tile *ngFor="let game of games">
                    <a [routerLink]="[game]">
                        <img
                            [src]="game + '/0.png'"
                            [alt]="game"
                            class="centered"
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
    ]
})
export class Games implements OnInit {
    protected games: string[] = [];

    constructor(private data: Data, private dialog: MatDialog) {}

    async ngOnInit(): Promise<void> {
        const data = await this.data.checkDB();
        if (data) this.games = Array.from(data.keys());
    }

    async getData(): Promise<void> {
        const data = await this.data.getData();
        if (data) this.games = Array.from(data.keys());
    }

    popup(): void {
        this.dialog
            .open(PopupContentComponent, {
                data: {
                    game: "",
                    imageUrl: "",
                },
            })
            .afterClosed()
            .subscribe(async (result) => {
                if (result) {
                    await this.data.addData(result.game);
                    this.games.push(result.game);
                    this.data.saveImage(result.game, result.imageUrl);
                }
            });
    }

    delete(): void {
        this.data.deleteDB();
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
                    class="image-drop-zone"
                    (dragover)="onDragOver($event)"
                    (drop)="onDrop($event)"
                    [class.has-image]="data.imageUrl"
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
            .image-drop-zone {
                width: 200px;
                height: 200px;
                border: 2px dashed #ccc;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 16px;
                position: relative;
            }

            .image-drop-zone.has-image {
                border-color: green;
            }

            .image-drop-zone img {
                max-width: 100%;
                max-height: 100%;
                position: absolute;
            }

            .image-drop-zone p {
                text-align: center;
                color: #888;
            }
        `,
    ],
})
export class PopupContentComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();

        const items = event.dataTransfer?.items;
        if (items) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.kind === "string" && item.type.match("^text/plain")) {
                    item.getAsString((url) => {
                        this.data.imageUrl = url;
                    });
                } else if (item.kind === "file" && item.type.match("^image/")) {
                    const file = item.getAsFile();
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e: any) => {
                            this.data.imageUrl = e.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                }
            }
        }
    }
}