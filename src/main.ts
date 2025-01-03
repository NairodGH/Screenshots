import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";
import { Router } from "./router";
import { Games } from "./games";
import { Screenshots } from "./screenshots";

bootstrapApplication(Router, {
    providers: [
        provideRouter([
            { path: "", component: Games },
            { path: ":game", component: Screenshots },
        ]),
        provideAnimations(),
    ],
});
