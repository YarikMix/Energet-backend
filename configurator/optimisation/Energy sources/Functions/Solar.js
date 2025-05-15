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

    K_WintSumm_Binom_V2(index){
        let New_Ind = ((index/24)+1);
        let Ans = 1 + (-0.0000054213)*(New_Ind**2) + (0.0019390845)*(New_Ind) + (-0.2338046237);
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

    POA_V2(Cos_Tetta_0, Cos_Tetta, Cos_TettaPi, GHI, Diffuse){
        let POA_front = Diffuse, POA_back = Diffuse;
        if ((Cos_Tetta_0) > 0) {
            if ((Cos_Tetta) > 0) {
                POA_front = Diffuse + (GHI-Diffuse)*(Cos_Tetta)/(Cos_Tetta_0);
                if (POA_front > 1000) POA_front = 1000;
            }
            if ((Cos_TettaPi) > 0) {
                POA_back = Diffuse + (GHI-Diffuse)*(Cos_TettaPi)/(Cos_Tetta_0);
                if (POA_back > 1000) POA_back = 1000;
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

    X_F_grd(H, h, a, B, Gamma_C, Gamma){
        let ans;
        // let cond_1 = ((Gamma_C > Gamma - (Math.PI/2) + (Math.PI/180)) && (Gamma_C < Gamma + (Math.PI/2) - (Math.PI/180)));
        // let cond_2 = ((Gamma_C < Gamma - (Math.PI/2) - (Math.PI/180)) || (Gamma_C > Gamma + (Math.PI/2) + (Math.PI/180)));
        // let cond = cond_1 || cond_2;
        // if (((a) > 0) && (cond)) ans = (1-Math.cos(B))/2;
        if ((a) > 5*Math.PI/180) ans = (1-Math.cos(B))/2;
        else ans = 0;
        if (ans < 0) ans = 0

        // if ((ans < 0) || (ans > 1)) ans = 0;

        return ans
    }
    
    X_R_usgrd(H, h, a, B, Gamma_C, Gamma){
        let ans;
        // let cond_1 = ((Gamma_C > Gamma - (Math.PI/2) + (Math.PI/180)) && (Gamma_C < Gamma + (Math.PI/2) - (Math.PI/180)));
        // let cond_2 = ((Gamma_C < Gamma - (Math.PI/2) - (Math.PI/180)) || (Gamma_C > Gamma + (Math.PI/2) + (Math.PI/180)));
        // let cond = cond_1 || cond_2;
        // if (((a) > 0) && (cond)) {
        if ((a) > 5*Math.PI/180) {
            let AC = this.AC(H, h, a, B);
            let EC = this.EC(H, h, a, B);
            let AE = this.AE(H, h, a, B);
            let BC = this.BC(H, h, a, B);
            let BE = this.BE(H, h, a, B);
            let AB = H;
            let CF = this.CF(H, h, a, B);
            let AF = this.AF(H, h, a, B);
            let BF = this.BF(H, h, a, B);
            let X_R_EC = this.X_R_EC(AC, EC, AE, BC, BE, AB);
            let X_R_FY = this.X_R_FY(B, AC, CF, AF, BC, BF, AB);
            ans = (X_R_FY + X_R_EC);
            if (ans < 0) ans = 0
        } else ans = 0;

        // if ((ans < 0) || (ans > 1)) ans = 0;
        
        return ans
    }

    X_R_FY(B, AC, CF, AF, BC, BF, AB){
        let F_1 = (1+Math.cos(B))/2;
        let F_2 = (AC+CF-AF)/(2*AC);
        // if (F_2 < 0) F_2 = 0;
        let F_3 = (BC+CF-BF)/(2*BC);
        // if (F_3 < 0) F_3 = 0;
        return ((F_1-F_2)*AC-(F_1-F_3)*BC)/AB;
    }

    AC(H, h, a, B){
        let F_1 = (H*Math.cos(B)+h/Math.tan(B))**2;
        let F_2 = (h+H*Math.sin(B))**2;
        return (F_1+F_2)**(1/2)
    }

    BC(H, h, a, B){
        return h/Math.sin(B);
    }

    CF(H, h, a, B){
        let F_1 = H*Math.sin(a+B)/Math.sin(a);
        let F_2 = H/Math.tan(B);
        let F_3 = H/Math.tan(a);
        return F_1+F_2+F_3;
    }

    AF(H, h, a, B){
        let f_1 = H*Math.cos(B);
        let f_2 = (h*Math.cos(a)+H*Math.cos(a+B))/Math.sin(a)
        let F_1 = (f_1-f_2)**2;
        let F_2 = (h+H*Math.sin(B))**2;
        return (F_1+F_2)**(1/2)
    }

    BF(H, h, a, B){
        let F_1 = ((h*Math.cos(a)+H*Math.sin(a+B))/Math.sin(a))**2
        let F_2 = h**2;
        return (F_1+F_2)**(1/2)
    }

    X_R_EC(AC, EC, AE, BC, BE, AB){
        let F_2 = (AC+EC-AE)/(2*AC);
        // if (F_2 < 0) F_2 = 0;
        let F_3 = (BC+EC-BE)/(2*BC);
        // if (F_3 < 0) F_3 = 0;
        return ((F_2)*AC-(F_3)*BC)/AB;
    }

    AE(H, h, a, B){
        let f_1 = H*Math.cos(B);
        let f_2 = h/Math.tan(a);
        let F_1 = (f_1-f_2)**2;
        let F_2 = (h+H*Math.sin(B))**2;
        return (F_1+F_2)**(1/2)
    }

    EC(H, h, a, B){
        let F_1 = 1/Math.tan(a);
        let F_2 = 1/Math.tan(B);
        return h*(F_1+F_2)
    }

    BE(H, h, a, B){
        return h/Math.sin(a);
    }

    X_R_sgrd(H, h, a, B, Gamma_C, Gamma){
        let ans;
        // let cond_1 = ((Gamma_C > Gamma - (Math.PI/2) + (Math.PI/180)) && (Gamma_C < Gamma + (Math.PI/2) - (Math.PI/180)));
        // let cond_2 = ((Gamma_C < Gamma - (Math.PI/2) - (Math.PI/180)) || (Gamma_C > Gamma + (Math.PI/2) + (Math.PI/180)));
        // let cond = cond_1 || cond_2;
        // if (((a) > 0) && (cond)) {
        if ((a) > 5*Math.PI/180) {
            let AE = this.AE(H, h, a, B);
            let BF = this.BF(H, h, a, B);
            let BE = this.BE(H, h, a, B);
            let AF = this.AF(H, h, a, B);
            let AB = H;
            // if (AE < BE) BE = AE;
            // if (BF < AF) AF = BF;
            ans = (AE+BF-BE-AF)/(2*AB);
            if (ans < 0) ans = 0
        } else ans = 0;

        // if ((ans < 0) || (ans > 1)) ans = 0;
        
        return ans
    }

}



module.exports = new solar()