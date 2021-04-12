import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  // Node/Express API

  REST_API_CRYPTOS: string = 'http://localhost:3080/Cryptos';

  constructor(private httpClient: HttpClient) { }
  
  //Getting Balances
  async GetBalances() {
    //return this.httpClient.get(`${this.REST_API_CRYPTOS}`)
   // console.log(localStorage.getItem('token'))
    let res = await fetch(`${this.REST_API_CRYPTOS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: localStorage.getItem('token')
      })
    })
    return res.json()
  }
}
