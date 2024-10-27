import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { gameData } from "../game-data";

@Component({
    selector: "screenshots",
    standalone: true,
    imports: [RouterModule, CommonModule],
    templateUrl: "./screenshots.component.html",
    styleUrls: ["./screenshots.component.less"],
})
export class ScreenshotsComponent implements OnInit {
    gameId!: string;
    screenshots: { id: number; description: string }[] = [];

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.gameId = params["gameId"];
            this.screenshots = Object.entries(
                gameData[this.gameId as keyof typeof gameData] || {}
            )
                .map(([id, description]) => ({ id: Number(id), description }))
                .filter((screenshot) => screenshot.id !== 0); // Exclude poster ID 0 if needed
        });
    }
}
