const BatteryFunc = require("./Functions/Battery")
const {COP_X, COP_Y, COP_Z} = require("../../utils/COP_data")
const ConsFunc = require("../Consumption/functions")

const TYPES = ["LiFePO4", "MLG", "ML", "LiLTO"]

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
            },
            "LiLTO": {
                "SoC_min": 0.2,
                "K_lifespan": [358024.7, -716049, 368024.7],
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
        } else if (type == TYPES[3]) {
            TypeAB = types.LiLTO;
        }

        const Koef_T = {
            // "Lifespan": [-3.21816*(10**(-10)), 4.32301*(10**(-8)), -1.34834*(10**(-6)), -2.90576*(10**(-5)), 0.000892229, 0.027401, 0.36237],
            "Lifespan": [0, 0, 0, 0, -0.0002, 0.0117, 0.8449],
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

    energy_out_Thermostab (Energy_Summ, capacity, type, temperature, HeatLoad, InstHP, FreqWindow, temperatureHP) {
        let pereshet = [];
        let consumption = [];
        let HP_Power, HP_Freq = [], COP = [];
        let ThermoStab = 0;
        let Local_T = 0;
        
        if (capacity <= 0) {
            for (let i = 0; i < 8760; i++) {
                pereshet[i] = Energy_Summ[i];
                consumption[i] = 0;
                COP[i] = 0;
                HP_Freq[i] = 0;
                if (temperatureHP[i] > 5) {
                    [HP_Power, HP_Freq[i]] = this.NormPower(Energy_Summ[i], InstHP, FreqWindow);
                    consumption[i] = HP_Power;
                    Local_T = temperatureHP[i]+30;
                    if (Local_T >= 60) {Local_T = 59.99999;}
                    COP[i] = ConsFunc.Get_COP(HP_Freq[i], Local_T, COP_X, COP_Y, COP_Z);
                    ThermoStab = ThermoStab + consumption[i]*(COP[i]-1);
                    if (ThermoStab > HeatLoad*1.5) {
                        ThermoStab = HeatLoad*1.5;
                        consumption[i] = 0;
                    }
                }
            }
            ThermoStab = ThermoStab/HeatLoad;
            return [pereshet, 1, ThermoStab, consumption, HP_Freq, COP, 1];
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
            },
            "LiLTO": {
                "SoC_min": 0.2,
                "K_lifespan": [358024.7, -716049, 368024.7],
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
        } else if (type == TYPES[3]) {
            TypeAB = types.LiLTO;
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

            pereshet[i-1] = Energy_Summ[i-1] + charge.norm[i-1] - TypeAB.SoC_min*capacity_T[i-1];
            consumption[i-1] = 0;
            COP[i-1] = 0;
            HP_Freq[i-1] = 0;
            if (temperatureHP[i-1] > 5) {
                [HP_Power, HP_Freq[i-1]] = this.NormPower(pereshet[i-1], InstHP, FreqWindow);
                consumption[i-1] = HP_Power;
                Local_T = temperatureHP[i-1]+30;
                if (Local_T >= 60) {Local_T = 59.99999;}
                COP[i-1] = ConsFunc.Get_COP(HP_Freq[i-1], Local_T, COP_X, COP_Y, COP_Z);
                ThermoStab = ThermoStab + consumption[i-1]*(COP[i-1]-1);
                if (ThermoStab > HeatLoad*1.5) {
                    ThermoStab = HeatLoad*1.5;
                    consumption[i-1] = 0;
                }
            }

            charge.norm[i] = charge.norm[i-1] + Energy_Summ[i-1] - consumption[i-1];
            charge.over[i] = charge.norm[i];
            if (charge.norm[i] > capacity_T[i-1]) charge.norm[i] = capacity_T[i-1];
            else if (charge.norm[i] < TypeAB.SoC_min*capacity_T[i-1]) charge.norm[i] = TypeAB.SoC_min*capacity_T[i-1];
            charge.SoC[i] = charge.norm[i]/capacity_T[i-1];
            energy[i-1] = charge.norm[i-1] - charge.norm[i] + Energy_Summ[i-1] - consumption[i-1];
            if (Math.abs(energy[i-1]) < 10**(-6)) energy[i-1] = 0;

            if ((i > 2) & (charge.SoC[i-2] > charge.SoC[i-1]) & (charge.SoC[i-1] <= charge.SoC[i])) {
                AB.age += BatteryFunc.DischargeLoss(TypeAB.K_lifespan, Koef_T.Lifespan, charge.SoC[i-1], temperature[i-1]);
            }
        }
        ThermoStab = ThermoStab/HeatLoad;

        return [energy, AB.age, ThermoStab, consumption, HP_Freq, COP, charge.SoC];
        // return [energy, AB.age]
    }

    NormPower (Energy, InstHP, FreqWindow) {

        let Power = 0;
        let Freq = 0;
        let EnWindow = [InstHP*FreqWindow[0]/50, InstHP*FreqWindow[1]/50]
        if (Energy < EnWindow[0]) {
            Power = 0;
            Freq = 0;
        } else if ((Energy >= EnWindow[0]) && (Energy < EnWindow[1])) {
            Power = Energy;
            Freq = FreqWindow[0] + (FreqWindow[1] - FreqWindow[0])*(Energy - EnWindow[0])/(EnWindow[1] - EnWindow[0])
        } else {
            Power = EnWindow[1];
            Freq = FreqWindow[1];
        }

        return [Power, Freq]
    }

}

module.exports = new Battery()