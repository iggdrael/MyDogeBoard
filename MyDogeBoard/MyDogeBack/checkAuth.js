const User      = require('./user')
const bcrypt    = require('bcryptjs')
const jwt       = require('jsonwebtoken')
const config 	= require('./config')


const updateUser =  async (req, res) => {
	const { token } = req.body

	try {
		const user = jwt.verify(token, config.JWT_SECRET)

		const _id = user.id
		await User.updateOne(
			{ _id },
			{
				$set: { cryptosList: [
					{symbol:"BTC", amount: 0.2},
					{symbol:"LTC", amount: 1},
					{symbol:"ETH", amount: 1},
					{symbol:"BNB", amount: 1},
					{symbol:"BNT", amount: 4},
					{symbol:"USDT", amount: 1},
					{symbol:"OMG", amount: 8},
					{symbol:"LINK", amount: 1},
					{symbol:"ENJ", amount: 4},
					{symbol:"MANA", amount: 1},
					{symbol:"ADA", amount: 9},
					{symbol:"XLM", amount: 1},
					{symbol:"THETA", amount: 1},
					{symbol:"REN", amount: 1},
					{symbol:"BAND", amount: 4},
					{symbol:"EUR", amount: 1},
					{symbol:"FTT", amount: 1},
					{symbol:"SOL", amount: 1},
					{symbol:"DOT", amount: 1},
					{symbol:"RUNE", amount: 18},
					{symbol:"YFI", amount: 1},
					{symbol:"OCEAN", amount: 1},
					{symbol:"RSR", amount: 1},
					{symbol:"EGLD", amount: 1},
				] }
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
		console.log('Le compte a bien été créé', response)
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
		return res.json({ status: 'error', error: 'Invalid username/password' })
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