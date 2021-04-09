const express = require('express');
const cors = require('cors');
const Binance = require('binance-api-node').default
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

app.use(cors());

async function getBalances(callback){
    let total_usdt = 0
    let usdt_balance = []
    let prices = await client.prices()
    let balance = await client.accountInfo()

    balance['balances']
    .forEach(function(item){
        if (item.free > 0){
            let paire = item.asset + "USDT"
            let dict = {}
            let totalAsset;
 
            dict["amount"] = (parseFloat(item.free) + parseFloat(item.locked)).toFixed(5)
            dict["coin"] = item.asset
            if (item.asset.localeCompare("USDT") == 0){
                dict["price"] = 1.00
                totalAsset = (parseFloat(item.free) + parseFloat(item.locked))
            }
            else{
                dict["price"] = parseFloat(prices[paire]).toFixed(2)
                totalAsset = (parseFloat(item.free) + parseFloat(item.locked)) * parseFloat(prices[paire])
            }
            dict["total"] = totalAsset.toFixed(5)
            dict["oneHourVar"] = 0
            dict["twFourHourVar"] = 0
            dict["sevenDaysVar"] = 0

            total_usdt += totalAsset
            usdt_balance.push(dict)
        };
      })
      usdt_balance.sort(function(a, b) {
        return b.total - a.total;
      });
      callback(usdt_balance)
      /*
      console.log(usdt_balance)
      console.log(total_usdt.toFixed(2), "USDT")
      let total_btc = total_usdt / prices.BTCUSDT
      console.log(total_btc.toFixed(8), "BTC")*/

}

getBalances(function(result){
    app.get("/Cryptos", (req, res) => {
        res.json(result);
    });
})

app.listen(port, () => {
    console.log('Server running on port ' + port);
});