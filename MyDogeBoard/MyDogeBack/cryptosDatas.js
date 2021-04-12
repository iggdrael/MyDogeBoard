const mongoose  = require('mongoose')
const Schema    = mongoose.Schema

const cryptoDatas = new Schema({
    id: String,
    symbol: String,
    name: String,
    image: String,
    price: Number,
    price_change_1h: Number,
    price_change_24h: Number,
    price_change_7d: Number,
    price_change_30d: Number
}, { collation: { locale: 'en', strength: 1 } });

const cryptoModel = mongoose.model('cryptos', cryptoDatas)
module.exports = cryptoModel