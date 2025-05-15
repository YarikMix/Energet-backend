const ThermalStab = require("./ThermalStab_Modules/functions")
const Get_Horison = require("./OuterAPI/PVGIS_Hor")
const Get_TMY = require("./OuterAPI/PVGIS_TMY")
const Get_OM = require("./OuterAPI/OM")
const Solar = require("./Energy sources/Solar")
const Wind = require("./Energy sources/Wind")
const TEG = require("./Energy sources/TEG")
const Dispatchable = require("./Energy sources/Dispatchable")
const Battery = require("./Energy storages/Battery")
const Optim = require("./functions")
const Optimisation_V1 = require("./optimisation/Var_1/optimisation")
const Optimisation_V2 = require("./optimisation/Var_2/optimisation")
const {Common_Sources, Common_DSources, Common_Storages, OPTIMISATION_TARGETS, OPTIMISATION_LOAD, AB_PLACE_VAR, CONS_PRED, LOAD_TYPE} = require("../utils/consts")

class calculation {

        async calc (data) {

                const params = await data
                let horison, Diffuse, GHI, temperature, pressure, Wind_Speed, T_AB, T_Dop, Snow_Dop;
                T_AB = Array.from({ length: 8760 }, (_, i) => 20);
                T_Dop = Array.from({ length: 730 }, (_, i) => 0);
                Snow_Dop = Array.from({ length: 730 }, (_, i) => 0);

                try {
                        horison = await Get_Horison.Get_PVGIS_Hor(params.coords);
                
                        [GHI, Diffuse, temperature, pressure, Wind_Speed] = await Get_TMY.Get_PVGIS_TMY(params.coords);
                        
                        if (params.Additions.AB_place == AB_PLACE_VAR[2]) {
                                T_AB = await Get_OM.Get_OM_Ground(params.coords);
                        }

                        T_Dop = await Get_OM.Get_OM_T(params.coords);
                        Snow_Dop = await Get_OM.Get_OM_Snow(params.coords);

                } catch (e) {
                        return e.message
                }

                try {
                        const ans = this.optimisation(await params, horison, GHI, Diffuse, temperature, pressure, Wind_Speed, T_AB, T_Dop, Snow_Dop)
                        return ans;
                } catch(err) {
                        console.error(err)
                        return(err)
                }
        }

        optimisation (params, horison, GHI, Diffuse, temperature, pressure, Wind_Speed, T_AB, T_Dop, Snow_Dop) {

                let init = this.initialisation(params, temperature, T_AB, CONS_PRED, GHI, Wind_Speed, T_Dop, Snow_Dop);

                let Res_Array;
                switch (params.Optimisator_Version) {
                        case 1:
                                Res_Array = Optimisation_V1.optimisation_V1(params, init[0], init[1], horison, GHI, Diffuse, temperature, init[2], Wind_Speed, pressure, init[3]);
                                return Res_Array;
                        case 2:
                                Res_Array = Optimisation_V2.optimisation_V2(params, init[0], init[1], horison, GHI, Diffuse, temperature, init[2], Wind_Speed, pressure, init[3]);
                                return Res_Array;
                }
        }

        initialisation (params, temperature, T_AB, CONS_PRED, GHI, Wind_Speed, T_Dop, Snow_Dop) {
        
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

                let consumption;
                switch (params.load.type) {
                case LOAD_TYPE[0]:
                        if (params.load.name == "utils.consts") {
                                consumption = [];
                                consumption = Array.from({ length: 8760 },  (_, j) => CONS_PRED[j]*1000);
                        } else {
                                consumption = [];
                                consumption = Optim.consumption(params.load.name,params.load.value, OPTIMISATION_LOAD);
                        }
                break;      
                case LOAD_TYPE[1]:
                        consumption = ThermalStab.Heat_Load(100, "Сваи/Экран", GHI, temperature, Wind_Speed, T_Dop, Snow_Dop);
                break; 
                }

                let Snowpack = ThermalStab.SnowPack(GHI, T_Dop, Snow_Dop);
                let Albedo = Optim.Albedo(Snowpack);

                return [consumption, orientation, temperature_gr, Albedo];
        }
        
}



module.exports = new calculation()