const BatteryFunc = require("./Functions/Battery")

const TYPES = ["LiFePO4", "MLG", "ML"]

class Battery { // скорость разряда и заряда влияют на срок службы; потери при разряде/заряде

    energy_out (Energy_Summ, capacity, type, temperature) {
        if (capacity <= 0) {
            let pereshet = [];
            for (let i = 0; i < 8760; i++) {
                pereshet[i] = Energy_Summ[i];
            }
            return [pereshet, 1];
        } 

        const types = {
            "LiFePO4": {
                "SoC_min": 0.2,
                "K_lifespan": [5714, -14571, 11857],
                "Charge_rate": 1,
                "K_discharge": [0, 0, 1]
            },
            "MLG": {
                "SoC_min": 0.8,
                "K_lifespan": [2555, -5111, 3103],
                "Charge_rate": 1,
                "K_discharge": [0, 0, 1]
            },
            "ML": {
                "SoC_min": 0.8,
                "K_lifespan": [1837, -3673, 2087],
                //"K_lifespan": [7000, -13100, 7100],
                "Charge_rate": 1,
                "K_discharge": [0, 0, 1]
            }
        }

        let TypeAB = types.LiFePO4;
        if (type == TYPES[0]) {
            TypeAB = types.LiFePO4;
        } else if (type == TYPES[1]) {
            TypeAB = types.MLG;
        } else if (type == TYPES[2]) {
            TypeAB = types.ML;
        }

        const Koef_T = {
            "Lifespan": [-3.21816*(10**(-10)), 4.32301*(10**(-8)), -1.34834*(10**(-6)), -2.90576*(10**(-5)), 0.000892229, 0.027401, 0.36237],
            "Capacity": [-7*(10**(-5)), 0.0075, 0.8609]
        }

        let energy = [];
        let charge = {
            "norm": [],
            "over": [],
            "SoC": [],
        };
        let AB = {
            "age": 0,
        }
        let capacity_T = Array.from({ length: 8760 } , (_, i) => capacity*BatteryFunc.Cap_corr(Koef_T.Capacity, temperature[i]));

        charge.norm[0] = capacity_T[0];
        charge.over[0] = charge.norm[0];
        charge.SoC[0] = 1;

        for (let i = 1; i < 8761; i++) {
            charge.norm[i] = charge.norm[i-1] + Energy_Summ[i-1];
            charge.over[i] = charge.norm[i];
            if (charge.norm[i] > capacity_T[i-1]) charge.norm[i] = capacity_T[i-1];
            else if (charge.norm[i] < TypeAB.SoC_min*capacity_T[i-1]) charge.norm[i] = TypeAB.SoC_min*capacity_T[i-1];
            charge.SoC[i] = charge.norm[i]/capacity_T[i-1];
            energy[i-1] = charge.norm[i-1] - charge.norm[i] + Energy_Summ[i-1];
            if (Math.abs(energy[i-1]) < 10**(-6)) energy[i-1] = 0;

            if ((i > 2) & (charge.SoC[i-2] > charge.SoC[i-1]) & (charge.SoC[i-1] <= charge.SoC[i])) {
                AB.age += BatteryFunc.DischargeLoss(TypeAB.K_lifespan, Koef_T.Lifespan, charge.SoC[i-1], temperature[i-1]);
            }
        }
        
        return [energy, AB.age, charge.SoC]
    }

}

module.exports = new Battery()