const {NAME_FUND} = require("../../utils/consts")
const Solar = require("../Energy sources/Solar")

class TermalStab {

    SnowPack(GHI, temperature_2m_mean, snowfall_sum) {

        const Alpha = 25;
        const Lambda = 330000;
        const Rho = 700;
        const C = 2100;

        const Albedo_Snow = 0.8;

        const Delta = 1000/Rho;
        const DDF_T = (Alpha*24*60*60*Delta)/Lambda;

        let GHI_Sum = Array.from({ length: 365 } , (_, i) => 0);
        let counter = 0;

        for (let i = 0; i < 365; i++) {
            for (let j = 0; j < 24; j++) {
                GHI_Sum[i] = GHI_Sum[i] + GHI[counter]*3600;
                counter ++;
            }
            GHI_Sum[i+365] = GHI_Sum[i];
        }
        
        let Snowpack = Array.from({ length: 2*365 } , (_, i) => 0);
        let MS = 0;
        Snowpack[0] = snowfall_sum[0]*10;
        for (let i = 1; i < 2*365; i++) {
            if (temperature_2m_mean[i] <= 0) MS = 0;
            else MS = DDF_T*temperature_2m_mean[i];
            Snowpack[i] = Snowpack[i-1] + snowfall_sum[i]*10 - MS - (1-Albedo_Snow)*this.MS_I(GHI_Sum[i], temperature_2m_mean[i], Delta, Lambda, C);
            if (Snowpack[i] < 0) Snowpack[i] = 0;
        }

        let Result_Day = Array.from({ length: 365 } , (_, i) => Snowpack[i+365]);
        let Result_Hour = Array.from({ length: 8760 } , (_, i) => Result_Day[Math.floor(i/24)]>0);
        
        return Result_Hour;
    }

    MS_I(GHI, T, Delta, Lambda, C) {
       
        let ResMS_I = 0;
        if (T >= 0) ResMS_I = Delta*GHI/Lambda;
        else ResMS_I = Delta*GHI/(Lambda+C*(0-T));

        return ResMS_I;
    }

    Heat_Load(S, name, GHI, temperature_TMY, wind_TMY, temperature_2m_mean, snowfall_sum) {
       
        let snowpack = this.SnowPack(GHI, temperature_2m_mean, snowfall_sum);

        const Albedo_WithoutSnow = 0.25;
        const K_Hwind = 0.373;
        const K_wind_Ekr = 0.3;
        const K_GHI_ekr = 0.05;

        let h = Array.from({ length: 8760 }, (_, i) => 0); 
        let GHI_Ground = Array.from({ length: 8760 }, (_, i) => 0);
        let Q = 0;

        for (let i = 0; i < 8760; i++) {
            switch (name) {
                case NAME_FUND[0]: 
                    if (temperature_TMY[i] < 0) {
                        h[i] = 6.16 + 4.19*wind_TMY[i]*K_Hwind;
                    } else {
                        h[i] = 6.16 + K_wind_Ekr*4.19*wind_TMY[i]*K_Hwind;
                    }
                    if (snowpack[i] == true) {
                        GHI_Ground[i] = 0;
                    } else {
                        GHI_Ground[i] = GHI[i]*K_GHI_ekr*(1-Albedo_WithoutSnow);
                    }
                break;
                case NAME_FUND[1]: 
                    h[i] = 6.16 + K_wind_Ekr*4.19*wind_TMY[i]*K_Hwind;
                    if (snowpack[i] == true) {
                        GHI_Ground[i] = 0;
                    } else {
                        GHI_Ground[i] = GHI[i]*K_GHI_ekr*(1-Albedo_WithoutSnow);
                    }
                break;
                case NAME_FUND[2]: 
                    if (snowpack[i] == false) {
                        h[i] = 6.16 + 4.19*wind_TMY[i]*K_Hwind;
                        GHI_Ground[i] = GHI[i]*(1-Albedo_WithoutSnow);
                    }
                break;
            }   

            Q = Q + h[i]*S*temperature_TMY[i] + GHI_Ground[i]*S;
        }

        return Q
    }

    Shading(Alpha, Betta) {

        
        return Alpha;
    }
   
}

module.exports = new TermalStab()