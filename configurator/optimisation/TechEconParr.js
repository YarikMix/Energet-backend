const {LOAD_TYPE} = require("../utils/consts")

class TEF {

    RPS(energy, cons, params_load_type) {
        let reliability, prev_rel = 0, prev_cons = 0;

        switch (params_load_type) {
            case LOAD_TYPE[0]:
                for (let i = 0; i < 8760; i++) {
                    if (energy[i] < 0) prev_rel = prev_rel - energy[i];
                    prev_cons = prev_cons + cons[i];
                }
                reliability = (prev_cons - prev_rel)/prev_cons;
            break;      
            case LOAD_TYPE[1]:
                reliability = energy/cons;
            break; 
        }

        return reliability;
    }

    CapEx(Varsn) {
        const spic_Costs = [100000, 150000, 1000000, 25000, 0, 30000, 0, 130000];
        let Cost = 0;
        for (let i = 0; i < Varsn.length; i++) {
            Cost = Cost + Varsn[i]*spic_Costs[i]/1000;
        }

        return Cost;
    }

    OpEx(Varsn, ageAB, DGS, lifeTime) {
        const spic_Costs = [100000, 150000, 1000000, 25000, 0, 30000, 0, 130000];
        const FuelCost = 55; // руб/кВт*ч (60 р/кВтч - 250 р/л)
        let CostAB = Varsn[5]*spic_Costs[5]/1000;
        let OpEx_AB;
        if (1/ageAB > lifeTime) OpEx_AB = 0;
        else OpEx_AB = (lifeTime*ageAB - 1)*CostAB/lifeTime;

        let CostDGS = Varsn[3]*spic_Costs[3]/1000;
        let OpEx_DGS = ((lifeTime*DGS[2] - 1)*CostDGS/lifeTime) + (DGS[1]*FuelCost/1000);

        let finalOpEx = OpEx_AB + OpEx_DGS + spic_Costs[7]/6;

        return finalOpEx;
    }

    NPV(Energy, CapEx, OpEx, ElCost, cons, Years, R) {
        let EnConsumed = 0;
        let EnSale = 0;

        for (let i = 0; i < 8760; i++) {
            if (Energy[i] <= 0) EnConsumed = EnConsumed + cons[i] + Energy[i];
            else {
                EnConsumed = EnConsumed + cons[i];
                EnSale = EnSale + Energy[i];
            }
        }

        let Payback = - CapEx;
        for (let i = 0; i < Years; i++) {
            Payback = Payback + ((((ElCost*((1.1)**i)*EnConsumed+ElCost*EnSale))/1000) - OpEx)/((1+R)**i);
        }

        return Payback;
    }

    LCOE(Energy, CapEx, OpEx, cons, Years, R,ElCost) {
        let EnConsumed = 0, EnShouldConsumed = 0;
        let EnSale = 0;

        for (let i = 0; i < 8760; i++) {
            EnShouldConsumed = EnShouldConsumed + cons[i];
            if (Energy[i] <= 0) EnConsumed = EnConsumed + cons[i] + Energy[i];
            else {
                EnConsumed = EnConsumed + cons[i];
                EnSale = EnSale + Energy[i];
            }
        }

        let Expenses = CapEx;
        for (let i = 0; i < Years; i++) {
            Expenses = Expenses + (OpEx)/((1+R)**i);
        }
        let EnProd = 0
        for (let i = 0; i < Years; i++) {
            EnProd = EnProd + (EnConsumed/1000)/((1+R)**i);
        }
        let LCOE = Expenses/EnProd

        return LCOE;
    }

    Economy(Energy, ElCost, cons, Years, R) {
        let EnConsumed = 0;
        let EnSale = 0;

        for (let i = 0; i < 8760; i++) {
            if (Energy[i] <= 0) EnConsumed = EnConsumed + cons[i] + Energy[i];
            else {
                EnConsumed = EnConsumed + cons[i];
                EnSale = EnSale + Energy[i];
            }
        }

        let Payback = 0;
        for (let i = 0; i < Years; i++) {
            Payback = Payback + ((ElCost*((1.1)**i)*EnSale+ElCost*((1.1)**i)*EnConsumed)/1000)/((1+R)**i);
            // Payback = Payback + ((ElCost*((1.1)**i)*EnConsumed+4*EnSale)/1000)/((1+R)**i);
        }

        return Payback;
    }

}

module.exports = new TEF()