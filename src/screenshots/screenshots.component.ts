import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Data } from "../data";
import { MatGridListModule } from "@angular/material/grid-list";

@Component({
    selector: "screenshots",
    standalone: true,
    imports: [RouterModule, CommonModule, MatGridListModule],
    templateUrl: "./screenshots.component.html",
    styleUrls: ["./screenshots.component.less"],
})
export class ScreenshotsComponent implements OnInit {
    gameId!: string;
    screenshots: { id: number; description: string }[] = [];

    constructor(private route: ActivatedRoute, private data: Data) {}

    async ngOnInit(): Promise<void> {}
}
