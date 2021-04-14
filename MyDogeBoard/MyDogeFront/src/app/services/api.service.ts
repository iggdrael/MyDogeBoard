import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

//Providing Backend API endpoints

export class ApiService {
  // Node/Express API

  REST_API_CRYPTOS: string = 'http://localhost:3080/Cryptos';
  REST_API_FETCHONE: string = 'http://localhost:3080/FetchOne';


  constructor(private httpClient: HttpClient) { }
  
  /**
   * Getting user's Balances
   *
   * @return {*} 
   * @memberof ApiService
   */
  async GetBalances() {
    //return this.httpClient.get(`${this.REST_API_CRYPTOS}`)
   // console.log(localStorage.getItem('token'))
    let res = await fetch(`${this.REST_API_CRYPTOS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        //Auth token in request body
        token: localStorage.getItem('token')
      })
    })
    return res.json()
  }


  /**
   * Fetching one Crypto in BDD
   *
   * @param {*} asset
   * @return {*} 
   * @memberof ApiService
   */
  async fetchOne(asset) {
    let res = await fetch(`${this.REST_API_FETCHONE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        //Auth token in request body
        token: localStorage.getItem('token'),
        //Wanted asset
        asset: asset
      })
    })
    return res.json()
  }
}
