import { Component, OnInit } from "@angular/core";
import { ApiService } from './../../services/api.service';

@Component({
  selector: "app-dashboard",
  templateUrl: "dashboard.component.html"
})

export class DashboardComponent implements OnInit {
  Cryptos:any = [];

  constructor(private apiService: ApiService) { }
  
  ngOnInit(): void {
    this.apiService.GetBooks().subscribe(res => {
      console.log(res)
      this.Cryptos = res;
    });
  }
}
