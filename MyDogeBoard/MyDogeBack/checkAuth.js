const User      = require('./user')
const bcrypt    = require('bcryptjs')
const jwt       = require('jsonwebtoken')
const config 	= require('./config')
const Binance = require('binance-api-node').default;

async function getBalances(binanceAPikey, binanceAPiSecret){
    let res = []
    let balance = await Binance({
		apiKey: binanceAPikey,
		apiSecret: binanceAPiSecret,
	}).accountInfo()
    for (let i = 0; i < balance['balances'].length; i++){
        let item = balance['balances'][i]
        if (item.free > 0){
            res.push({
                symbol: item.asset,
                amount: parseFloat(item.free) + parseFloat(item.locked)
            })
        }
    }
    return res;
}

const updateUser =  async (req, res) => {
	const { token, binanceAPikey, binanceAPiSecret } = req.body

	try {
		const user = jwt.verify(token, config.JWT_SECRET)
		const _id = user.id
		let balances = await getBalances(binanceAPikey, binanceAPiSecret)

		await User.updateOne(
			{ _id },
			{
				$set: { 
					cryptosList: balances, 
					binanceAPIKeys: { binanceAPikey: binanceAPikey, binanceAPiSecret: binanceAPiSecret }
				}
			}
		)
		res.json({ status: 'ok' })
	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'Error occured when updating' })
	}
}

const register  = async (req, res, next) => {
    const { username, password: plainTextPassword } = req.body

    if (!username || typeof username !== 'string') {
		return res.json({ status: 'error', error: 'Invalid username' })
	}
	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
		return res.json({ status: 'error', error: 'Invalid password' })
	}
	if (plainTextPassword.length < 5) {
		return res.json({
			status: 'error',
			error: 'Password too small. Should be atleast 6 characters'
		})
	}

    const password = await bcrypt.hash(plainTextPassword, 10)

	try {
		const response = await User.create({
			username,
			password
		})
		console.log('Le compte a bien été créé, connectez-vous !', response)
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return res.json({ status: 'error', error: 'Cet username existe déjà' })
		}
		throw error
	}

    res.json({ status: 'ok' })
}

const login = async (req, res, next) => {
    const { username, password } = req.body
	const user = await User.findOne({ username }).lean()

	if (!user) {
		return res.json({ status: 'error', error: 'Invalid username' })
	}

	if (await bcrypt.compare(password, user.password)) {
		// the username, password combination is successful

		const token = jwt.sign({
				id: user._id,
				username: user.username
			},
			config.JWT_SECRET,
            {expiresIn: '1h'})

		return res.json({ status: 'ok', data: token })
	}

	res.json({ status: 'error', error: 'Invalid username/password' })
}

module.exports = { updateUser, register, login }