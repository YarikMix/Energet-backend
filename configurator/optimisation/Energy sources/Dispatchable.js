
class Dispatchable {

    resEnergy (Energy_Summ, rPower, name, refining) {

        if (rPower <= 0) {
            let pereshet = [];
            for (let i = 0; i < 8760; i++) {
                pereshet[i] = Energy_Summ[i];
            }
            return [pereshet, [0, 0, 0]];
        } 

        let maxLack = -1*Math.min.apply(null, Energy_Summ);

        let dispPower = maxLack*rPower;
        if (refining == 1) dispPower = rPower;
        if (refining == 2) dispPower = maxLack;
        let power = [], Energy = [], summ = 0, motoH = 0;
        for (let z = 0; z < Energy_Summ.length; z++) {
            Energy[z] = Energy_Summ[z];
            power[z] = 0;
            if (Energy_Summ[z] <= 0) {
                if (Energy_Summ[z] > -1*dispPower) {
                    Energy[z] = 0;
                    power[z] = -1*Energy_Summ[z];
                } else {
                    Energy[z] = Energy_Summ[z] + dispPower;
                    power[z] = dispPower;
                }
            }

            motoH ++;
            summ += power[z];
        }
        motoH = motoH/5000;

        return [Energy, [dispPower, summ, motoH]]
    }

}

module.exports = new Dispatchable()