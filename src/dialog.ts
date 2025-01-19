import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";

@Component({
    selector: "dialog",
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatInputModule,
        MatButtonModule,
        FormsModule,
    ],
    template: `
        <h1 mat-dialog-title align="center">Add</h1>
        <div mat-dialog-content align="center">
            <form #form="ngForm">
                <mat-form-field appearance="fill">
                    <mat-label>Name</mat-label>
                    <input
                        matInput
                        [(ngModel)]="data.name"
                        name="name"
                        required
                    />
                </mat-form-field>
                <div
                    class="dropZone"
                    (dragover)="onDragOver($event)"
                    (drop)="handleFile($event)"
                    [class.hasImage]="data.src"
                >
                    <p *ngIf="!data.src">Paste or drag and drop an image here</p>
                    <img
                        *ngIf="data.src"
                        [src]="data.src"
                    />
                </div>
                <mat-error *ngIf="!data.src && form.submitted">
                    An image is required.
                </mat-error>
            </form>
        </div>
        <div mat-dialog-actions align="center">
            <button
                mat-button
                [mat-dialog-close]="data"
                [disabled]="!form.form.valid || !data.src"
                (click)="form.ngSubmit.emit()"
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
export class Dialog {
    private pasteHandler: (event: ClipboardEvent) => void;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
        this.pasteHandler = this.handleFile.bind(this);
    }

    ngOnInit(): void {
        document.addEventListener("paste", this.pasteHandler);
    }

    ngOnDestroy(): void {
        document.removeEventListener("paste", this.pasteHandler);
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
    }

    handleFile(event: DragEvent | ClipboardEvent): void {
        event.preventDefault();
        event.stopPropagation();
        let file: File | null = null;
        let src: string | null = null;

        if (event instanceof DragEvent) {
            // Handle drag-and-drop
            const item = event.dataTransfer?.items[0];
            if (item?.kind === "file" && item.type.match("^image/")) {
                file = item.getAsFile();
            } else if (
                item?.kind === "string" &&
                item.type.match("^text/plain")
            ) {
                item.getAsString((text: string) => (src = text));
            }
        } else if (event instanceof ClipboardEvent) {
            const clipboardData = event.clipboardData!;
            if (clipboardData.files.length > 0) file = clipboardData.files[0];
            const html = clipboardData.getData("text/html");
            if (html) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const img = doc.querySelector("img");
                if (img && img.src) src = img.src;
            }
            if (!file && !src) {
                const text = clipboardData?.getData("text/plain");
                if (text && /\.(jpeg|jpg|gif|png|webp|bmp)$/i.test(text))
                    src = text;
            }
        }
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => (this.data.src = e.target!.result as string);
            reader.readAsDataURL(file);
        } else if (src) {
            this.data.src = src;
        }
    }
}
