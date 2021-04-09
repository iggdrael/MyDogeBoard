import { Component, OnInit, } from '@angular/core';
import Binance from 'binance-api-node';
import { createChart, CrosshairMode } from 'lightweight-charts';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
})

export class ChartsComponent implements OnInit {
  public datasets: any;
  public data: any;
  public myChartData;
  public clicked: boolean = true;
  public clicked1: boolean = false;
  public clicked2: boolean = false;
  public interval = '1m';
  public symbol = 'ETHUSDT';

  constructor() { }

  ngOnInit() {

    const client = Binance();

    client.time().then(timestamp => {
      var chart = createChart(document.getElementById('chartBig1'), {
        width: 1200,
        height: 600,
        layout: {
          backgroundColor: '#FF000000', //1e1e2a
          textColor: 'rgba(255, 255, 255, 0.9)',
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
          borderColor: 'rgba(197, 203, 206, 0.8)',
          timeVisible: true,
          secondsVisible: false,
        },
      });
      
      var candleSeries = chart.addCandlestickSeries({
        upColor: '#00ff00',
        downColor: '#ff0000', 
        borderDownColor: 'rgba(255, 144, 0, 1)',
        borderUpColor: 'rgba(255, 144, 0, 1)',
        wickDownColor: 'rgba(255, 144, 0, 1)',
        wickUpColor: 'rgba(255, 144, 0, 1)',
      });
      
      var conf = {
        symbol: this.symbol,
        interval: this.interval,
        startTime: timestamp - this.maxCandlesTimestamp(),
        endTime: timestamp
      }

      client.candles(conf).then(info => {
        console.log(info)
        var lightweight_candles = [];

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
        candleSeries.setData(lightweight_candles);
      });

      var strStream = "wss://stream.binance.com:9443/ws/" + this.symbol.toLowerCase() + "@kline_" + this.interval;
      console.log(strStream)
      var binanceSocket = new WebSocket(strStream);
      
      binanceSocket.onmessage = function (event) {	
        var message = JSON.parse(event.data);
      
        var candlestick = message.k;
      
        console.log(candlestick)

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

  public maxCandlesTimestamp() {
    switch (this.interval) {
      case '1m': return 60000*500;
      case '3m': return 3*60000*500;
      case '5m': return 5*60000*500;
      case '15m': return 15*60000*500;
      case '30m': return 30*60000*500;
      case '1h': return 60*60000*500;
      case '2h': return 120*60000*500;
      case '4h': return 240*60000*500;
      case '6h': return 360*60000*500;
      case '8h': return 480*60000*500;
      case '12h': return 720*60000*500;
      case '1d': return 1440*60000*500;
      case '3d': return 4320*60000*500;
      case '1w': return 10080*60000*500;
      case '1M': return 40320*60000*500;
      default: return 60000;
    }
  }

  public updateOptions() {
    
  }
}