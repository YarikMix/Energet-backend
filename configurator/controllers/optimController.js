const optimisationHybrid = require("../optimisation/calculation");
const calculationSP = require("../optimisation/API/SolarProd");

class optimController {
  async begin(req, res) {
    try {
      const params = req.body;
      const message = await optimisationHybrid.calc(params);
      return res.json(message["Vars"][0]);
    } catch {
      return res.sendStatus(405);
    }
  }

  async SolarProd(req, res) {
    const params = req.body;
    const message = calculationSP.calc(params);
    const ggg = await message;
    return res.json(ggg);
  }
}

module.exports = new optimController();
