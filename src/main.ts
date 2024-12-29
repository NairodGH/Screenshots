import { ScreenshotsComponent } from "./screenshots/screenshots.component";
import { provideAnimations } from "@angular/platform-browser/animations";
import { bootstrapApplication } from "@angular/platform-browser";
import { GamesComponent } from "./games/games.component";
import { RouterComponent } from "./router.component";
import { provideRouter } from "@angular/router";

bootstrapApplication(RouterComponent, {
    providers: [
        provideRouter([
            { path: "", component: GamesComponent },
            { path: ":game", component: ScreenshotsComponent },
        ]),
        provideAnimations(),
    ],
});
