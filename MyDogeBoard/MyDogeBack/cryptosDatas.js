const mongoose  = require('mongoose')
const Schema    = mongoose.Schema

/**
 * New Schema cryptoDatas for mongoDB
 * The Schema for each asset is composed by
 * an id, a symbol, a name, a price, and price variation for 1h, 24h, 7d, 30d
 * 
 * collation : enabling case insensitive search
 */
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