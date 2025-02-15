const Router = require('express')
const router = new Router()
const optimController = require('../controllers/optimController')

router.post('/', optimController.begin)
router.post('/SolarProd', optimController.SolarProd)


module.exports = router
