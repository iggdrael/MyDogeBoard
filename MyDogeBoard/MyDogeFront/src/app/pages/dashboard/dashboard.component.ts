import { Component, OnInit } from "@angular/core";
import { ApiService } from './../../services/api.service';

@Component({
  selector: "app-dashboard",
  templateUrl: "dashboard.component.html"
})

export class DashboardComponent implements OnInit {
  Cryptos:any = [];
  Portefeuille:any = [];

  constructor(private apiService: ApiService) { }
  
  ngOnInit(): void {
    this.apiService.GetBalances().subscribe(res => {
      this.Cryptos = res;
    });
  }
}
