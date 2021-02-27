import { Routes } from "@angular/router";

import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { ChartsComponent } from "../../pages/charts/charts.component";
import { TweetDeckComponent } from "../../pages/tweetdeck/tweetdeck.component";

export const AdminLayoutRoutes: Routes = [
  { path: "dashboard", component: DashboardComponent },
  { path: "icons", component: ChartsComponent },
  { path: "maps", component: TweetDeckComponent }
];
