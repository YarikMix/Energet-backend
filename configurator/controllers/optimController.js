const optimisationHybrid = require("../optimisation/calculation");
const calculationSP = require("../optimisation/API/SolarProd");

class optimController {
  async begin(req, res, next) {
    const params = req.body;
    //setTimeout(() => source.cancel(), 3000);
    const message = await optimisationHybrid.calc(params);
    return res.json(message["Vars"][0]);
  }

  async SolarProd(req, res, next) {
    const params = req.body;
    //setTimeout(() => source.cancel(), 3000);
    const message = calculationSP.calc(params);
    const ggg = await message;
    return res.json(ggg);
  }
}

module.exports = new optimController();
