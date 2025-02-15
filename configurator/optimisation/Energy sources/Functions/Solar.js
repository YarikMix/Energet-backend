class solar {
    K_BoS_T(temp) {
        let Ans;
        if (temp > 30) {
            Ans = (-0.46/30)*temp+1.46;
        } else {
            Ans = 1;
        }
        if (Ans < 0) Ans = 0;
        return Ans
    }

    K_BoS_P(power, Pnom){
        const K = power/Pnom;
        let Ans;
        if (K > 1) {
            Ans = (-0.844)*K+1.832;
        } else {
            if (K > 0.3) {
                Ans = 0.9887;
            } else {
                if (K > 0.03) {
                    Ans = (0.174)*K+0.936;
                } else {
                    Ans = (31.387)*K;
                }
            }
        }
        if (Ans < 0) Ans = 0;
        return Ans
    }

    K_angle(cosin){
        let Ans;
        if (cosin > 0.4) {
            Ans = 1;
        } else {
            Ans = (2.5)*cosin;
        }
        if (Ans < 0) Ans = 0;
        return Ans
    }

    K_WintSumm_Line(index){
        let Ans;
        let Wint = 0.75;
        let Summ = 1.1;
        if (index < (8760/2)-1) {
            Ans = ((Summ-Wint)/4379)*index + Wint;
        } else {
            Ans = ((Wint-Summ)/4380)*index + (Summ-((Wint-Summ)/4380)*4379);
        }
        return Ans
    }

    K_WintSumm_Binom(index){
        let Ans;
        let Wint = 0.9; //0.4
        let Summ = 1.1;
        Ans = ((Wint/19184400)-(Summ/19184400))*(index**2) + ((Summ/2190)-(Wint/2190))*(index) + Wint;
        return Ans
    }

    K_WintSumm_Sin(index){
        let Ans;
        let Wint = 0.8; //0.4
        let Summ = 1.25;
        Ans = ((Summ+Wint)/2)+((Summ-Wint)/2)*Math.sin(((index-372)/8759)*2*Math.PI-Math.PI/2);
        return Ans
    }

    Cos_T(D, Fi, W, Betta, Gamma){
        return Math.sin(D)*Math.sin(Fi)*Math.cos(Betta) - Math.sin(D)*Math.cos(Fi)*Math.sin(Betta)*Math.cos(Gamma) + Math.cos(D)*Math.cos(Fi)*Math.cos(Betta)*Math.cos(W) + Math.cos(D)*Math.sin(Fi)*Math.sin(Betta)*Math.cos(Gamma)*Math.cos(W) + Math.cos(D)*Math.sin(Betta)*Math.sin(Gamma)*Math.sin(W)
    }

    Gamma_S(D, W, Cos_T0){
        return Math.asin((-Math.sin(W)*Math.cos(D)) / Math.cos((Math.PI/2) - Math.acos(Cos_T0)))
    }

    Rec_Gamma_S(Gamma_S){
        let pi = Math.PI;
        let arr = [];
        for (let i = 0; i < Gamma_S.length; i += 24) {
            let start = i;
            let end = Math.min(i + 24, Gamma_S.length);
            let section = Gamma_S.slice(start, end);

            if (section.length < 2) {
                continue;
            }

            for (let j = 1; j < section.length; j++) {
                if ((section[j] > section[j-1]) && (j < section.length/2)) arr[start + j-1] = section[j-1] - pi;
                else if ((section[j] > section[j-1]) && (j > section.length/2)) arr[start + j-1] = section[j-1] + pi;
                else arr[start + j-1] = - section[j-1];
            }
            arr[start + section.length-1] = section[section.length-1] + pi;
        }
        return arr;
    }

    Betta_X(Betta, Gamma, Gamma_C){
        return Math.abs(Math.atan(Math.tan(Betta)*Math.cos(Gamma_C+Gamma)))
    }

    H_X(H, Betta, Betta_X){
        return Math.abs(H*((Math.sin(Betta))/(Math.sin(Betta_X))))
    }

    L_X(l, Gamma, Gamma_C){
        return Math.abs(l/(Math.cos(Gamma_C+Gamma)))
    }

    T_PV(temperature, GHI){
        return temperature + 0.0256 * GHI
    }

    Power(RatedPower, K_T, T_C, T_Ref, POA){
        return (RatedPower/1000)*(1+K_T*(T_C-T_Ref))*POA
    }

    Alpha_Shad_1(nn, i, L_X, H_X, Betta_X, ){
        return Math.atan((((nn-i+1)/nn)*H_X*Math.sin(Betta_X))/(L_X-((nn-i+1)/nn)*H_X*Math.cos(Betta_X)))
    }

    Alpha_Shad_2(nn, i, L_X, H_X, Betta_X, ){
        return Math.atan((((nn-i+1)/nn)*H_X*Math.sin(Betta_X))/(L_X+((nn-i+1)/nn)*H_X*Math.cos(Betta_X)))
    }

    POA(Cos_Tetta_0, Cos_Tetta, Cos_TettaPi, GHI){
        let POA_front = 0, POA_back = 0;
        if ((Cos_Tetta_0) > 0) {
            if ((Cos_Tetta) > 0) {
                if ((Cos_Tetta)/(Cos_Tetta_0) > 10) {
                    POA_front = GHI*10;
                } else {
                    POA_front = GHI*(Cos_Tetta)/(Cos_Tetta_0);
                }
            } else {
                POA_front = 0;
            }
            if ((Cos_TettaPi) > 0) {
                if ((Cos_TettaPi)/(Cos_Tetta_0) > 10) {
                    POA_back = GHI*10;
                } else {
                    POA_back = GHI*(Cos_TettaPi)/(Cos_Tetta_0);
                }
            } else {
                POA_back = 0;
            }
        }

        return [POA_front, POA_back]
    }

    index_Shad(shading, Gamma_C){
        let index_Shad = [], j = 0;
        let Shad_Gamma = shading.filter(async (element, index, array) => { 
            let cond = ((Gamma_C > element[0]) && (Gamma_C < element[1]));
            if (cond) {
                index_Shad[j] = index;
                j++;
            }
            return cond
        })
        return index_Shad
    }
    
}



module.exports = new solar()