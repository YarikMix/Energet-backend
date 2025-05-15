class Battery {
    
    Cap_corr(K, T) {
        return (K[0]*(T**2) + K[1]*T + K[2]);
    }

    DischargeLoss(K_SoC, K_T, SoC, T) {
        let L = (1/((K_SoC[0]*((1-SoC)**2) + K_SoC[1]*(1-SoC) + K_SoC[2])*(K_T[0]*(T**6) + K_T[1]*(T**5) + K_T[2]*(T**4) + K_T[3]*(T**3) + K_T[4]*(T**2) + K_T[5]*T + K_T[6])));
        if ((L > 1) || (L < 0)) L = 1;
        return L;
    }

}

module.exports = new Battery()