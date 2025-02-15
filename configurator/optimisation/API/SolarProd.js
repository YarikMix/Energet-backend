const Solar = require("../Energy sources/Solar")

class calculation {

    async calc (data) {

        const params = await data

        let get_Hor = fetch("https://re.jrc.ec.europa.eu/api/v5_2/printhorizon?lat=" + params.coords[0] + "&lon=" + params.coords[1] + "&outputformat=json");
        let get_TMY = fetch("https://re.jrc.ec.europa.eu/api/v5_2/tmy?lat=" + params.coords[0] + "&lon=" + params.coords[1] + "&outputformat=json");

        let PVGIS_Hor = (await get_Hor).json();
        PVGIS_Hor = (await PVGIS_Hor).outputs.horizon_profile;
        let horison = [];
        for (let i = 0; i < PVGIS_Hor.length; i++) {
                horison[i] = [(Math.PI/180)*PVGIS_Hor[i].A, (Math.PI/180)*PVGIS_Hor[i].H_hor];
        }

        let PVGIS_TMY = (await get_TMY).json();
        PVGIS_TMY = (await PVGIS_TMY).outputs.tmy_hourly;
        let GHI = [], temperature = [], pressure = [], Wind_Speed = [];
        for (let i = 0; i < PVGIS_TMY.length; i++) {
                GHI[i] = PVGIS_TMY[i]["G(h)"];
                temperature[i] = PVGIS_TMY[i].T2m;
                pressure[i] = PVGIS_TMY[i].SP;
                Wind_Speed[i] = PVGIS_TMY[i].WS10m;
        }

        let SolarProd = Solar.production(params.coords, horison, params.shading, GHI, temperature, params.ratedPower, [params.orient[0]*Math.PI/180, params.orient[1]*Math.PI/180, params.orient[2], params.orient[3]]);

        return await SolarProd
    }

}

module.exports = new calculation()