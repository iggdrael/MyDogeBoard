import { Component, OnInit, } from '@angular/core';
import { ApiService } from './../../services/api.service';
import Binance from 'binance-api-node';
import { createChart, CrosshairMode } from 'lightweight-charts';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
})

export class ChartsComponent implements OnInit {

  //Interval and symbol are stored in localStorage to retrieve previously selected chart config
  public interval = localStorage.getItem('interval')
  public asset = localStorage.getItem('symbol')
  public symbol = this.asset + "USDT"
  public crypto: any = {};  //chart crypto data fetched from BackEnd
  public user: any = {};    //user data for the crypto => amount and symbol
  public amount: any = Number; //amount to display in page

  constructor(private apiService: ApiService) { }


  /**
   * Storing new interval in LocalStorage
   *
   * @param {*} newInt
   * @memberof ChartsComponent
   */
  changeInterval(newInt) {
    localStorage.setItem('interval', newInt)
    window.location.reload();
  }

  ngOnInit() {
    //Fetching crypto data from DB
    this.apiService.fetchOne(this.asset).then(res => {
      console.log(res)
      this.crypto = res.crypto;
      this.user = res.user;
      this.amount = 0

      //----TO IMPROVE---- searching user's data for the chart asset
      for (let i = 0; i < this.user.length; i++) {
        if (this.user[i].symbol == this.asset)
          this.amount = this.user[i].amount
      }
    })

    //Listing to the change asset button, storing new asset in localStorage then reloading chart component
    document.getElementById('assetButton').addEventListener('click', function () {
      localStorage.setItem('symbol', ((<HTMLInputElement>document.getElementById('chosenAsset')).value).toUpperCase())
      window.location.reload();
    })

    document.getElementById("int" + this.interval).id = "selectedInt"

    //Casting Inputs to access values
    var inputAchatUSDT = <HTMLInputElement>document.getElementById('inputAchatUSDT');
    var inputAchatAsset = <HTMLInputElement>document.getElementById('inputAchatAsset');
    var inputVenteUSDT = <HTMLInputElement>document.getElementById('inputVenteUSDT');
    var inputVenteAsset = <HTMLInputElement>document.getElementById('inputVenteAsset');

    /**----------------------------------------- */
    /**--------------TO IMPROVE----------------- */
    
    //Adding listeners to inputs for buy/sell, the matching value is auto-calculated

    inputAchatUSDT.addEventListener('keyup', function () {
      var price = (<HTMLInputElement>document.getElementById('assetPrice')).innerText
      inputAchatAsset.value = ((parseFloat(inputAchatUSDT.value) / parseFloat(price.substring(1)))).toString();
    });
    inputAchatAsset.addEventListener('keyup', function () {
      var price = (<HTMLInputElement>document.getElementById('assetPrice')).innerText
      inputAchatUSDT.value = ((parseFloat(inputAchatAsset.value) * parseFloat(price.substring(1)))).toString();
    });
    inputVenteUSDT.addEventListener('keyup', function () {
      var price = (<HTMLInputElement>document.getElementById('assetPrice')).innerText
      inputVenteAsset.value = ((parseFloat(inputVenteUSDT.value) / parseFloat(price.substring(1)))).toString();
    });
    inputVenteAsset.addEventListener('keyup', function () {
      var price = (<HTMLInputElement>document.getElementById('assetPrice')).innerText
      inputVenteUSDT.value = ((parseFloat(inputVenteAsset.value) * parseFloat(price.substring(1)))).toString();
    });

    //The buy/sell orders are replaced by alerts to avoid unwanted orders during beta
    /**
     * Call for real operation
     * =>
     * client.order({
     * symbol: symbol ex : 'BTCUSDT'
     * side: 'BUY' || 'SELL'
     * quantity: quantity of processed order : '100',
    *  price: wanted limit price : '0.0002',}), Can specify LIMIT, MARKET to change the order type
    */
    

    document.getElementById('acheter').addEventListener('click', function () {
      alert("Vous avez acheté " + inputAchatAsset.value + " " + localStorage.getItem('symbol') + " pour " + inputAchatUSDT.value + " USDT")
    })
    document.getElementById('vendre').addEventListener('click', function () {
      alert("Vous avez vendu " + inputVenteAsset.value + " " + localStorage.getItem('symbol') + " pour " + inputVenteUSDT.value + " USDT")
    })

    /**------------------------------------ */

    //New Binance Client
    const client = Binance();

    //Getting actual timestamp from Binance
    client.time().then(timestamp => {
      //Creating a new chart with given config
      let e = document.getElementById('chartBig1')
      var chart = createChart(e, {
        width: e.offsetWidth - 40,
        height: 650,
        layout: {
          backgroundColor: '#FF000000', //1e1e2a
          textColor: 'rgba(235, 235, 235, 0.9)',

        },
        grid: {
          vertLines: {
            color: 'rgba(197, 203, 206, 0.5)',
          },
          horzLines: {
            color: 'rgba(197, 203, 206, 0.5)',
          },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        timeScale: {
          borderColor: 'rgba(249, 201, 7, 0.979)',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      //Config for candles design
      var candleSeries = chart.addCandlestickSeries({
        upColor: '#2dd794',
        downColor: '#e61e42',
        borderDownColor: '#e61e42',
        borderUpColor: '#2dd794',
        wickDownColor: '#e61e42',
        wickUpColor: '#2dd794',
      });

      //Config for Binance historical candles
      var conf = {
        symbol: this.symbol,
        interval: this.interval,
        startTime: timestamp - this.maxCandlesTimestamp(), //The API returns a max of 500 candles, timestamp calculated to get max
        endTime: timestamp
      }

      //Getting candles from Binance
      client.candles(conf).then(info => {
        console.log(info)
        var lightweight_candles = [];

        //Formatting candles to be included in lightweight-chart
        info.forEach(candle => {
          var candlestick = {
            "time": candle.openTime / 1000 + 7200,
            "open": candle.open,
            "high": candle.high,
            "low": candle.low,
            "close": candle.close
          }
          lightweight_candles.push(candlestick)
        });
        //Adding candle array to the chart
        candleSeries.setData(lightweight_candles);
      });

      //Connection to Binance Websocket
      //Real-time candles for given interval/symbol
      var strStream = "wss://stream.binance.com:9443/ws/" + this.symbol.toLowerCase() + "@kline_" + this.interval;
      console.log(strStream)
      var binanceSocket = new WebSocket(strStream);

      //OnCandle => adding new candle to chart
      binanceSocket.onmessage = function (event) {
        var message = JSON.parse(event.data);

        var candlestick = message.k;

        console.log(candlestick)
        
        //Changing timestamp to match FR timezone
        candlestick.t = candlestick.t / 1000 + 7200
        candleSeries.update({
          time: candlestick.t,
          open: candlestick.o,
          high: candlestick.h,
          low: candlestick.l,
          close: candlestick.c
        })
      }
    });
  }


  /**
   * @return {*} Max timestamp to get exactly 500 last candles 
   * @memberof ChartsComponent
   */
  public maxCandlesTimestamp() {
    switch (this.interval) {
      case '1m': return 60000 * 500;
      case '3m': return 3 * 60000 * 500;
      case '5m': return 5 * 60000 * 500;
      case '15m': return 15 * 60000 * 500;
      case '30m': return 30 * 60000 * 500;
      case '1h': return 60 * 60000 * 500;
      case '2h': return 120 * 60000 * 500;
      case '4h': return 240 * 60000 * 500;
      case '6h': return 360 * 60000 * 500;
      case '8h': return 480 * 60000 * 500;
      case '12h': return 720 * 60000 * 500;
      case '1d': return 1440 * 60000 * 500;
      case '3d': return 4320 * 60000 * 500;
      case '1w': return 10080 * 60000 * 500;
      case '1M': return 40320 * 60000 * 500;
      default: return 60000;
    }
  }

}