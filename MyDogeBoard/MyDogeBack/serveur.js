const express       = require('express');           //Express server
const cors          = require('cors');              //The App must enable CORS to fetch data
const CoinGecko     = require('coingecko-api');     //CoinGecko-API : fetching top cryptos by market cap
const mongoose      = require('mongoose');          //NOSQL module for mongoDB
const cryptoModel   = require('./cryptosDatas')     //mongo Schema for each cryptocurreny
const userModel     = require('./user')             //mongo User's data Schema 
const auth          = require('./auth')             //provided router for MyDogeBoard's Backend API
const utils         = require('./utils')            //Utilitary functions
const config        = require('./config')           //Config files : Secret keys
const jwt           = require('jsonwebtoken')       //Used to verify the authenticity of a client token


//Initiate the CoinGecko API Client
const CoinGeckoClient = new CoinGecko();

//Initiate the express app on port 3080
const app = express(),
    port = 3080;

//Connection to the mongoDB database
mongoose.connect(config.MONGODB_SECRET, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
const db = mongoose.connection

//Mongo . onError
db.on('error', (err) => {
    console.log(err)
})

//Mongo . onSuccess
db.once('open', () => {
    console.log('Connection à MyDogeBoard DataBase établie !')
})

/** ------------------------------------------------------------------------ */
/** ----------------------SELF UPDATED DATABASE----------------------------- */

/** 
 * Every interval (5m here)
 * => Cryptos Collection on the DataBase will be dropped (better than just updating forEach asset)
 * CoinGecko will fetch top 250 cryptos sorted by market cap
 * A crypto Schema will be saved on mongoDB forEach asset
*/


setInterval(function () {
    console.log("Actualisation de la BDD")
    cryptoModel.collection.drop()
    
    CoinGeckoClient.coins.markets({
        vs_currency: "usd",                         //Returned values are based on the Asset/usd paire
        order: CoinGecko.ORDER.MARKET_CAP_DESC,     //Map on market cap
        per_page: 250,                              //Max per request
        price_change_percentage: "1h,24h,7d,30d"    //Price change intervals list
    })
    .then(res => {
        res.data.forEach(asset => {
            //FORMATTING DATA
            new cryptoModel({
                id: asset.id,
                symbol: asset.symbol,
                name: asset.name,
                image: asset.image,
                price: asset.current_price,
                price_change_1h: asset.price_change_percentage_1h_in_currency,
                price_change_24h: asset.price_change_percentage_24h_in_currency,
                price_change_7d: asset.price_change_percentage_7d_in_currency,
                price_change_30d: asset.price_change_percentage_30d_in_currency
            }).save() //Saving on mongoDB
        });
    })
}, 300000) //5minutes

/** ------------------------------------------------------------------------ */

//Using CORS
app.use(cors());
app.use(express.json());
//Body-parser deprecated
app.use(express.urlencoded({ extended: true }));

/** ------------------------------------------------------------------------ */
/** ------------------------MDB API ENDPOINTS------------------------------- */

/** 
 * The client must have a valid token to perform post requests on MDB API
 * /Cryptos return a JSON result containing data from each asset of user cryptosList
 * Also return a wallet containing USDT and BTC values of the wallet and
 * the evolution of the wallet in differents intervals
*/

app.post("/Cryptos", async (req, res) => {
    if (utils.isEmpty(req.body)){ //Checking if POST body is empty
        res.json({ status: 'error', error: 'You must provide a token!' })
    }else{
        const { token } = req.body

        try {
            //Checking if the user is logged in/ valid token
            const user = jwt.verify(token, config.JWT_SECRET)
            const _id = user.id
            
            //Finding user in DB
            let foundUser = await userModel.findOne({ _id })
            //Retrieving user's cryptosList
            let arrCryptos = foundUser.cryptosList

            let arrRes = {}         //Json response
            let balances = []       //Balances array
            let total_dollar = 0    //Total USDT value of the wallet
            let total_1h = 0        //Evolution 1h
            let total_24h = 0       //Evolution 24h
            let total_7d = 0        //Evolution 7d
            let total_30d = 0       //Evolution 30d

            //await does not work in forEach :/
            //forEach crypto in user : cryptosList
            for (let i = 0; i < arrCryptos.length; i++){
                let asset = arrCryptos[i].symbol
                let amount = arrCryptos[i].amount.toFixed(5)
                
                //Findig stored Schema of asset in mongoDB
                //strength 2 : case insensitive
                let doc = await cryptoModel.findOne({ symbol: asset }).collation( { locale: 'en', strength: 2 } )

                if (doc){
                    //Processing wallet's informations
                    let total = amount * doc.price
                    total_dollar += total
                    total_1h += (utils.valeur_initiale(doc.price, doc.price_change_1h) * amount)
                    total_24h += (utils.valeur_initiale(doc.price, doc.price_change_24h) * amount)
                    total_7d += (utils.valeur_initiale(doc.price, doc.price_change_7d) * amount)
                    total_30d += (utils.valeur_initiale(doc.price, doc.price_change_30d) * amount)

                    //Add new formatted crypto with amount and total
                    balances.push({
                        id: doc.id,
                        symbol: doc.symbol,
                        name: doc.name,
                        image: doc.image,
                        amount: amount,
                        price: doc.price.toFixed(2),
                        total: total.toFixed(2),
                        price_change_1h: doc.price_change_1h.toFixed(2),
                        price_change_24h: doc.price_change_24h.toFixed(2),
                        price_change_7d: doc.price_change_7d.toFixed(2),
                        price_change_30d: doc.price_change_30d.toFixed(2)
                    })
                }
                else{
                    //Asset not found in BDD
                    //For exemple FIAT currencies : EUR, USD etc will not be available
                    //Returning Formatted "empty" {}
                    //Alternative :
                    //We can implement a direct fetch from coinGecko for low market cap assets (instead of DB)
                    //Or we can upgrade our self updated DB to fetch more data => additional cost
                    balances.push({
                        id: asset,
                        symbol: asset,
                        name: asset,
                        image: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png?1547792256",
                        amount: amount,
                        price: "-",
                        total: "-",
                        price_change_1h: "-",
                        price_change_24h: "-",
                        price_change_7d: "-",
                        price_change_30d: "-"
                    })
                }
            }
            //Sorting balances by decreasing totalAsset values
            balances.sort(function(a, b) {
                return b.total - a.total;
            });
            arrRes["balances"] = balances
            //Getting BTC current price to calculate total wallet in BTC 
            let btc = await cryptoModel.findOne({ symbol: 'btc' })

            //Adding wallet to JSON response
            arrRes["portefeuille"] = {
                "totalUSD": total_dollar.toFixed(2),
                "totalBTC": (total_dollar / btc.price).toFixed(8),
                price_change_1h: utils.taux_variation(total_dollar, total_1h).toFixed(2),
                price_change_24h: utils.taux_variation(total_dollar, total_24h).toFixed(2),
                price_change_7d: utils.taux_variation(total_dollar, total_7d).toFixed(2),
                price_change_30d: utils.taux_variation(total_dollar, total_30d).toFixed(2)
            }

            res.json(arrRes)
        } catch (error) {
            console.log(error)
            res.json({ status: 'error', error: 'Error occured when fetching datas' })
        }
    }
});

/**
 * MDB endpoint used to query a given asset from DB
 * User must have valid token
 * Also returning Amount of asset in user's cryptosList
 */
app.post("/fetchOne", async (req, res) => {
    const { token, asset } = req.body
   
    try {
        //Checking token authenticity
        const user = jwt.verify(token, config.JWT_SECRET)
        //Fetching asset from DB
        let doc = await cryptoModel.findOne({ symbol: asset }).collation( { locale: 'en', strength: 2 } )

        const _id = user.id
        let foundUser = await userModel.findOne({ _id })
        //fetching user's cryptosList
        let arrCryptos = foundUser.cryptosList

        if (doc){
            doc.price = doc.price.toFixed(2)
            doc.price_change_1h = doc.price_change_1h.toFixed(2)
            doc.price_change_24h = doc.price_change_24h.toFixed(2)
            doc.price_change_7d = doc.price_change_7d.toFixed(2)
            doc.price_change_30d = doc.price_change_30d.toFixed(2)

            res.json({crypto:doc, user:arrCryptos})
        }
        else
            res.json({ status: 'error', error: 'No match found in BDD' })

    } catch (error) {
        console.log(error)
        res.json({ status: 'error', error: 'Error occured when fetching datas' })
    }
    
});

/** ------------------------------------------------------------------------ */

//App listening requests
app.listen(port, () => {
    console.log('Server running on port ' + port);
});

//App /api endpoints for managing users data
app.use('/api', auth)