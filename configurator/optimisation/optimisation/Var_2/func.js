const Dispatchable = require("../../Energy sources/Dispatchable")
const Battery = require("../../Energy storages/Battery")
const OneConf = require("../../OneConf")
const {LOAD_TYPE} = require("../../../utils/consts")
const FreqWin = require("../../../utils/FreqWindow")

class optim {

    mid_load(OptTarget, Max_Cons, OPTIMISATION_TARGETS) {
        
        let m_load;

        if (( OptTarget.target === OPTIMISATION_TARGETS[0]) || ( OptTarget.target === OPTIMISATION_TARGETS[3])) {
                let K_Load = 1.5*(OptTarget.value*10-3.5);
                if (K_Load < 1) K_Load = 1;
                m_load =  Max_Cons*K_Load;
        } else { m_load =  Max_Cons*1.5; }

        return m_load;
    }

    vars(Common_Sources, EnSource, Common_DSources, EnDSource, Common_Storages, EnStorage, mid, Max_Cons, params) {

        let N_Source = 0, Arr_Source = [];
        for (let i = 0; i < Common_Sources.length; i++) {
            Arr_Source[i] = EnSource[Common_Sources[i]];
            if (EnSource[Common_Sources[i]] == 1) N_Source++;
        }

        let N_DSource = 0, Arr_DSource = [];
        for (let i = 0; i < Common_DSources.length; i++) {
            Arr_DSource[i] = EnDSource[Common_DSources[i]];
            if (EnDSource[Common_DSources[i]] == 1) N_DSource++;
        }

        let N_Storage = 0, Arr_Storage = [];
        for (let i = 0; i < Common_Storages.length; i++) {
            Arr_Storage[i] = EnStorage[Common_Storages[i]];
            if (EnStorage[Common_Storages[i]] == 1) N_Storage++;
        }
        
        let Arr_all;
        if (params.load.type == LOAD_TYPE[1]) {
            Arr_all = Arr_Source.concat(Arr_DSource).concat(Arr_Storage).concat(1);
        } else {
            Arr_all = Arr_Source.concat(Arr_DSource).concat(Arr_Storage);
        }

        for (let i = 0; i < Arr_all.length; i++) {
            if (i == 3) {Arr_all[i] = Arr_all[i]*Max_Cons}
            else {Arr_all[i] = Arr_all[i]*mid;};
        }

        return Arr_all
    }

    setResArr0(vars) {
        return {
            Vars: vars,
            RPS: 0,
            NPV: 0,
            Economy: 0,
            LCOE: Infinity,
            CapEx: Infinity,
            OpEx: Infinity
        };
    }

    OptCheck(Res_Array, N_Arr, params_OptTarget_value, OptTarget_Name, OptLim_Name, T, MainMesh, DopMesh, Eps_Old, Test_Arr) {

        let N_Res_Array = [], Test = [], Vars = [], T_Opt = T, Eps = Eps_Old;
        N_Res_Array[0] = {}; N_Res_Array[1] = {}; 
        for (let i = 0; i < Test_Arr.length; i++) {
            Test[i] = Test_Arr[i];
        }

        if ((N_Arr[OptLim_Name] >= params_OptTarget_value - 1e-4) && (N_Arr[OptTarget_Name] < Res_Array[0][OptTarget_Name])) {

            N_Res_Array[0].Vars = DopMesh;
            N_Res_Array[0].CapEx = N_Arr.CapEx;
            N_Res_Array[0].OpEx = N_Arr.OpEx;
            N_Res_Array[0].LCOE = N_Arr.LCOE;
            N_Res_Array[0].NPV = N_Arr.NPV;
            N_Res_Array[0].RPS = N_Arr.RPS;
            N_Res_Array[0].Economy = N_Arr.Economy;

            N_Res_Array[1].Vars = Res_Array[0].Vars;
            N_Res_Array[1].CapEx = Res_Array[0].CapEx;
            N_Res_Array[1].OpEx = Res_Array[0].OpEx;
            N_Res_Array[1].LCOE = Res_Array[0].LCOE;
            N_Res_Array[1].NPV = Res_Array[0].NPV;
            N_Res_Array[1].RPS = Res_Array[0].RPS;
            N_Res_Array[1].Economy = Res_Array[0].Economy;
            
            Eps = Math.abs((N_Res_Array[0][OptTarget_Name] - N_Res_Array[1][OptTarget_Name])/N_Res_Array[1][OptTarget_Name]);
            
            Test[Test_Arr.length] = [N_Res_Array[0].Vars[0], N_Res_Array[0].Vars[5], N_Res_Array[0][OptTarget_Name]];

            for (let i = 0; i < MainMesh.length; i++) {
                Vars[i] = DopMesh[i];
            }
            T_Opt = T-1;
        } else {
            for (let i = 0; i < MainMesh.length; i++) {
                Vars[i] = MainMesh[i];
            }

            N_Res_Array[0].Vars = Res_Array[0].Vars;
            N_Res_Array[0].CapEx = Res_Array[0].CapEx;
            N_Res_Array[0].OpEx = Res_Array[0].OpEx;
            N_Res_Array[0].LCOE = Res_Array[0].LCOE;
            N_Res_Array[0].NPV = Res_Array[0].NPV;
            N_Res_Array[0].RPS = Res_Array[0].RPS;
            N_Res_Array[0].Economy = Res_Array[0].Economy;

            N_Res_Array[1].Vars = Res_Array[1].Vars;
            N_Res_Array[1].CapEx = Res_Array[1].CapEx;
            N_Res_Array[1].OpEx = Res_Array[1].OpEx;
            N_Res_Array[1].LCOE = Res_Array[1].LCOE;
            N_Res_Array[1].NPV = Res_Array[1].NPV;
            N_Res_Array[1].RPS = Res_Array[1].RPS;
            N_Res_Array[1].Economy = Res_Array[1].Economy;
        }

        return [N_Res_Array, Eps, T_Opt, Vars, Test]

    }

    NewMesh(GetVars_Opt, mid_load, T_Opt, T_Opt_Start) {

        let Vars_Opt = [];
        for (let i = 0; i < GetVars_Opt.length; i++) {
            Vars_Opt[i] = GetVars_Opt[i];
        }

        for (let i = 0; i < Vars_Opt.length; i++) {
            if  (Vars_Opt[i] > 0) {
                if (i != 3) {
                    Vars_Opt[i] = Math.abs(Vars_Opt[i] + (mid_load * (Math.random()-0.5)*2*T_Opt/T_Opt_Start));
                }
            } else {
                Vars_Opt[i] = 0;
            }
        }

        return Vars_Opt
    }

    NewMesh_Main(GetVars_Main, GetVars_Test, StepProbe, StepMain, T_Opt, T_Opt_Start, num) {

        let Vars_Opt_Base = [], Vars_Opt_Direct = [];
        for (let i = 0; i < GetVars_Main.length; i++) {
            Vars_Opt_Base[i] = GetVars_Main[i];
            Vars_Opt_Direct[i] = GetVars_Test[i];
        }
        let Ans = [];

        for (let k = 0; k < num; k++) {
            Ans[k] = [];
            for (let i = 0; i < Vars_Opt_Base.length; i++) {
                if  (Vars_Opt_Base[i] > 0) {
                    if (i != 3) {
                        Ans[k][i] = Math.abs(Vars_Opt_Base[i] + ((k+1)/num)*(Vars_Opt_Direct[i] - Vars_Opt_Base[i])*(StepProbe*StepMain)*(T_Opt/T_Opt_Start));
                    } else {
                        Ans[k][i] = Vars_Opt_Base[i];
                    }
                } else {
                    Ans[k][i] = 0;
                }
            }
        }

        return Ans
    }

    BSA(MaxLim_Opt, T_Opt_Start, ProbeTests, StepProbe, StepMain, Vars, mid_load, SolarProd_Spec, WindProd_Spec, TEGprod_Spec, consumption, temperature_gr, params, temperature_Thermostab) {

        let T_Opt = T_Opt_Start, Counter = 0;
        let Vars_Test = [], Vars_Main = [], Vars_Dop = [];
        for (let i = 0; i < Vars.length; i++) {
            Vars_Test[i] = Vars[i];
            Vars_Main[i] = Vars[i];
            Vars_Dop[i] = Vars[i];
        }

        let Ans = [], C = 0, Arr_All = [];

        while ((T_Opt > 0) && (Counter < MaxLim_Opt)) {
            let Min_TestTarg = Infinity, Min_TestTarg_Dop = 0;     

            for (let i = 0; i < ProbeTests; i++) {
                Counter ++;
                Vars_Test = this.NewMesh(Vars_Main, mid_load, 1, StepProbe);

                let Energy_Summ_T = [];
                let Energy_T = [];
                let Energy_AfterDGS_T = [];
                let TEP_OneConf_T;
                switch (params.load.type) {
                    case LOAD_TYPE[0]:
                        Energy_Summ_T = Array.from({ length: 8760 },  (_, j) => (SolarProd_Spec[j]*Vars_Test[0] + WindProd_Spec[j]*Vars_Test[1] + TEGprod_Spec[j]*Vars_Test[2] - consumption[j]));
                        Energy_T = Battery.energy_out(Energy_Summ_T, Vars_Test[5], "LiFePO4", temperature_gr);
                        Energy_AfterDGS_T = Dispatchable.resEnergy((Energy_T)[0],  Vars_Test[3], "DGS", 1);
                        TEP_OneConf_T = OneConf.TEP(consumption, Vars_Test, Energy_AfterDGS_T, params, Energy_T[1]);
                    break;      
                    case LOAD_TYPE[1]:
                        Energy_Summ_T = Array.from({ length: 8760 },  (_, j) => (SolarProd_Spec[j]*Vars_Test[0] + WindProd_Spec[j]*Vars_Test[1] + TEGprod_Spec[j]*Vars_Test[2]));
                        Energy_T = Battery.energy_out_Thermostab(Energy_Summ_T, Vars_Test[5], "LiFePO4", temperature_gr, consumption, Vars_Test[7], FreqWin, temperature_Thermostab);
                        // Energy_AfterDGS_T = Dispatchable.resEnergy((Energy_T)[0],  Vars_Test[3], "DGS", 1);
                        TEP_OneConf_T = OneConf.TEP_Thermostab(Energy_T[3], Vars_Test, Energy_T[0], params, Energy_T[1], Energy_T[2]);
                    break; 
                }
                console.log("i " + i);
Arr_All[Counter] = [[Vars_Test[0], Vars_Test[1], Vars_Test[2], Vars_Test[3], Vars_Test[4], Vars_Test[5], Vars_Test[6], Vars_Test[7]], TEP_OneConf_T["LCOE"], TEP_OneConf_T["RPS"]];

                if ((TEP_OneConf_T["RPS"] < params.OptTarget.value) && (TEP_OneConf_T["RPS"] > Min_TestTarg_Dop)) {
                    Min_TestTarg_Dop = TEP_OneConf_T["RPS"];
                    for (let j = 0; j < Vars.length; j++) {
                        Vars_Dop[j] = Vars_Test[j];
                    }
                } else if ((TEP_OneConf_T["RPS"] >= params.OptTarget.value) && (TEP_OneConf_T["LCOE"] < Min_TestTarg)) {
                    Min_TestTarg = TEP_OneConf_T["LCOE"];
                    for (let j = 0; j < Vars.length; j++) {
                        Vars_Dop[j] = Vars_Test[j];
                    }
                }

//                 if ((TEP_OneConf_T["LCOE"] < Min_TestTarg) && ((TEP_OneConf_T["RPS"] > Min_TestTarg_Dop)) || (TEP_OneConf_T["RPS"] > params.OptTarget.value)) {
// console.log("Got it");
//                     Min_TestTarg = TEP_OneConf_T["LCOE"];
//                     Min_TestTarg_Dop = TEP_OneConf_T["RPS"];
//                     for (let j = 0; j < Vars.length; j++) {
//                         Vars_Dop[j] = Vars_Test[j];
//                     }
//                 }
            }

            for (let i = 0; i < Vars_Dop.length; i++) {
                Vars_Test[i] = Vars_Dop[i];
            }

            let New_Vars_Main = this.NewMesh_Main(Vars_Main, Vars_Test, StepProbe, StepMain, T_Opt, T_Opt_Start, 5);
// for (let i = 0; i < Vars.length; i++) {
//     Vars_Main[i] = Math.abs(Vars_Main[i] + (Vars_Test[i] - Vars_Main[i])*(StepProbe*StepMain)*(T_Opt/T_Opt_Start));
// }

            Min_TestTarg = Infinity;
            Min_TestTarg_Dop = 0;
            let Econ = [];
            for (let i = 0; i < New_Vars_Main.length; i++) {
                Counter ++;
                let Energy_Summ = [];
                let Energy = [];
                let Energy_AfterDGS = [];
                let TEP_OneConf;
                switch (params.load.type) {
                    case LOAD_TYPE[0]:
                        Energy_Summ = Array.from({ length: 8760 },  (_, j) => (SolarProd_Spec[j]*New_Vars_Main[i][0] + WindProd_Spec[j]*New_Vars_Main[i][1] + TEGprod_Spec[j]*New_Vars_Main[i][2] - consumption[j]));
                        Energy = Battery.energy_out(Energy_Summ, New_Vars_Main[i][5], "LiFePO4", temperature_gr);
                        Energy_AfterDGS = Dispatchable.resEnergy((Energy)[0],  New_Vars_Main[i][3], "DGS", 1);
                        TEP_OneConf = OneConf.TEP(consumption, New_Vars_Main[i], Energy_AfterDGS, params, Energy[1]);
                    break;      
                    case LOAD_TYPE[1]:
                        Energy_Summ = Array.from({ length: 8760 },  (_, j) => (SolarProd_Spec[j]*New_Vars_Main[i][0] + WindProd_Spec[j]*New_Vars_Main[i][1] + TEGprod_Spec[j]*New_Vars_Main[i][2]));
                        Energy = Battery.energy_out_Thermostab(Energy_Summ, New_Vars_Main[i][5], "LiFePO4", temperature_gr, consumption, New_Vars_Main[i][7], FreqWin, temperature_Thermostab);
                        // Energy_AfterDGS_T = Dispatchable.resEnergy((Energy)[0],  New_Vars_Main[3], "DGS", 1);
                        TEP_OneConf = OneConf.TEP_Thermostab(Energy[3], New_Vars_Main[i], Energy[0], params, Energy[1], Energy[2]);
                    break; 
                }
                // console.log("i " + i);
                // console.log("LCOE " + TEP_OneConf["LCOE"]);
                // console.log("RPS " + TEP_OneConf["RPS"]);

//                 if ((TEP_OneConf["LCOE"] < Min_TestTarg) && ((TEP_OneConf["RPS"] > Min_TestTarg_Dop)) || (TEP_OneConf["RPS"] > params.OptTarget.value)) {
// // console.log("Got it");
//                     Min_TestTarg = TEP_OneConf["LCOE"];
//                     Min_TestTarg_Dop = TEP_OneConf["RPS"];
//                     for (let j = 0; j < Vars.length; j++) {
//                         Vars_Dop[j] = New_Vars_Main[i][j];
//                         Econ = [TEP_OneConf["LCOE"], TEP_OneConf["RPS"]];
//                     }
//                 }
Arr_All[Counter] = [[New_Vars_Main[i][0], New_Vars_Main[i][1], New_Vars_Main[i][2], New_Vars_Main[i][3], New_Vars_Main[i][4], New_Vars_Main[i][5], New_Vars_Main[i][6], New_Vars_Main[i][7]], TEP_OneConf["LCOE"], TEP_OneConf["RPS"], TEP_OneConf["CapEx"], TEP_OneConf["OpEx"], TEP_OneConf["Economy"], TEP_OneConf["NPV"]];
console.log([New_Vars_Main[i], TEP_OneConf["LCOE"], TEP_OneConf["RPS"]]);                
                if ((TEP_OneConf["RPS"] < params.OptTarget.value) && (TEP_OneConf["RPS"] > Min_TestTarg_Dop)) {
console.log("Got RPS");
                    Min_TestTarg_Dop = TEP_OneConf["RPS"];
                    for (let j = 0; j < Vars.length; j++) {
                        Vars_Dop[j] = New_Vars_Main[i][j];
                    }
                    Econ = [TEP_OneConf["LCOE"], TEP_OneConf["RPS"]];
                } else if ((TEP_OneConf["RPS"] >= params.OptTarget.value) && (TEP_OneConf["LCOE"] < Min_TestTarg)) {
console.log("Got LCOE");
                    Min_TestTarg = TEP_OneConf["LCOE"];
                    for (let j = 0; j < Vars.length; j++) {
                        Vars_Dop[j] = New_Vars_Main[i][j];
                    }
                    Econ = [TEP_OneConf["LCOE"], TEP_OneConf["RPS"]];
                }
            }

            for (let i = 0; i < Vars_Dop.length; i++) {
                Vars_Main[i] = Vars_Dop[i];
            }

Ans[C] = [[Vars_Main[0], Vars_Main[1], Vars_Main[2], Vars_Main[3], Vars_Main[4], Vars_Main[5], Vars_Main[6], Vars_Main[7]], Econ[0], Econ[1]];
            if (C == 0) {
                T_Opt --;
            } else {
                if (((Econ[1] < params.OptTarget.value) && (Econ[1] > Ans[C-1][2])) || ((Econ[1] >= params.OptTarget.value) && ((Econ[0] < Ans[C-1][1]) || (Ans[C-1][2] < params.OptTarget.value)))) {
                    T_Opt --;
                } else {
                    for (let i = 0; i < Vars_Main.length; i++) {
                        Vars_Main[i] = Ans[C-1][0][i];
                    }
                    Ans[C] = Ans[C-1];
                }
            }

C++;
console.log("C " + C);
console.log("T_Opt " + T_Opt);
console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
        }       

        let Min_TestTarg = Infinity, Opt = [];
        for (let i = 1; i < Arr_All.length; i++) {
            if ((Arr_All[i][2] > params.OptTarget.value) && (Arr_All[i][1] < Min_TestTarg)) {
                Min_TestTarg = Arr_All[i][1];
                Opt = [[Arr_All[i][0][0], Arr_All[i][0][1], Arr_All[i][0][2], Arr_All[i][0][3], Arr_All[i][0][4], Arr_All[i][0][5], Arr_All[i][0][6], Arr_All[i][0][7]], Arr_All[i][1], Arr_All[i][2], Arr_All[i][3], Arr_All[i][4], Arr_All[i][5], Arr_All[i][6]];
            }
        }
console.log(Opt)
        if (params.Options.Test == 0)
            return {
                Vars: Opt[0],
                RPS: Opt[2],
                CapEx: Opt[3],
                OpEx: Opt[4],
                Economy: Opt[5],
                NPV: Opt[6],
                LCOE: Opt[1]
            }
        else
            return Arr_All

    }

}

module.exports = new optim()