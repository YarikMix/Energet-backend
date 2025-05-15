const Get_Horison = require("../OuterAPI/PVGIS_Hor")
const ThermalStab = require("../ThermalStab_Modules/functions.js")
const Get_TMY = require("../OuterAPI/PVGIS_TMY")
const Get_OM = require("../OuterAPI/OM.js")
const Solar = require("../Energy sources/Solar")
const Wind = require("../Energy sources/Wind")
const TEG = require("../Energy sources/TEG")
const Dispatchable = require("../Energy sources/Dispatchable")
const Battery = require("../Energy storages/Battery")
const Optim = require("../functions")
const {Common_Sources, Common_DSources, Common_Storages, OPTIMISATION_TARGETS, OPTIMISATION_LOAD, AB_PLACE_VAR, CONS_PRED, LOAD_TYPE} = require("../../utils/consts")
const OneConf = require("../OneConf")

class calculation {

        async calc (data) {

                const params = await data
                let horison, GHI, Diffuse, temperature, pressure, Wind_Speed, T_AB, T_Dop, Snow_Dop;

                try {
                        horison = await Get_Horison.Get_PVGIS_Hor(params.coords);

                        if (params.year == 0) [GHI, Diffuse, temperature, pressure, Wind_Speed] = await Get_TMY.Get_PVGIS_TMY(params.coords); 
                        else [GHI, Diffuse, temperature, pressure, Wind_Speed] = await Get_TMY.Get_PVGIS_Year(params.coords,params.year); 

                        T_Dop = await Get_OM.Get_OM_T(params.coords);
                        Snow_Dop = await Get_OM.Get_OM_Snow(params.coords);

// for (let i = 0; i < GHI.length; i++) {
// if (GHI[i] < 50) GHI[i] = 0;      
// }
                        T_AB = await Get_OM.Get_OM_Ground(params.coords);
                } catch (e) {
                        return e.message
                }

                let Snowpack = ThermalStab.SnowPack(GHI, T_Dop, Snow_Dop);
                let Albedo = Optim.Albedo(Snowpack);
                
                try {
                        let Init = this.initialisation(await params, temperature, T_AB, CONS_PRED);
                        let Mesh = Optim.RegularMesh(Common_Sources,  params.EnSource, Common_DSources,  params.EnDSource, Common_Storages,  params.EnStorage, params.Options.N_steps, params.Options.Max);
                        Mesh = Optim.makeVarsn(Mesh, Init[1]);
// Mesh[0][0][0] = 4500;
// Mesh[0][0][5] = 2880;
// Mesh = [Mesh[0]];
// let SolarProdd, Energyy;
                        for (let i = 0; i < Mesh.length; i++) {
                            let SolarProd = Solar.production(params.coords, horison, params.Additions.shading, GHI, Diffuse, temperature, Mesh[i][0][0], Mesh[i][1], params.Additions.bPV, Albedo);
                            console.log(i)
// SolarProdd = SolarProd;
                            let WindProd = Wind.production(Wind_Speed, pressure, temperature, params.Additions.WTheight, Mesh[i][0][1]);
                            let TEGprod = TEG.production(temperature, Init[2], Mesh[i][0][2]);
                            let Energy_Summ = Array.from({ length: 8760 },  (_, j) => (SolarProd[j] + WindProd[j] + TEGprod[j] - Init[0][j]));
                            let Energy = Battery.energy_out(Energy_Summ, Mesh[i][0][5], "LiFePO4", Init[2]);
// Energyy = Energy;
                            let Energy_AfterDGS = Dispatchable.resEnergy(( Energy)[0],  (Mesh[i][0])[3], "DGS", 2);
                            Mesh[i][0][3] = Energy_AfterDGS[1][0];
                            let TEP_OneConf = OneConf.TEP(Init[0], Mesh[i][0], Energy_AfterDGS, params, Energy[1]);
                            Mesh[i][2] = TEP_OneConf;
                            Mesh[i][3] = Energy[1];
                        }

// return [Mesh, Energyy[0]]
                        return [Mesh.length, Mesh];
                } catch(err) {
                        console.error(err)
                        return(err)
                }
        }

        initialisation (params, temperature, T_AB, CONS_PRED) {
        
                let Var_Asim = [];
                let Var_Betta = [];

                if (params.Additions.gamma.length == 0) {
                        Var_Asim = [-Math.PI, -3*Math.PI/4, -Math.PI/2, -Math.PI/4, 0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI];
                } else {
                        Var_Asim = Array.from({ length: params.Additions.gamma.length }, (_, i) => params.Additions.gamma[i]*Math.PI/180);
                }

                if (params.Additions.betta.length == 0) {
                        Var_Betta = [0, Math.PI/12, Math.PI/6, Math.PI/4, Math.PI/3, Math.PI/2.4, Math.PI/2];
                } else {
                        Var_Betta = Array.from({ length: params.Additions.betta.length }, (_, i) => params.Additions.betta[i]*Math.PI/180);
                }

                let orientation = Optim.orientation(Var_Asim, Var_Betta, params.Additions.pitch, 1);

                let temperature_gr = [];
                switch (params.Additions.AB_place) {
                        case AB_PLACE_VAR[0]: temperature_gr = Array.from({ length: 8760 }, (_, i) => 20); break;
                        case AB_PLACE_VAR[1]: temperature_gr = Array.from({ length: 8760 }, (_, i) => temperature[i]); break;
                        case AB_PLACE_VAR[2]: temperature_gr = Array.from({ length: 8760 }, (_, i) => T_AB[i]); break;
                }    
                
                let consumption = [];
                if (params.load.name == "utils.consts") {
                        consumption = Array.from({ length: 8760 },  (_, j) => CONS_PRED[j]*1000);
                } else {
                        consumption = Optim.consumption(params.load.name,params.load.value, OPTIMISATION_LOAD);
                }

                return [consumption, orientation, temperature_gr];
        }
}



module.exports = new calculation()