const Router = require('express')
const router = new Router()
const optimRouter = require('./optimRouter')

router.use('/optim', optimRouter)

module.exports = router
