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
            delete db.models['cryptos'];
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
    /*console.log(req.body)
    if (isEmpty(req.body)){
        res.json({ status: 'error', error: 'You must provide a token!' })
    }else{
        const { token } = req.body

        try {
            const user = jwt.verify(token, config.JWT_SECRET)
            const _id = user.id

            let foundUser = await userModel.findOne({ _id })
            console.log(foundUser)
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
    }*/
    res.json({"balances":[{"amount":"2.98289","coin":"BNB","price":"491.69","total":"1466.65744","oneHourVar":"-99.17","twFourHourVar":"-99.19","sevenDaysVar":"-99.15"},{"amount":"0.31096","coin":"ETH","price":"2151.71","total":"669.09264","oneHourVar":"-96.39","twFourHourVar":"-96.44","sevenDaysVar":"-96.30"},{"amount":"14.87507","coin":"SOL","price":"27.65","total":"411.23477","oneHourVar":"-99.95","twFourHourVar":"-99.95","sevenDaysVar":"-99.95"},{"amount":"291.70474","coin":"REN","price":"1.07","total":"310.79682","oneHourVar":"-100.00","twFourHourVar":"-100.00","sevenDaysVar":"-100.00"},{"amount":"1.10100","coin":"EGLD","price":"226.78","total":"249.68918","oneHourVar":"-99.62","twFourHourVar":"-99.62","sevenDaysVar":"-99.61"},{"amount":"31.99000","coin":"NEAR","price":"7.02","total":"224.71375","oneHourVar":"-99.99","twFourHourVar":"-99.99","sevenDaysVar":"-99.99"},{"amount":"37.56370","coin":"1INCH","price":"5.71","total":"214.37227","oneHourVar":"-99.99","twFourHourVar":"-99.99","sevenDaysVar":"-99.99"},{"amount":"10.83000","coin":"BAND","price":"17.31","total":"187.51820","oneHourVar":"-99.97","twFourHourVar":"-99.97","sevenDaysVar":"-99.97"},{"amount":"58.20000","coin":"ENJ","price":"3.12","total":"181.43675","oneHourVar":"-99.99","twFourHourVar":"-99.99","sevenDaysVar":"-99.99"},{"amount":"5.39878","coin":"AVAX","price":"31.99","total":"172.70692","oneHourVar":"-99.95","twFourHourVar":"-99.95","sevenDaysVar":"-99.95"},{"amount":"14.00000","coin":"THETA","price":"12.27","total":"171.75396","oneHourVar":"-99.98","twFourHourVar":"-99.98","sevenDaysVar":"-99.98"},{"amount":"95.49000","coin":"OCEAN","price":"1.77","total":"169.11279","oneHourVar":"-100.00","twFourHourVar":"-100.00","sevenDaysVar":"-100.00"},{"amount":"0.53136","coin":"LTC","price":"253.00","total":"134.43408","oneHourVar":"-99.58","twFourHourVar":"-99.58","sevenDaysVar":"-99.57"},{"amount":"0.00206","coin":"BTC","price":"59733.82","total":"123.10662","oneHourVar":"0.32","twFourHourVar":"-1.15","sevenDaysVar":"2.66"},{"amount":"3.57000","coin":"LINK","price":"33.59","total":"119.92094","oneHourVar":"-99.94","twFourHourVar":"-99.94","sevenDaysVar":"-99.94"},{"amount":"88.20513","coin":"ADA","price":"1.24","total":"109.21912","oneHourVar":"-100.00","twFourHourVar":"-100.00","sevenDaysVar":"-100.00"},{"amount":"1.73600","coin":"FTT","price":"49.95","total":"86.71667","oneHourVar":"-99.92","twFourHourVar":"-99.92","sevenDaysVar":"-99.91"},{"amount":"1.85950","coin":"DOT","price":"40.47","total":"75.24917","oneHourVar":"-99.93","twFourHourVar":"-99.93","sevenDaysVar":"-99.93"},{"amount":"0.00154","coin":"YFI","price":"46224.83","total":"71.32491","oneHourVar":"-22.37","twFourHourVar":"-23.51","sevenDaysVar":"-20.55"},{"amount":"101.70000","coin":"XLM","price":"0.60","total":"61.52443","oneHourVar":"-100.00","twFourHourVar":"-100.00","sevenDaysVar":"-100.00"},{"amount":"2.02022","coin":"UNI","price":"30.01","total":"60.62048","oneHourVar":"-99.95","twFourHourVar":"-99.95","sevenDaysVar":"-99.95"},{"amount":"6.80000","coin":"BNT","price":"7.13","total":"48.46904","oneHourVar":"-99.99","twFourHourVar":"-99.99","sevenDaysVar":"-99.99"},{"amount":"0.09100","coin":"KSM","price":"439.67","total":"40.01033","oneHourVar":"-99.26","twFourHourVar":"-99.27","sevenDaysVar":"-99.24"},{"amount":"2.61000","coin":"RUNE","price":"11.89","total":"31.03473","oneHourVar":"-99.98","twFourHourVar":"-99.98","sevenDaysVar":"-99.98"},{"amount":"1.96800","coin":"SUSHI","price":"14.40","total":"28.33920","oneHourVar":"-99.98","twFourHourVar":"-99.98","sevenDaysVar":"-99.98"},{"amount":"41.91000","coin":"UTK","price":"0.63","total":"26.49131","oneHourVar":"-100.00","twFourHourVar":"-100.00","sevenDaysVar":"-100.00"},{"amount":"212.00000","coin":"RSR","price":"0.09","total":"18.48852","oneHourVar":"-100.00","twFourHourVar":"-100.00","sevenDaysVar":"-100.00"},{"amount":"9.85557","coin":"USDT","price":1,"total":"9.85557","oneHourVar":"0.00","twFourHourVar":"0.00","sevenDaysVar":"0.00"},{"amount":"0.26939","coin":"LIT","price":"11.69","total":"3.14957","oneHourVar":"-99.98","twFourHourVar":"-99.98","sevenDaysVar":"-99.98"},{"amount":"0.09093","coin":"DEGO","price":"17.96","total":"1.63329","oneHourVar":"-99.97","twFourHourVar":"-99.97","sevenDaysVar":"-99.97"},{"amount":"0.06000","coin":"MANA","price":"1.06","total":"0.06331","oneHourVar":"-100.00","twFourHourVar":"-100.00","sevenDaysVar":"-100.00"},{"amount":"0.00601","coin":"EUR","price":"1.19","total":"0.00718","oneHourVar":"-100.00","twFourHourVar":"-100.00","sevenDaysVar":"-100.00"},{"amount":"0.00022","coin":"UMA","price":"27.68","total":"0.00607","oneHourVar":"-99.95","twFourHourVar":"-99.95","sevenDaysVar":"-99.95"},{"amount":"0.00049","coin":"OMG","price":"9.72","total":"0.00476","oneHourVar":"-99.98","twFourHourVar":"-99.98","sevenDaysVar":"-99.98"},{"amount":"0.03400","coin":"REEF","price":"0.04","total":"0.00136","oneHourVar":"-100.00","twFourHourVar":"-100.00","sevenDaysVar":"-100.00"}],"portefeuille":{"totalUSD":"5478.76","totalBTC":"0.09171950"}})
});

app.listen(port, () => {
    console.log('Server running on port ' + port);
});

app.use('/api', auth)