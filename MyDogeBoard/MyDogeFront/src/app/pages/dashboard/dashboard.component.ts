import { Component, ElementRef, OnInit } from "@angular/core";
import { ApiService } from './../../services/api.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: "app-dashboard",
  templateUrl: "dashboard.component.html"
})

export class DashboardComponent implements OnInit {
  //Cryptos Array displayed on dashboard
  Cryptos: any = [];

  //Acces to API BackEnd + toastr for alerts
  constructor(private apiService: ApiService, private toastr: ToastrService) { }

  /**
   * Displaying custom alert on dashboard
   *
   * @param {*} from
   * @param {*} align
   * @param {*} typeAlert
   * @memberof DashboardComponent
   */
  showNotification(from, align, typeAlert) {
    this.toastr.info('<span class="tim-icons icon-bell-55" [data-notify]="icon"></span>', '', {
      disableTimeOut: true,
      closeButton: true,
      enableHtml: true,
      toastClass: "alert alert-" + typeAlert + " alert-with-icon",
      positionClass: 'toast-' + from + '-' + align
    });
  }

  
  /**
   * Redirecting to charts : asset.onClick
   * Storing wanted asset in localStorage
   * 
   * @param {*} symbol
   * @memberof DashboardComponent
   */
  redirect(symbol) {
    localStorage.setItem('symbol', symbol.toUpperCase())
    window.location.href="http://localhost:4200/charts#/charts";
  }

  ngOnInit(): void {
    //Fetching user's Cryptos from BackEnd API
    this.apiService.GetBalances().then(res => {
      this.Cryptos = res;
      console.log(res)
    })
  }
}
