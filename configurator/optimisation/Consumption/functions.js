class ConsFunc {

    Get_COP(Freq, dT, X, Y, Z) {
        
        if (Freq == 0) {
            return 0;
        }

        let X_Find = Freq;
        let Y_Find = dT;

        let X_Low = 0;
        let X_High = 0;
        let Y_Low = 0;
        let Y_High = 0;
        let Xj_Low = 0;
        let Xj_High = 0;
        let Yj_Low = 0;
        let Yj_High = 0;

        for (let j = 1; j < X.length; j++) {
            if (X[j] > X_Find) {
                X_Low = X[j-1];
                X_High = X[j];
                Xj_Low = j-1;
                Xj_High = j;
                break
            }
        }
        for (let j = 1; j < Y.length; j++) {
            if (Y[j] > Y_Find) {
                Y_Low = Y[j-1];
                Y_High = Y[j];
                Yj_Low = j-1;
                Yj_High = j;
                break
            }
        }

        let a1 = X_Find-X_Low;
        let a2 = Y_Find-Y_Low;

        let b1 = 0;
        let b2 = Y_High-Y_Low;
        let b3 = Z[Xj_Low][Yj_High] - Z[Xj_Low][Yj_Low];

        let c1 = X_High-X_Low;
        let c2 = 0;
        let c3 = Z[Xj_High][Yj_Low] - Z[Xj_Low][Yj_Low];

        let COP = Z[Xj_Low][Yj_Low] + (a1*b2*c3 + c1*a2*b3)/(c1*b2);

        return COP;
    }

}

module.exports = new ConsFunc()