import { RouterModule } from "@angular/router";
import { Component } from "@angular/core";

@Component({
    selector: "router",
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class Router {}
