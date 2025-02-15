const SolarFunc = require("./Functions/Solar")

class solar {

    production (coords, horisons, shads, GHI, temperature, RatedPower, orient) {

        if (RatedPower <= 0) return Array.from({ length: 8760 } ,  (_, i) => 0);

        const days = {
            "month": [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            "year": Array.from({ length: 365 }, (_, i) => i + 1),
            "hours": Array.from({ length: 24 }, (_, i) => i)
        }
        const coordinates = {
            "latitude": (Math.PI/180)*coords[0],
            "longtitude": coords[1]
        }
        const shading = {
            "gamma": Array.from(shads , (_, i) => [shads[i][0], shads[i][1]]),
            "height": Array.from(shads , (_, i) => shads[i][2]),
            "distance": Array.from(shads , (_, i) => shads[i][3]),
            "alpha": Array.from(shads , (_, i) => 0)
        }
        shading.alpha = Array.from(shads , (_, i) => Math.atan(shading.height[i]/shading.distance[i]));
    
        const horison = {
            "gamma": Array.from(horisons , (_, i) => horisons[i][0]),
            "alpha": Array.from(horisons , (_, i) => horisons[i][1])
        }
        const orientation = {
            "gamma": orient[0],
            "betta": orient[1],
            "pitch": orient[2],
            "nn": orient[3]
        }
        const PV = {
            "T_ref": 38.8,
            "K_T": -2.85*10**(-3),
            "K_bifacial": 0, //0.9,
            "H": 1
        }
        
        let angle = {
            "D": Array.from({ length: 8760 }, (_, i) => (Math.PI/180)*23.5 * Math.sin( (360/365) * (Math.PI/180) * (days.year[Math.floor(i/24)]-81) )),
            "D_Shifted": Array.from({ length: 8760 }, (_, i) => (Math.PI/180)*23.5 * Math.sin( (360/365) * (Math.PI/180) * (days.year[Math.floor(i/24)]-81) )),
            "W": Array.from({ length: 8760 }, (_, i) => (Math.PI/180)*15 * (days.hours[i-Math.floor(i/24)*24]-12)),
            "W_Shifted": Array.from({ length: 8760 }, (_, i) => (Math.PI/180)*15 * (days.hours[i-Math.floor(i/24)*24]-12+coordinates.longtitude/15)),
            "shift": Math.round(coordinates.longtitude/15)
        }
        angle.D_Shifted = angle.D_Shifted.splice(angle.shift).concat(angle.D_Shifted);

        const Cos = {
            "Tetta": Array.from({ length: 8760 }, (_, i) => SolarFunc.Cos_T(angle.D_Shifted[i], coordinates.latitude, angle.W_Shifted[i], orientation.betta, orientation.gamma)),
            "TettaPi": Array.from({ length: 8760 }, (_, i) => SolarFunc.Cos_T(angle.D_Shifted[i], coordinates.latitude, angle.W_Shifted[i], Math.PI - orientation.betta, Math.PI + orientation.gamma)),
            "Tetta_0_notShift": Array.from({ length: 8760 }, (_, i) => SolarFunc.Cos_T(angle.D[i], coordinates.latitude, angle.W[i], 0, orientation.gamma)),
            "Tetta_0": Array.from({ length: 8760 }, (_, i) => SolarFunc.Cos_T(angle.D_Shifted[i], coordinates.latitude, angle.W_Shifted[i], 0, orientation.gamma))
        }

        let angle_Sun = {
            "Gamma_C": Array.from({ length: 8760 },  (_, i) => SolarFunc.Gamma_S(angle.D[i], angle.W[i],  Cos.Tetta_0_notShift[i])),
            "Alpha": Array.from({ length: 8760 },  (_, i) => (Math.PI/2) - Math.acos( Cos.Tetta_0[i]))
        }

        angle_Sun.Gamma_C =  SolarFunc.Rec_Gamma_S(angle_Sun.Gamma_C);
        angle_Sun.Gamma_C = angle_Sun.Gamma_C.splice(angle.shift).concat(angle_Sun.Gamma_C);

        let Geometry = {
            "Betta_X": Array.from({ length: 8760 },  (_, i) => SolarFunc.Betta_X(orientation.betta, orientation.gamma,  angle_Sun.Gamma_C[i])),
            "L_X": Array.from({ length: 8760 },  (_, i) => SolarFunc.L_X(orientation.pitch, orientation.gamma,  angle_Sun.Gamma_C[i]))
        }
        Geometry.H_X = Array.from({ length: 8760 },  (_, i) => SolarFunc.H_X(PV.H, orientation.betta,  Geometry.Betta_X[i]));

        let Limit_Alpha = {
            "front": Array.from({ length: 8760 },  (_, i) => SolarFunc.Alpha_Shad_1(orientation.nn, 1,  Geometry.L_X[i],  Geometry.H_X[i],  Geometry.Betta_X[i])),
            "back": Array.from({ length: 8760 },  (_, i) => SolarFunc.Alpha_Shad_2(orientation.nn, 1,  Geometry.L_X[i],  Geometry.H_X[i],  Geometry.Betta_X[i]))
        }

        let POA = {
            "front": Array.from({ length: 8760 }, (_, i) => 0),
            "back": Array.from({ length: 8760 }, (_, i) => 0),
            "summ": Array.from({ length: 8760 }, (_, i) => 0),
            "shad_SP": Array.from({ length: 8760 }, (_, i) => 0),
            "shad_hor": Array.from({ length: 8760 }, (_, i) => 0),
            "shad_outer": Array.from({ length: 8760 }, (_, i) => 0),
        }

        let power = {
            "front": Array.from({ length: 8760 }, (_, i) => 0),
            "back": Array.from({ length: 8760 }, (_, i) => 0),
            "summ": Array.from({ length: 8760 }, (_, i) => 0),
        }

        for (let i = 0; i < 8760; i++) {
            let Get_POA =  SolarFunc.POA( Cos.Tetta_0[i],  Cos.Tetta[i],  Cos.TettaPi[i], GHI[i]);
            POA.front[i] = Get_POA[0]*( SolarFunc.K_angle( Cos.Tetta[i]));
            POA.back[i] = Get_POA[1]*( SolarFunc.K_angle( Cos.TettaPi[i]));
            POA.summ[i] = Get_POA[0] + Get_POA[1];

            if (( Cos.Tetta[i] > 0) && ( angle_Sun.Alpha[i] <  Limit_Alpha.front[i]) && ( Cos.Tetta_0[i] > 0)) {
                POA.front[i] = 0;
            }
            if (( Cos.TettaPi[i] > 0) && ( angle_Sun.Alpha[i] <  Limit_Alpha.back[i]) && ( Cos.Tetta_0[i] > 0)) {
                POA.back[i] = 0;
            }
 
            let index_Shad =  SolarFunc.index_Shad(shading.gamma,  angle_Sun.Gamma_C[i]);
            if (( index_Shad).length != 0) {
                index_Shad.forEach( (element, index, array) => { 
                    if ( angle_Sun.Alpha[i] < shading.alpha[element]) {
                        POA.front[i] = 0;
                        POA.back[i] = 0;
                    }
                });
            }   

            horison.gamma.forEach( (element, index, array) => { 
                let cond = 0;
                if (index != array.length-1) cond = (( angle_Sun.Gamma_C[i] > element) && ( angle_Sun.Gamma_C[i] <= array[index+1]));
                if (cond) {
                    let alpha_hor = ((horison.alpha[index]-horison.alpha[index+1])*(horison.gamma[index+1]- angle_Sun.Gamma_C[i])/(horison.gamma[index+1]-horison.gamma[index]))+horison.alpha[index+1];
                    if ( angle_Sun.Alpha[i] < alpha_hor) {
                        POA.front[i] = 0;
                        POA.back[i] = 0;
                    }
                }
            })

            power.front[i] =  SolarFunc.Power(RatedPower, PV.K_T,  SolarFunc.T_PV(temperature[i], GHI[i]), PV.T_ref, POA.front[i]);
            power.back[i] = PV.K_bifacial*  SolarFunc.Power(RatedPower, PV.K_T,  SolarFunc.T_PV(temperature[i], GHI[i]), PV.T_ref, POA.back[i]);

            power.front[i] = power.front[i]*( SolarFunc.K_BoS_P(power.front[i], RatedPower))*( SolarFunc.K_BoS_T(temperature[i]))*0.92*( SolarFunc.K_WintSumm_Sin(i));
            power.back[i] = power.back[i]*( SolarFunc.K_BoS_P(power.back[i], RatedPower))*( SolarFunc.K_BoS_T(temperature[i]))*0.92*( SolarFunc.K_WintSumm_Sin(i));
            power.summ[i] = power.front[i] + power.back[i];

        }

        return power.summ

    }

}

module.exports = new solar()