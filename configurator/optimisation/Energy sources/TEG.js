const TEGFunc = require("./Functions/TEG")

class TEG {

    production (temperature_amb, temperature_s, P_rated) {

        if (P_rated <= 0) return Array.from({ length: 8760 } , (_, i) => 0);

        let power = [];
        let teg = {
            "n": 127,
            "R_nom": 2.3,
            "R_l": 2.3,
            "T_pressure": 10,
            "T_amb": Array.from({ length: 8760 } , (_, i) => temperature_amb[i] + 273.15),
            "T_s": Array.from({ length: 8760 } , (_, i) => temperature_s[i] + 273.15)
        }
        teg.T_av = Array.from({ length: 8760 } , (_, i) => (teg.T_amb[i] + teg.T_s[i])/2);
        let alpha = Array.from({ length: 8760 } , (_, i) => (TEGFunc.Alpha_Zeeb_n(teg.T_av[i]) + TEGFunc.Alpha_Zeeb_p(teg.T_av[i]))/2);
        let U_0 = Array.from({ length: 8760 } , (_, i) => TEGFunc.U_0(teg.n, alpha[i], teg.T_amb[i], teg.T_s[i], teg.T_pressure));

        power = Array.from({ length: 8760 } , (_, i) => (P_rated/0.01)*teg.R_l*((U_0[i]/(teg.R_nom+teg.R_l))**2));

        return power
    }

}

module.exports = new TEG()