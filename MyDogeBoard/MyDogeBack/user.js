const mongoose  = require('mongoose')
const Schema    = mongoose.Schema

const userSchema    = new Schema({
    username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
    cryptosList: [{ symbol: { type: String }, amount: { type: Number } }],
    binanceAPIKeys: { binanceAPikey: { type: String }, binanceAPiSecret: { type: String } }
})

const User = mongoose.model('User', userSchema)
module.exports = User