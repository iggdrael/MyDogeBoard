import { Routes } from "@angular/router";

import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { ChartsComponent } from "../../pages/charts/charts.component";
import { TweetDeckComponent } from "../../pages/tweetdeck/tweetdeck.component";
import { LoginComponent } from "../../pages/login/login.component";

export const AdminLayoutRoutes: Routes = [
  { path: "dashboard", component: DashboardComponent },
  { path: "charts", component: ChartsComponent },
  { path: "tweetdeck", component: TweetDeckComponent },
  { path: "login", component: LoginComponent }
];
