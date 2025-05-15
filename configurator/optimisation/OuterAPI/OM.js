class OM {

    async Get_OM_Ground(params_coords) {
        
        let OM_T_AB;

        try {
            const get_T_AB = await fetch("https://archive-api.open-meteo.com/v1/archive?latitude=" + params_coords[0] + "&longitude=" + params_coords[1] + "&start_date=2024-01-01&end_date=2024-12-31&hourly=soil_temperature_0_to_7cm")
            if (get_T_AB.ok) {
                OM_T_AB = get_T_AB.json();
            } else {
                console.error('Open Meteo не отвечает (не удалось получить температуру грунта)')
                throw new Error('Open Meteo не отвечает (не удалось получить температуру грунта)')
            }
        } catch {
            console.error('Ошибка сети (не удалось получить температуру грунта Open Meteo)')
            throw new Error('Ошибка сети (не удалось получить температуру грунта Open Meteo)')
        }

        OM_T_AB = (await OM_T_AB).hourly.soil_temperature_0_to_7cm;
        let T_AB = [];
        for (let i = 0; i < 8760; i++) {
            T_AB[i] = OM_T_AB[i];
        }

        return T_AB;
    }

    async Get_OM_T(params_coords) {
        
        let OM_T;

        try {
            const get_T = await fetch("https://archive-api.open-meteo.com/v1/archive?latitude=" + params_coords[0] + "&longitude=" + params_coords[1] + "&start_date=2022-01-01&end_date=2023-12-31&daily=temperature_2m_mean")
            if (get_T.ok) {
                OM_T = get_T.json();
            } else {
                console.error('Open Meteo не отвечает (не удалось получить температуру)')
                throw new Error('Open Meteo не отвечает (не удалось получить температуру)')
            }
        } catch {
            console.error('Ошибка сети (не удалось получить температуру Open Meteo)')
            throw new Error('Ошибка сети (не удалось получить температуру Open Meteo)')
        }

        OM_T = (await OM_T).daily.temperature_2m_mean;
        let T = [];
        for (let i = 0; i < 730; i++) {
            T[i] = OM_T[i];
        }

        return T;
    }

    async Get_OM_Snow(params_coords) {
        
        let OM_Snow;

        try {
            const get_Snow = await fetch("https://archive-api.open-meteo.com/v1/archive?latitude=" + params_coords[0] + "&longitude=" + params_coords[1] + "&start_date=2022-01-01&end_date=2023-12-31&daily=snowfall_sum")
            if (get_Snow.ok) {
                OM_Snow = get_Snow.json();
            } else {
                console.error('Open Meteo не отвечает (не удалось получить снег)')
                throw new Error('Open Meteo не отвечает (не удалось получить снег)')
            }
        } catch {
            console.error('Ошибка сети (не удалось получить снег Open Meteo)')
            throw new Error('Ошибка сети (не удалось получить снег Open Meteo)')
        }

        OM_Snow = (await OM_Snow).daily.snowfall_sum;
        let Snow = [];
        for (let i = 0; i < 730; i++) {
            Snow[i] = OM_Snow[i];
        }

        return Snow;
    }

}

module.exports = new OM()