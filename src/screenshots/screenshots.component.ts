import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Parser } from "../parser";

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

    constructor(
        private route: ActivatedRoute,
        private parser: Parser
    ) {}

    async ngOnInit(): Promise<void> {
        const data = await this.parser.parseTSV<{
            game: string;
            id: number;
            description: string;
        }>("/data.tsv");

        this.route.params.subscribe((params) => {
            this.gameId = params["gameId"];
            this.screenshots = data
                .filter((entry) => entry.game === this.gameId)
                .map((entry) => ({
                    id: entry.id,
                    description: entry.description,
                }))
                .filter((screenshot) => screenshot.id != 0); // Exclude posters if needed
        });
    }
}
