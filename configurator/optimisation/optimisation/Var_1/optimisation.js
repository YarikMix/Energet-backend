// тяжелый шарик

const Solar = require("../../Energy sources/Solar")
const Wind = require("../../Energy sources/Wind")
const TEG = require("../../Energy sources/TEG")
const Dispatchable = require("../../Energy sources/Dispatchable")
const Battery = require("../../Energy storages/Battery")
const Optim = require("./func")
const TEF = require("../../TechEconParr")
const OneConf = require("../../OneConf")
const {Common_Sources, Common_DSources, Common_Storages, OPTIMISATION_TARGETS, OPTIMISATION_LOAD, AB_PLACE_VAR} = require("../../../utils/consts")

class optimisation {
    optimisation_V1(params, consumption, orientation, horison, GHI, Diffuse, temperature, temperature_gr, Wind_Speed, pressure, Albedo) {
        let N_steps = params.Options.N_steps, step = params.Options.step;
        
        let Max_Cons = Math.max.apply(null,  consumption)

        let mid_load =  Optim.mid_load(params.OptTarget, Max_Cons, OPTIMISATION_TARGETS);

        let refining = 0;
        let Vars = Optim.vars(Common_Sources,  params.EnSource, Common_DSources,  params.EnDSource, Common_Storages,  params.EnStorage, N_steps, step, mid_load, refining, params.Options.Zero_S);

        let RPS_min = 1, OptVal_prev, Opt_Vars = [];
        let Flag = 0;
        let Varsn = Optim.makeVarsn(Vars, orientation);
// Varsn[0] = [[2500,0,0,1,0,2500,0],[0,0,15,1]];

        let target = Optim.initTarget(params.OptTarget, OPTIMISATION_TARGETS, Max_Cons);

        let d_Opt =  target.delta + 1;
        let Condition = true;
        let NPV_global;
let ggg = 0, hhh = 0, nnn = 0, jjj = 0, kkk = [], aaa, bbb, gl_opt, xxx,ccc;
        let Res_Array = [];

        for (let i = 0; i < 5; i++) {
                Res_Array[i] = Optim.setResArr0(target.delta, d_Opt, Condition);
        }
let Test = [];
        while ((Res_Array[0].d_Opt > Res_Array[0].targ_d_Opt) & (Res_Array[0].Flag < 6*(Varsn).length) ) {
            OptVal_prev = Optim.setOptVal_prev(params.OptTarget.target, Res_Array[0], OPTIMISATION_TARGETS);

            for (let i = 0; i < Varsn.length; i++) {
ggg ++;
                let SolarProd = Solar.production(params.coords, horison, params.Additions.shading, GHI, Diffuse, temperature, Varsn[i][0][0], Varsn[i][1], params.Additions.bPV, Albedo);
                let WindProd = Wind.production(Wind_Speed, pressure, temperature, params.Additions.WTheight, Varsn[i][0][1]);
                let TEGprod = TEG.production(temperature, temperature_gr, Varsn[i][0][2]);

                let Energy_Summ = Array.from({ length: 8760 },  (_, j) => (SolarProd[j] + WindProd[j] + TEGprod[j] - consumption[j]));

                let Energy = Battery.energy_out(Energy_Summ, Varsn[i][0][5], "LiFePO4", temperature_gr);

                let Energy_AfterDGS = Dispatchable.resEnergy(( Energy)[0],  (Varsn[i][0])[3], "DGS", refining);
                if (refining != 1) Varsn[i][0][3] = Energy_AfterDGS[1][0];
                //let Energy_AfterFC = Dispatchable.resEnergy(await (await Energy)[0], Varsn[i][0][4], "FC");

                let TEP_OneConf = OneConf.TEP(consumption, Varsn[i][0], Energy_AfterDGS, params, Energy[1]);

if (params.Options.Test == 1) {
console.log(TEP_OneConf)  
// console.log(TEP_OneConf.RPS >= target.value.RPS)             
if (TEP_OneConf.RPS >= target.value.RPS) {
Test[jjj] = [Varsn[i][0][0], Varsn[i][0][1], TEP_OneConf.LCOE];
jjj ++;
}}
                NPV_global =  TEP_OneConf.NPV;
                Res_Array = Optim.getResArr(i, Res_Array, params.OptTarget, OPTIMISATION_TARGETS, Varsn, TEP_OneConf.CapEx, TEP_OneConf.OpEx, TEP_OneConf.RPS, TEP_OneConf.NPV, TEP_OneConf.Economy, TEP_OneConf.LCOE, target.value, OptVal_prev, SolarProd, WindProd);

            }

            if ((Res_Array[0].Opt_Vars == "") || (Res_Array[0].Condition)) {
                console.log("derefining")
                if (params.OptTarget.target == OPTIMISATION_TARGETS[0]) {
                    target.value.capex =  TEF.CapEx(Varsn[2][0])*100000;
                } else if (params.OptTarget.target == OPTIMISATION_TARGETS[1]) {
                    target.value.capex =  TEF.CapEx(Varsn[2][0])*100000;
                } else if (params.OptTarget.target == OPTIMISATION_TARGETS[2]) {
                    target.value.NPV = NPV_global*10;
                } else if (params.OptTarget.target == OPTIMISATION_TARGETS[3]) {
                    target.value.LCOE =  10000;
                }
                step = step*2;
                refining = 0;
                Vars = Optim.vars(Common_Sources,  params.EnSource, Common_DSources,  params.EnDSource, Common_Storages,  params.EnStorage, N_steps, step, mid_load, refining, params.Options.Zero_S);
                for (let i = 0; i < Vars.length; i++) {
                    for (let j = 0; j < orientation.length; j++) {
                        Varsn[i*orientation.length + j] = [];
                        Varsn[i*orientation.length + j][0] = [Vars[i][0], Vars[i][1], Vars[i][2], Vars[i][3], Vars[i][4], Vars[i][5], Vars[i][6]];
                        Varsn[i*orientation.length + j][1] = [orientation[j][0], orientation[j][1], orientation[j][2], orientation[j][3]];
                    }
                }
                hhh ++;
            } else {
                console.log("refining")
                Res_Array[0].Flag = 0;
                step = step*0.5;
                refining = 1;
                Vars = Optim.vars(Common_Sources,  params.EnSource, Common_DSources,  params.EnDSource, Common_Storages,  params.EnStorage, N_steps, step, 1, refining, params.Options.Zero_S);
                Varsn = [];
                for (let i = 0; i < Vars.length; i++) {
                    Varsn[i] = [];
                    Varsn[i][1] = [Res_Array[0].Vars[1][0], Res_Array[0].Vars[1][1], Res_Array[0].Vars[1][2], Res_Array[0].Vars[1][3]];
                    Varsn[i][0] = [];
                    for (let j = 0; j < ( Vars)[i].length; j++) {
                        Varsn[i][0][j] = Vars[i][j] * Res_Array[0].Vars[0][j];
                    }
                }
                nnn++;
            }

console.log(Res_Array[0].d_Opt);
console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
console.log(Res_Array[0].targ_d_Opt);
console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");

        }
        if (params.Options.Test == 1) {
            return Test;
        }else {
            return [ggg, Res_Array];
        }
    
    }
    
}

module.exports = new optimisation()