import { Component, ElementRef, OnInit } from "@angular/core";
import { ApiService } from './../../services/api.service';

@Component({
  selector: "app-dashboard",
  templateUrl: "dashboard.component.html"
})

export class DashboardComponent implements OnInit {
  Cryptos:any = [];
  constructor(private apiService: ApiService) { }
  
  ngOnInit(): void {
    this.apiService.GetBalances().then(res => {
      this.Cryptos = res;
    })
  }
}
