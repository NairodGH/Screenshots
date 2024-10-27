import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { GamesComponent } from './games/games.component';
import { ScreenshotsComponent } from './screenshots/screenshots.component';
import { RouterComponent } from './router.component';

const routes = [
  { path: '', component: GamesComponent },
  { path: ':gameId', component: ScreenshotsComponent }
];

bootstrapApplication(RouterComponent, {
  providers: [
    provideRouter(routes)
  ]
})
.catch((err) => console.error(err));
