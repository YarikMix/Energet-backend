const TEF = require("./TechEconParr")

class OneConf {

    TEP(consumption, Vars, Energy_AfterDGS, params, Bat_LT) {
        let Ans = {
            RPS: TEF.RPS(Energy_AfterDGS[0],  consumption, params.load.type),
            CapEx: TEF.CapEx(Vars),
            OpEx: TEF.OpEx(Vars,  Bat_LT, Energy_AfterDGS[1], params.Econ.Lifetime),
            Economy: TEF.Economy(Energy_AfterDGS[0], params.Econ.ElCost,  consumption, params.Econ.Lifetime, params.Econ.Disc_Rate),
        }

        Ans.NPV = TEF.NPV(Energy_AfterDGS[0],  Ans.CapEx,  Ans.OpEx, params.Econ.ElCost,  consumption, params.Econ.Lifetime, params.Econ.Disc_Rate);
        Ans.LCOE = TEF.LCOE(Energy_AfterDGS[0],  Ans.CapEx,  Ans.OpEx,  consumption, params.Econ.Lifetime, params.Econ.Disc_Rate, params.Econ.ElCost);

        return Ans;
    }

    TEP_Thermostab(consumption, Vars, Balance, params, Bat_LT, RPS_TS) {
        let Ans = {
            RPS: RPS_TS,
            CapEx: TEF.CapEx(Vars),
            OpEx: TEF.OpEx(Vars,  Bat_LT, [0, 0, 0], params.Econ.Lifetime),
            Economy: TEF.Economy(Balance, params.Econ.ElCost,  consumption, params.Econ.Lifetime, params.Econ.Disc_Rate),
        }

        Ans.NPV = TEF.NPV(Balance,  Ans.CapEx,  Ans.OpEx, params.Econ.ElCost,  consumption, params.Econ.Lifetime, params.Econ.Disc_Rate);
        Ans.LCOE = TEF.LCOE(Balance,  Ans.CapEx,  Ans.OpEx,  consumption, params.Econ.Lifetime, params.Econ.Disc_Rate, params.Econ.ElCost);

        return Ans;
    }
}

module.exports = new OneConf()