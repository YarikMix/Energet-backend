const optimisationHybrid = require('../optimisation/calculation')
const calculationSP = require('../optimisation/API/SolarProd')
const calculationOneConf = require('../optimisation/API/OneConf')

class optimController {
    async begin(req, res, next) {
        const params = req.body
        //setTimeout(() => source.cancel(), 3000);
        const message = optimisationHybrid.calc(params)
        const ggg = await message;
        return res.json(ggg)
    }

    async SolarProd(req, res, next) {
        const params = req.body
        //setTimeout(() => source.cancel(), 3000);
        const message = calculationSP.calc(params)
        const ggg = await message;
        return res.json(ggg)
    }

    async OneConf(req, res, next) {
        const params = req.body
        //setTimeout(() => source.cancel(), 3000);
        const message = calculationOneConf.calc(params)
        const ggg = await message;
        return res.json(ggg)
    }

}

module.exports = new optimController()
