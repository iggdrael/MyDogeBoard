const express = require('express');
const cors = require('cors');
const Binance = require('binance-api-node').default;
const CoinGecko = require('coingecko-api');
//const mongoose = require('mongoose'); 

const app = express(),
        port = 3080;

        /*
const url = 'mongodb+srv://qbort:uyHnWWk1LAcqmeqZ@mydogeboard.wcpgq.mongodb.net/MyDogeBoard?retryWrites=true&w=majority';
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(e => { console.log("Connected") } );*/

const client = Binance({
    apiKey: "rFHK3yLBOEFVTVtscnxOu06X4tfFXIa5GMA46Amshgf0bXA9kUtdlFacfkwoZR2d",
    apiSecret: "qAburcbZ7T5TJAYjH3uf3oaK2wD7Gi6T6n4pkZV0PjSZBF7g6ADTOkyUqYR2IS2s",
})

//2. Initiate the CoinGecko API Client
const CoinGeckoClient = new CoinGecko();

app.use(cors());

function binanceAssetToGeckoId(asset){
    
}

async function getBalances(callback){
    const HOUR = 3600000;
    const DAY = 86400000;
    const WEEK = 604800000;

    let total_usdt = 0
    let usdt_balance = []
    let prices = await client.prices()
    let balance = await client.accountInfo()
    let timestamp = await client.time()

    let timestampHOUR = (timestamp - HOUR) / 1000
    let timestampDAY = (timestamp - DAY) / 1000
    let timestampWEEK = (timestamp - WEEK) / 1000

    for (let i = 0; i < balance['balances'].length; i++){
        let item = balance['balances'][i]
        if (item.free > 0){
            let paire = item.asset + "USDT"
            let dict = {}
            let totalAsset;
            let oldPriceOneHour = 1;
            let oldPriceTwFourHour = 1;
            let oldPriceSevenDays = 1;
 
            dict["amount"] = (parseFloat(item.free) + parseFloat(item.locked)).toFixed(5)
            dict["coin"] = item.asset
            if (item.asset.localeCompare("USDT") == 0){
                dict["price"] = 1.00
                totalAsset = (parseFloat(item.free) + parseFloat(item.locked))
                oldPriceOneHour = 1.00
                oldPriceTwFourHour = 1.00
                oldPriceSevenDays = 1.00
            }
            else{
                dict["price"] = parseFloat(prices[paire]).toFixed(2)
                totalAsset = (parseFloat(item.free) + parseFloat(item.locked)) * parseFloat(prices[paire])
                
                oldPriceOneHour = await CoinGeckoClient.coins.fetchMarketChartRange('bitcoin', {
                    from: timestampHOUR - 5000,
                    to: timestampHOUR,
                })
                oldPriceOneHour = oldPriceOneHour.data.prices[0][1]
                
                oldPriceTwFourHour = await CoinGeckoClient.coins.fetchMarketChartRange('bitcoin', {
                    from: timestampDAY - 5000,
                    to: timestampDAY,
                })
                oldPriceTwFourHour = oldPriceTwFourHour.data.prices[0][1]

                oldPriceSevenDays = await CoinGeckoClient.coins.fetchMarketChartRange('bitcoin', {
                    from: timestampWEEK - 5000,
                    to: timestampWEEK,
                })
                oldPriceSevenDays = oldPriceSevenDays.data.prices[0][1]
            }
            dict["total"] = totalAsset.toFixed(5)
            dict["oneHourVar"] = ((dict["price"] - oldPriceOneHour)/ 
                oldPriceOneHour * 100).toFixed(2);
            dict["twFourHourVar"] = ((dict["price"] - oldPriceTwFourHour)/ 
                oldPriceTwFourHour * 100).toFixed(2);
            dict["sevenDaysVar"] = ((dict["price"] - oldPriceSevenDays)/ 
                oldPriceSevenDays * 100).toFixed(2);
        
            total_usdt += totalAsset

            usdt_balance.push(dict)
        }
      }

      usdt_balance.sort(function(a, b) {
        return b.total - a.total;
      });
      var portefeuille = {}
      portefeuille["totalUSD"] = total_usdt.toFixed(2)
      portefeuille["totalBTC"] = (total_usdt / prices.BTCUSDT).toFixed(8)

      var result = {}
      result["balances"] = usdt_balance
      result["portefeuille"] = portefeuille

      callback(result)
}

app.get("/Cryptos", (req, res) => {
    getBalances(function(result){
        res.json(result)
    })
});

app.listen(port, () => {
    console.log('Server running on port ' + port);
});