const express   = require('express')
const router    = express.Router()

const checkAuth = require('./checkAuth')

router.post('/updateUser', checkAuth.updateUser)
router.post('/register', checkAuth.register)
router.post('/login', checkAuth.login)

module.exports = router