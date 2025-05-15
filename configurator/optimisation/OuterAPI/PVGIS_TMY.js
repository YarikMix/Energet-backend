class PVGIS_TMY {

    async Get_PVGIS_TMY(params_coords) {
        
        let PVGIS_TMY;

        try {
            const get_TMY = await fetch("https://re.jrc.ec.europa.eu/api/v5_2/tmy?lat=" + params_coords[0] + "&lon=" + params_coords[1] + "&outputformat=json")
            if (get_TMY.ok) {
                PVGIS_TMY = get_TMY.json();
            } else {
                console.error('PVGIS не отвечает (не удалось получить TMY PVGIS)')
                throw new Error('PVGIS не отвечает (не удалось получить TMY PVGIS)')
            }
        } catch {
            console.error('Ошибка сети (не удалось получить TMY PVGIS)')
            throw new Error('Ошибка сети (не удалось получить TMY PVGIS)')
        }

        PVGIS_TMY = (await PVGIS_TMY).outputs.tmy_hourly;
        let GHI = [], Diffuse = [], temperature = [], pressure = [], Wind_Speed = [];
        for (let i = 0; i < PVGIS_TMY.length; i++) {
            GHI[i] = PVGIS_TMY[i]["G(h)"];
            Diffuse[i] = PVGIS_TMY[i]["Gd(h)"];
            temperature[i] = PVGIS_TMY[i].T2m;
            pressure[i] = PVGIS_TMY[i].SP;
            Wind_Speed[i] = PVGIS_TMY[i].WS10m;
        }

        return [GHI, Diffuse, temperature, pressure, Wind_Speed];
    }

    async Get_PVGIS_Year(params_coords, params_year) {
        
        let PVGIS_TMY;

        try {
            const get_TMY = await fetch("https://re.jrc.ec.europa.eu/api/seriescalc?lat=" + params_coords[0] + "&lon=" + params_coords[1] + "&startyear=" + params_year + "&endyear=" + params_year + "&outputformat=json")
            if (get_TMY.ok) {
                PVGIS_TMY = get_TMY.json();
            } else {
                console.error('PVGIS не отвечает (не удалось получить метеоданные PVGIS)')
                throw new Error('PVGIS не отвечает (не удалось получить метеоданные PVGIS)')
            }
        } catch {
            console.error('Ошибка сети (не удалось получить метеоданные PVGIS)')
            throw new Error('Ошибка сети (не удалось получить метеоданные PVGIS)')
        }

        PVGIS_TMY = (await PVGIS_TMY).outputs.hourly;
        let GHI = [], temperature = [], pressure = [], Wind_Speed = [];
        let GHI_TMY = [], temperature_TMY = [], Wind_Speed_TMY = [], Diffuse_TMY = [];
        for (let i = 0; i < PVGIS_TMY.length; i++) {
            GHI[i] = PVGIS_TMY[i]["G(i)"];
            temperature[i] = PVGIS_TMY[i].T2m;
            // pressure[i] = PVGIS_TMY[i].SP;
            Wind_Speed[i] = PVGIS_TMY[i].WS10m;
        }

        let PVGIS_D;
        try {
            const get_TMY = await fetch("https://re.jrc.ec.europa.eu/api/seriescalc?lat=" + params_coords[0] + "&lon=" + params_coords[1] + "&startyear=" + params_year + "&endyear=" + params_year + "&components=1&outputformat=json")
            if (get_TMY.ok) {
                PVGIS_D = get_TMY.json();
            } else {
                console.error('PVGIS не отвечает1 (не удалось получить метеоданные PVGIS1)')
                throw new Error('PVGIS не отвечает1 (не удалось получить метеоданные PVGIS1)')
            }
        } catch {
            console.error('Ошибка сети1 (не удалось получить метеоданные PVGIS1)')
            throw new Error('Ошибка сети1 (не удалось получить метеоданные PVGIS1)')
        }

        PVGIS_D = (await PVGIS_D).outputs.hourly;
        let Diffuse = [];
        for (let i = 0; i < PVGIS_D.length; i++) {
            Diffuse[i] = PVGIS_D[i]["Gd(i)"];
        }

        [GHI_TMY, Diffuse_TMY, temperature_TMY, pressure, Wind_Speed_TMY] = await this.Get_PVGIS_TMY(params_coords);

        return [GHI, Diffuse, temperature, pressure, Wind_Speed];
    }

}

module.exports = new PVGIS_TMY()