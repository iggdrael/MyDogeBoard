import { Component, OnInit } from "@angular/core";

declare interface RouteInfo {
  path: string;
  title: string;
  rtlTitle: string;
  icon: string;
  class: string;
}

//ROUTES for sidebar pages
export const ROUTES: RouteInfo[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    rtlTitle: "",
    icon: "icon-spaceship",
    class: ""
  },
  {
    path: "/charts",
    title: "Charts",
    rtlTitle: "",
    icon: "icon-chart-bar-32",
    class: ""
  },
  {
    path: "/tweetdeck",
    title: "Tweet Deck",
    rtlTitle: "",
    icon: "icon-world",
    class: "" 
  },
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"]
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() {}

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  //Responsive sidebar
  isMobileMenu() {
    if (window.innerWidth > 991) {
      return false;
    }
    return true;
  }
}
