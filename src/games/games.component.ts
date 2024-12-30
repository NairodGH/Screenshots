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
import { Data } from "../data";

export interface DialogData {
    game: string;
}

@Component({
    selector: "games",
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        MatIconModule,
        MatGridListModule,
        MatButtonModule,
    ],
    templateUrl: "./games.component.html",
    styleUrls: ["./games.component.less"],
})
export class GamesComponent implements OnInit {
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
                },
            })
            .afterClosed()
            .subscribe(async (result) => {
                if (result) {
                    await this.data.addData(result);
                    this.games.push(result);
                }
            });
    }

    delete(): void {
        this.data.deleteDB();
        location.reload();
    }
}

@Component({
    selector: "popup-content",
    template: `
        <h1 mat-dialog-title align="center">Add Game</h1>
        <div mat-dialog-content align="center">
            <mat-form-field appearance="fill">
                <mat-label>Game Name</mat-label>
                <input matInput [(ngModel)]="data.game" />
            </mat-form-field>
        </div>
        <div mat-dialog-actions align="center">
            <button mat-button [mat-dialog-close]="data.game">Add</button>
        </div>
    `,
    standalone: true,
    imports: [MatDialogModule, MatInputModule, MatButtonModule, FormsModule],
})
export class PopupContentComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
