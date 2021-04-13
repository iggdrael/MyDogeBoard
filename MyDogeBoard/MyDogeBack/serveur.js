const express       = require('express');
const cors          = require('cors');
const CoinGecko     = require('coingecko-api');
const mongoose      = require('mongoose');
const cryptoModel   = require('./cryptosDatas')
const userModel     = require('./user')
const auth          = require('./auth')
const utils         = require('./utils')
const config        = require('./config')
const jwt           = require('jsonwebtoken')


//Initiate the CoinGecko API Client
const CoinGeckoClient = new CoinGecko();

const app = express(),
    port = 3080;

mongoose.connect(config.MONGODB_SECRET, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
const db = mongoose.connection

db.on('error', (err) => {
    console.log(err)
})

db.once('open', () => {
    console.log('Connection à MyDogeBoard DataBase établie !')
})

setInterval(function () {
    console.log("Actualisation de la BDD")
    cryptoModel.collection.drop()
    CoinGeckoClient.coins.markets({
        vs_currency: "usd",
        order: CoinGecko.ORDER.MARKET_CAP_DESC,
        per_page: 250,
        price_change_percentage: "1h,24h,7d,30d"
    })
    .then(res => {
        res.data.forEach(asset => {
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
            }).save()
        });
    })
}, 300000)

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

app.post("/Cryptos", async (req, res) => {
    if (isEmpty(req.body)){
        res.json({ status: 'error', error: 'You must provide a token!' })
    }else{
        const { token } = req.body

        try {
            const user = jwt.verify(token, config.JWT_SECRET)
            const _id = user.id

            let foundUser = await userModel.findOne({ _id })
            let arrCryptos = foundUser.cryptosList

            let arrRes = {}
            let balances = []
            let total_dollar = 0
            let total_1h = 0
            let total_24h = 0
            let total_7d = 0
            let total_30d = 0

            for (let i = 0; i < arrCryptos.length; i++){
                let asset = arrCryptos[i].symbol
                let amount = arrCryptos[i].amount.toFixed(5)
                let doc = await cryptoModel.findOne({ symbol: asset }).collation( { locale: 'en', strength: 2 } )

                if (doc){
                    let total = amount * doc.price
                    total_dollar += total
                    total_1h += (utils.valeur_initiale(doc.price, doc.price_change_1h) * amount)
                    total_24h += (utils.valeur_initiale(doc.price, doc.price_change_24h) * amount)
                    total_7d += (utils.valeur_initiale(doc.price, doc.price_change_7d) * amount)
                    total_30d += (utils.valeur_initiale(doc.price, doc.price_change_30d) * amount)

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
            balances.sort(function(a, b) {
                return b.total - a.total;
            });
            arrRes["balances"] = balances
            let btc = await cryptoModel.findOne({ symbol: 'btc' })

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

app.post("/fetchOne", async (req, res) => {
    const { token, asset } = req.body
   
    try {
        const user = jwt.verify(token, config.JWT_SECRET)
        let doc = await cryptoModel.findOne({ symbol: asset }).collation( { locale: 'en', strength: 2 } )

        const _id = user.id
        let foundUser = await userModel.findOne({ _id })
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

app.listen(port, () => {
    console.log('Server running on port ' + port);
});

app.use('/api', auth)