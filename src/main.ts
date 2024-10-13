import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { GamesComponent } from './games/games.component';
import { ScreenshotsComponent } from './screenshots/screenshots.component';

const routes = [
  { path: '', component: GamesComponent },
  { path: ':gameId', component: ScreenshotsComponent }
];

bootstrapApplication(GamesComponent, {
  providers: [
    provideRouter(routes)
  ]
})
.catch((err) => console.error(err));
