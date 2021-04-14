const User      = require('./user')
const bcrypt    = require('bcryptjs')
const jwt       = require('jsonwebtoken')
const config 	= require('./config')
const Binance = require('binance-api-node').default;


/**
 * Fetch balances and quantity from Binance
 *
 * @param {*} binanceAPikey 	//Required to fetch user's data
 * @param {*} binanceAPiSecret
 * @return [{symbol, amount}]
 */
async function getBalances(binanceAPikey, binanceAPiSecret){
    let res = []
    let balance = await Binance({
		apiKey: binanceAPikey,
		apiSecret: binanceAPiSecret,
	}).accountInfo()
    for (let i = 0; i < balance['balances'].length; i++){
        let item = balance['balances'][i]
		//Pushing non null balances
        if (item.free > 0){
            res.push({
                symbol: item.asset,
                amount: parseFloat(item.free) + parseFloat(item.locked)
            })
        }
    }
    return res;
}


/**
 * Updating user Api Keys and cryptosList on DB
 * User must be logged in / valid token
 *
 * @param {*} req
 * @param {*} res
 */
const updateUser =  async (req, res) => {
	const { token, binanceAPikey, binanceAPiSecret } = req.body

	try {
		//Checking token
		const user = jwt.verify(token, config.JWT_SECRET)
		const _id = user.id
		//getBalances from Binance API
		let balances = await getBalances(binanceAPikey, binanceAPiSecret)

		//Updating user data
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


/**
 * Create a new User on DB from valid username/ password
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*} 
 */
const register  = async (req, res, next) => {
    const { username, password: plainTextPassword } = req.body

	//Check username / password, can add a regex if we want
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

	//hashing the password
    const password = await bcrypt.hash(plainTextPassword, 10)

	try {
		//Try to create a new user
		const response = await User.create({
			username,
			password
		})
		console.log('Le compte a bien été créé, connectez-vous !', response)
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key == username already taken
			return res.json({ status: 'error', error: 'Cet username existe déjà' })
		}
		throw error
	}

    res.json({ status: 'ok' })
}


/**
 * Try to login, if success, the response will contain a JWT token
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*} 
 */
const login = async (req, res, next) => {
    const { username, password } = req.body
	// Looking for matching username
	const user = await User.findOne({ username }).lean()

	if (!user) {
		return res.json({ status: 'error', error: 'Invalid username' })
	}

	//Checking if hashes are matching
	if (await bcrypt.compare(password, user.password)) {
		// the username, password combination is successful

		//Logging in the user, returning his auth token
		const token = jwt.sign({
				id: user._id,
				username: user.username
			},
			config.JWT_SECRET, //Unique hashing key, must be secret
            {expiresIn: '1h'}) //Auth lasts 1hour

		return res.json({ status: 'ok', data: token })
	}

	res.json({ status: 'error', error: 'Invalid username/password' })
}

module.exports = { updateUser, register, login }