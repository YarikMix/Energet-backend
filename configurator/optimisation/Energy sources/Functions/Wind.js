class wind {
    power(P_rated, Wind, V_min, V_max, V_rated, V_stop, Dens, Dens_rated) {
        let prod;
        if (((Dens/Dens_rated)**(1/3))*Wind <= V_min) prod = 0;
        else if (((Dens/Dens_rated)**(1/3))*Wind <= V_max) prod = P_rated*(((Dens/Dens_rated)*(Wind**3)-(V_min**3))/((V_rated**3)-(V_min**3)));
        else if (((Dens/Dens_rated)**(1/3))*Wind <= V_stop) prod = P_rated*(((Dens/Dens_rated)*(V_max**3)-(V_min**3))/((V_rated**3)-(V_min**3)));
        else prod = 0;
        return prod
    }

    Density(p, T) {
        return p*0.029/(8.314*(273.15+T))
    }

    Wind_H(H, Vel) {
        return Vel*(H/10)**(1/7)
    }
}

module.exports = new wind()