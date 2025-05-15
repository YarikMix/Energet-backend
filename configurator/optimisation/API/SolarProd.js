const Solar = require("../Energy sources/Solar")
const ThermalStab = require("../ThermalStab_Modules/functions")
const Optim = require("../functions")
const Get_Horison = require("../OuterAPI/PVGIS_Hor")
const Get_TMY = require("../OuterAPI/PVGIS_TMY")
const Get_OM = require("../OuterAPI/OM")

class calculation {

    async calc (data) {

        const params = await data

        let horison, GHI, Diffuse, temperature, pressure, Wind_Speed, T_AB, T_Dop, Snow_Dop;
        
        try {
            horison = await Get_Horison.Get_PVGIS_Hor(params.coords);
        } catch (e) {
            return e.message
        }

        try {
            [GHI, Diffuse, temperature, pressure, Wind_Speed] = await Get_TMY.Get_PVGIS_TMY(params.coords);
            T_Dop = await Get_OM.Get_OM_T(params.coords);
            Snow_Dop = await Get_OM.Get_OM_Snow(params.coords);
        } catch (e) {
            return e.message
        }

        let Snowpack = ThermalStab.SnowPack(GHI, T_Dop, Snow_Dop);
        let Albedo = Optim.Albedo(Snowpack);

        let SolarProd = Solar.production(params.coords, horison, params.shading, GHI, Diffuse, temperature, params.ratedPower, [params.orient[0]*Math.PI/180, params.orient[1]*Math.PI/180, params.orient[2], params.orient[3]], params.bPV, Albedo);

        return await SolarProd
    }

}

module.exports = new calculation()