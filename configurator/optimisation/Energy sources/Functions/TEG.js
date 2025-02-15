class TEG {
    
    Alpha_Zeeb_n(T) {
        return (4*(10**(-12)))*(T**3) - (4.8*(10**(-9)))*(T**2) + (2.01*(10**(-6)))*T - (1.29*(10**(-4)));
    }

    Alpha_Zeeb_p(T) {
        return -(5.94524*(10**(-12)))*(T**3) + (6.0534*(10**(-9)))*(T**2) - (1.77636*(10**(-6)))*T + (2.63309*(10**(-4)));
    }

    Lambda_Zeeb_n(T) {
        return (5.32452*(10**(-8)))*(T**3) - (3.75249*(10**(-5)))*(T**2) + (0.0042)*T + (2.69599);
    }

    Lambda_Zeeb_p(T) {
        return -(1.3588*(10**(-8)))*(T**3) + (4.65818*(10**(-5)))*(T**2) - (0.03246)*T + (8.05499);
    }

    U_0(n, Alpha, T_amb, T_s, T_pr) {
        let U;
        let d_T = Math.abs(T_amb-T_s) - 10;
        if (d_T < 0) U = 0;
        else U = n*Alpha*d_T;
        return U;
    }
}

module.exports = new TEG()