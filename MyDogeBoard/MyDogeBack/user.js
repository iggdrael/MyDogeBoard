const mongoose  = require('mongoose')
const Schema    = mongoose.Schema

/**
 * New Schema User for mongoDB
 * When registering, a User must have a valide username/password
 * The cryptosList field will be updated after each opened order on Binance
 * The binanceAPIKeys must be provided to ensure the access of the User's datas
 */
const userSchema    = new Schema({
    username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
    cryptosList: [{ symbol: { type: String }, amount: { type: Number } }], /** Ex : {symbol:'BTC', amount: 0.2} */
    binanceAPIKeys: { binanceAPikey: { type: String }, binanceAPiSecret: { type: String } }
})

const User = mongoose.model('User', userSchema)
module.exports = User