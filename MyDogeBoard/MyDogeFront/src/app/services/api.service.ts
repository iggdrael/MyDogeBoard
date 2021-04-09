import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  // Node/Express API

  REST_API_CRYPTOS: string = 'http://127.0.0.1:3080/Cryptos';

  constructor(private httpClient: HttpClient) { }
  
  //Getting Balances
  GetBalances() {
    return this.httpClient.get(`${this.REST_API_CRYPTOS}`);
  }
}
