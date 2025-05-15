const Solar = require("../../Energy sources/Solar")
const Wind = require("../../Energy sources/Wind")
const TEG = require("../../Energy sources/TEG")
const Dispatchable = require("../../Energy sources/Dispatchable")
const Battery = require("../../Energy storages/Battery")
const Optim = require("./func")
const TEF = require("../../TechEconParr")
const OneConf = require("../../OneConf")
const {Common_Sources, Common_DSources, Common_Storages, OPTIMISATION_TARGETS, OPTIMISATION_LOAD, AB_PLACE_VAR, LOAD_TYPE} = require("../../../utils/consts")

class optimisation {
    optimisation_V2(params, consumption, orientation, horison, GHI, Diffuse, temperature, temperature_gr, Wind_Speed, pressure, Albedo) {
        
        let Max_Cons;
        if (params.load.type == LOAD_TYPE[1]) {
            Max_Cons = consumption/(4*8*90);;
        } else {
            Max_Cons = Math.max.apply(null,  consumption);
        }

        // let Albedo = Array.from({ length: 8760 }, (_, i) => 0);
        let mid_load =  Optim.mid_load(params.OptTarget, Max_Cons, OPTIMISATION_TARGETS);

        let SolarProd_Spec, WindProd_Spec, TEGprod_Spec;
        if (params.EnSource.solar == 1) {
            SolarProd_Spec = Solar.production(params.coords, horison, params.Additions.shading, GHI, Diffuse, temperature, 1, orientation[0], params.Additions.bPV, Albedo);
        } else {
            SolarProd_Spec = Solar.production(params.coords, horison, params.Additions.shading, GHI, Diffuse, temperature, 0, orientation[0], params.Additions.bPV, Albedo);
        }
        if (params.EnSource.wind == 1) {
            WindProd_Spec = Wind.production(Wind_Speed, pressure, temperature, params.Additions.WTheight, 1);
        } else {
            WindProd_Spec = Wind.production(Wind_Speed, pressure, temperature, params.Additions.WTheight, 0);
        }
        if (params.EnSource.TEG == 1) {
            TEGprod_Spec = TEG.production(temperature, temperature_gr, 1);
        } else {
            TEGprod_Spec = TEG.production(temperature, temperature_gr, 0);
        }

        let Res_Array = [];
        let Vars = Optim.vars(Common_Sources,  params.EnSource, Common_DSources,  params.EnDSource, Common_Storages,  params.EnStorage, mid_load, Max_Cons, params);
        let Vars_Test = [], Vars_Main = [];
        for (let i = 0; i < Vars.length; i++) {
            Vars_Test[i] = Vars[i];
            Vars_Main[i] = Vars[i];
        }

        for (let i = 0; i < 2; i++) {
            Res_Array[i] = Optim.setResArr0(Vars);
        }

        let Eps = 1, T_Opt_Start = 100, MinLim_Opt = 50, MaxLim_Opt = 1000, Counter = 0, Test = [], jjj = 0, Test_Dop;
        let T_Opt = T_Opt_Start;
        let ProbeTests = 5, StepProbe = 100, StepMain = 0.5;

//         while ((T_Opt > 0) && (Counter < MaxLim_Opt)) {
//             let Min_TestTarg = Infinity;     

//             for (let i = 0; i < 5; i++) {
// Counter ++;
//                 Vars_Test = Optim.NewMesh(Vars_Main, mid_load, 1, 100);

//                 let Energy_Summ_T = Array.from({ length: 8760 },  (_, j) => (SolarProd_Spec[j]*Vars_Test[0] + WindProd_Spec[j]*Vars_Test[1] + TEGprod_Spec[j]*Vars_Test[2] - consumption[j]));

//                 let Energy_T = Battery.energy_out(Energy_Summ_T, Vars_Test[5], "LiFePO4", temperature_gr);

//                 let Energy_AfterDGS_T = Dispatchable.resEnergy((Energy_T)[0],  Vars_Test[3], "DGS", 1);

//                 let TEP_OneConf_T = OneConf.TEP(consumption, Vars_Test, Energy_AfterDGS_T, params, Energy_T[1]);

//                 if (TEP_OneConf_T["LCOE"] < Min_TestTarg) {
//                     Min_TestTarg = TEP_OneConf_T["LCOE"];
//                     for (let i = 0; i < Vars.length; i++) {
//                         Vars[i] = Vars_Test[i];
//                     }
//                 }
// Test[jjj] = [Vars_Test[0], Vars_Test[5], TEP_OneConf_T.LCOE];
// jjj++; 
//             }
//             for (let i = 0; i < Vars.length; i++) {
//                 Vars_Test[i] = Vars[i];
//             }

//             for (let i = 0; i < Vars.length; i++) {
//                 Vars_Main[i] = Math.abs(Vars_Main[i] + (Vars_Test[i] - Vars_Main[i])*(100/4)*(T_Opt/T_Opt_Start));
//             }

//             let Energy_Summ = Array.from({ length: 8760 },  (_, j) => (SolarProd_Spec[j]*Vars_Main[0] + WindProd_Spec[j]*Vars_Main[1] + TEGprod_Spec[j]*Vars_Main[2] - consumption[j]));

//             let Energy = Battery.energy_out(Energy_Summ, Vars_Main[5], "LiFePO4", temperature_gr);

//             let Energy_AfterDGS = Dispatchable.resEnergy((Energy)[0],  Vars_Main[3], "DGS", 1);

//             let TEP_OneConf = OneConf.TEP(consumption, Vars_Main, Energy_AfterDGS, params, Energy[1]);
// T_Opt --;
//             // [Res_Array, Eps, T_Opt, Vars_Opt, Test] = Optim.OptCheck(Res_Array, TEP_OneConf, params.OptTarget.value, "LCOE", "RPS", T_Opt, Vars, Vars_Opt, Eps, Test);

//             // Vars_Opt = Optim.NewMesh(Vars_Opt, mid_load, T_Opt, T_Opt_Start);

// console.log(TEP_OneConf.LCOE);
// // console.log(T_Opt);
// // console.log(Vars);
// console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
//         }

let ans = Optim.BSA(MaxLim_Opt, T_Opt_Start, ProbeTests, StepProbe, StepMain, Vars, mid_load, SolarProd_Spec, WindProd_Spec, TEGprod_Spec, consumption, temperature_gr, params, temperature)
return ans;
        // if (params.Options.Test == 1) {
        //     return ans;
        // }else {
        //     return Res_Array[0];
        // }
    }
    
}

module.exports = new optimisation()