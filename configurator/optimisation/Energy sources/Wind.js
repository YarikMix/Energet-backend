const WindFunc = require("./Functions/Wind")

class wind {

     production (Wind_Speed, Pressure, Temperature, H, P_rated) {

        if (P_rated <= 0) return Array.from({ length: 8760 } ,  (_, i) => 0);

        let power = [];
        const V = {
            "min": 1.5,
            "max": 11,
            "nom": 10,
            "stop": 18,
            "wind": []
        }
        const Density = {
            "nom": WindFunc.Density(101325, 0),
            "distr": Array.from({ length: 8760 } , (_, i) => WindFunc.Density((Pressure)[i], (Temperature)[i]))
        }
        V.wind = Array.from({ length: 8760 } , (_, i) => WindFunc.Wind_H(H, (Wind_Speed)[i]));
        power = Array.from({ length: 8760 } , (_, i) => WindFunc.power(P_rated,  V.wind[i], V.min, V.max, V.nom, V.stop, Density.nom,  Density.distr[i]));

        return power
    }

}

module.exports = new wind()