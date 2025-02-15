class optim {

    orientation(Var_Asim, Var_Betta, pitch, n_row) {
        
        let orient = [];
        for (let i = 0; i < Var_Asim.length; i++) {
                for (let j = 0; j < Var_Betta.length; j++) {
                      orient[i*Var_Betta.length + j] = [Var_Asim[i], Var_Betta[j], pitch, 1];
                }
        }

        return orient;
    }

    mid_load(OptTarget, Max_Cons, OPTIMISATION_TARGETS) {
        
        let m_load =  Max_Cons*1.5;

        if (( OptTarget.target === OPTIMISATION_TARGETS[0]) || ( OptTarget.target === OPTIMISATION_TARGETS[3])) {
                let K_Load = 1.5*(OptTarget.value*15-3.5);
                if (K_Load < 1) K_Load = 1;
                m_load =  Max_Cons*K_Load;
        }

        return m_load;
    }

    makeVarsn(Vars, orientation) {
        
        let Varsn = [];
        for (let i = 0; i < Vars.length; i++) {
                for (let j = 0; j < orientation.length; j++) {
                        Varsn[i*orientation.length + j] = [];
                        Varsn[i*orientation.length + j][0] = [Vars[i][0], Vars[i][1], Vars[i][2], Vars[i][3], Vars[i][4], Vars[i][5], Vars[i][6]];
                        Varsn[i*orientation.length + j][1] = [orientation[j][0], orientation[j][1], orientation[j][2], orientation[j][3]];
                }
        }

        return Varsn;
    }
    
    RPS(energy, cons) {
        let reliability, prev_rel = 0, prev_cons = 0;
        for (let i = 0; i < 8760; i++) {
            if (energy[i] < 0) prev_rel = prev_rel - energy[i];
            prev_cons = prev_cons + cons[i];
        }
        reliability = (prev_cons - prev_rel)/prev_cons;

        return reliability;
    }

    CapEx(Varsn) {
        const spic_Costs = [100000, 150000, 1000000, 25000, 0, 35000, 0];
        let Cost = 0;
        for (let i = 0; i < Varsn.length; i++) {
            Cost = Cost + Varsn[i]*spic_Costs[i]/1000;
        }

        return Cost;
    }

    OpEx(Varsn, ageAB, DGS, lifeTime) {
        const spic_Costs = [100000, 150000, 1000000, 25000, 0, 35000, 0];
        const FuelCost = 100*(1.7/5.7); // руб/кВт*ч
        // const FuelCost = 380*(0.5); // руб/кВт*ч
        let CostAB = Varsn[5]*spic_Costs[5]/1000;
        let OpEx_AB = (lifeTime*ageAB - 1)*CostAB/lifeTime;
        let OpEx_WT = Varsn[1]*1000/1000;
        let OpEx_SES = (Varsn[0]*1000/1000) + (Varsn[0]*spic_Costs[0]/1000)*0.25/6;

        let CostDGS = Varsn[3]*spic_Costs[3]/1000;
        let OpEx_DGS = ((lifeTime*DGS[2] - 1)*CostDGS/lifeTime) + (DGS[1]*FuelCost/1000);

        let finalOpEx = OpEx_AB + OpEx_DGS + OpEx_SES + OpEx_WT;

        return finalOpEx;
    }

    NPV(Energy, CapEx, OpEx, ElCost, cons, Years, R) {
        let EnConsumed = 0;

        for (let i = 0; i < 8760; i++) {
            if (Energy[i] <= 0) EnConsumed = EnConsumed + cons[i] + Energy[i];
            else EnConsumed = EnConsumed + cons[i];
        }

        let Payback = - CapEx;
        for (let i = 0; i < Years; i++) {
            Payback = Payback + (((ElCost*EnConsumed)/1000) - OpEx)/((1+R)**i);
        }

        return Payback;
    }

    LCOE(Energy, CapEx, OpEx, cons, Years, R) {
        let EnConsumed = 0;

        for (let i = 0; i < 8760; i++) {
            if (Energy[i] <= 0) EnConsumed = EnConsumed + cons[i] + Energy[i];
            else EnConsumed = EnConsumed + cons[i];
        }

        let Expenses = CapEx;
        for (let i = 0; i < Years; i++) {
            Expenses = Expenses + (OpEx)/((1+R)**i);
        }
        let EnProd = 0
        for (let i = 0; i < Years; i++) {
            EnProd = EnProd + (EnConsumed/1000)/((1+R)**i);
        }
        let LCOE = Expenses/EnProd

        return LCOE;
    }

    Economy(Energy, ElCost, cons, Years, R) {
        let EnConsumed = 0;

        for (let i = 0; i < 8760; i++) {
            if (Energy[i] <= 0) EnConsumed = EnConsumed + cons[i] + Energy[i];
            else EnConsumed = EnConsumed + cons[i];
        }

        let Payback = 0;
        for (let i = 0; i < Years; i++) {
            Payback = Payback + (ElCost*EnConsumed/1000)/((1+R)**i);
        }

        return Payback;
    }

    generate(arr, length) {
        const variations = [];

        function generates(current, depth) {
            if (depth === length) {
                variations.push(current.slice());
                return;
            }

            for (let i = 0; i < arr.length; i++) {
                current.push(arr[i]);
                generates(current, depth + 1);
                current.pop();
            }
        }

        generates([], 0);
        return variations;
    }

    vars(Common_Sources, EnSource, Common_DSources, EnDSource, Common_Storages, EnStorage, N_steps, step, mid, refining) {

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
        
        let Arr_all = Arr_Source.concat(Arr_DSource).concat(Arr_Storage);

        let All_var = []; 
        let Steps = Array.from({ length: N_steps }, (_, i) => Math.abs((i-(N_steps-1)/2)*step*mid + mid));
        // Steps = Steps.concat(0)
        Steps.sort(function (a, b) {
            return a - b;
        });
        const N_all = Arr_all.length;
        All_var = this.generate(Steps, N_Storage+N_DSource+N_Source);
        for (let i = 0; i < All_var.length; i++) {
            for (let j = 0; j < N_all; j++) {
                if (Arr_all[j] == 0) {
                    All_var[i].splice(j, 0, 0)
                }
            }
            if (refining == 0) {
                All_var[i][3] = (((All_var[i][3] - mid)/(step*mid)) + ((N_steps-1)/2))*(1/(N_steps-1)) * (All_var[i][3] != 0);
                All_var[i][4] = (((All_var[i][4] - mid)/(step*mid)) + ((N_steps-1)/2))*(1/(N_steps-1)) * (All_var[i][4] != 0);
            }
        }

        return All_var
    }

    consumption(name, value,coords, OPTIMISATION_LOAD) {
        let cons = [];

        if (name === OPTIMISATION_LOAD[0]) {
            cons = Array.from({ length: 8760 }, (_, i) => Number(value))
            // for (let i = 0; i < 8760; i++) {
            //     cons[i] = 108;
            //     if ((i < 91*24) || (i > 8760-61*24))
            //         cons[i] = 0;
            // }
        } else if (name === OPTIMISATION_LOAD[1]) {
            let Winter = 
                [
                    0.0196, 0.0190, 0.0187, 0.0186, 0.0187, 0.0191, 0.0240, 0.0343,
                    0.0471, 0.0514, 0.0529, 0.0534, 0.0530, 0.0513, 0.0529, 0.0581,
                    0.0599, 0.0609, 0.0613, 0.0602, 0.0564, 0.0523, 0.0354, 0.0215
                ]
            let Summer = 
                [
                    0.0183, 0.0183, 0.0145, 0.0137, 0.0141, 0.0152, 0.0213, 0.0285,
                    0.0384, 0.0468, 0.0567, 0.0575, 0.0578, 0.0556, 0.0548, 0.0632,
                    0.0605, 0.0632, 0.0643, 0.0616, 0.0594, 0.0552, 0.0392, 0.0221
                ]
            
            Winter = Winter.map(x => x * Number(value[0]) * 1000);
            Summer = Summer.map(x => x * Number(value[1]) * 1000);

            const N = 365;
            // const M = (N+1)/2;
            const M = 280;
            const hours = 24;
            let answer = []
            for (let j = 1; j <= N; j++) {
                answer[j-1] = []
                for (let k = 1; k <= hours; k++) {
                    if (j < M) {
                        answer[j-1][k-1] = ((Winter[k-1] - Summer[k-1]) / (M-1)) * (M-j) + Summer[k-1];
                    } else {
                        answer[j-1][k-1] = ((Summer[k-1] - Winter[k-1]) / (M-N)) * (j-M) + Summer[k-1];
                    }
                    if (j === 1 || j === N) {
                        answer[j-1][k-1] = Winter[k-1];
                    }
                    if (j === M) {
                        answer[j-1][k-1] = Summer[k-1];
                    }
                }
            }

            cons = answer.flat();
        }

        cons = cons.splice(Math.round(coords[1]/15)).concat(cons);

        return cons;
    }

    initTarget(OptTarget, OPTIMISATION_TARGETS, Max_Cons) {
        
        let target = {}
        if ( OptTarget.target === OPTIMISATION_TARGETS[0]) {
                target = {
                        "value": {
                                "capex":  this.CapEx([Max_Cons*OptTarget.value*1000000, 0, 0, 0, 0]), //Optim.CapEx([Max_Cons*Math.exp(params.OptTarget.value*5), 0, 0, 0, 0]),
                                "RPS":  OptTarget.value,
                                "NPV": 0,
                                "Economy": 0,
                                "PP": 0,
                                "output": 0
                        }
                }
                target.delta = target.value.capex*0.01;
        } else if ( OptTarget.target === OPTIMISATION_TARGETS[1]) {
                target = {
                        "value": {
                                "capex":  OptTarget.value,
                                "RPS": 0,
                                "NPV": 0,
                                "Economy": 0,
                                "PP": 0,
                                "output": 0
                        }
                }
                target.delta = 0.01;
        } else if ( OptTarget.target === OPTIMISATION_TARGETS[2]) {
                target = {
                        "value": {
                                "capex":  OptTarget.value,
                                "RPS": 0,
                                "NPV": -  OptTarget.value,
                                "Economy": 0,
                                "PP": 0,
                                "output": 0
                        }
                }
                target.delta =  target.value.capex*0.5;
        } else if ( OptTarget.target === OPTIMISATION_TARGETS[3]) {
                target = {
                        "value": {
                                "LCOE":  100000, //Optim.CapEx([Max_Cons*Math.exp(params.OptTarget.value*5), 0, 0, 0, 0]),
                                "RPS":  OptTarget.value,
                                "NPV": 0,
                                "Economy": 0,
                                "PP": 0,
                                "output": 0
                        }
                }
                target.delta = target.value.LCOE*0.01;
        }

        return target;
    }

    setOptVal_prev(OptTarget, ResArr, OPTIMISATION_TARGETS) {

        if (OptTarget == OPTIMISATION_TARGETS[0]) {
                return ResArr.CapEx;
        } else if (OptTarget == OPTIMISATION_TARGETS[1]) {
                return ResArr.RPS;
        } else if (OptTarget == OPTIMISATION_TARGETS[2]) {
                return ResArr.NPV;
        } else if (OptTarget == OPTIMISATION_TARGETS[3]) {
                return ResArr.LCOE;
        } else {
            return "Err setOptVal_prev"
        }
    }

    setResArr0(target_delta, d_Opt, Condition_0) {
        return {
            Vars: [],
            TargetVal: 0,
            TargetName: "",
            RPS: 0,
            NPV: 0,
            Economy: 0,
            LCOE: 0,
            CapEx: 0,
            OpEx: 0,
            d_Opt: d_Opt,
            targ_d_Opt: target_delta,
            Flag: 0,
            Condition: Condition_0,
        };
    }

    getResArr(iter, Res_Array_Get, OptTarget, OPTIMISATION_TARGETS, Varsn, CapEx, OpEx, RPS, NPV, Economy, LCOE, target_value, OptVal_prev, DGS, Energy_AB, AGE, Sol, Wind) {

        let TargetValue = target_value;
        let Res_Array_0 = [];

        for (let i = 0; i < 5; i++) {
            Res_Array_0[i] = {};
            for (let key in Res_Array_Get[i]) {
                Res_Array_0[i][key] = Res_Array_Get[i][key];
            }
        }

        let Res_Array = Res_Array_Get;

        for (let i = 4; i > 0; i--) {
            Res_Array[i] = Res_Array[i-1];
        }

        Res_Array[0] = this.setResArr0(0,0,true);

        if (OptTarget.target == OPTIMISATION_TARGETS[0]) {
            if ((CapEx < target_value.capex) & (RPS > target_value.RPS)) {
                TargetValue.capex = CapEx;

                Res_Array[0].CapEx = CapEx;
                Res_Array[0].Vars = (Varsn)[iter];
                Res_Array[0].d_Opt = Math.abs(OptVal_prev - target_value.capex);
                Res_Array[0].targ_d_Opt = target_value.capex*0.01;
                Res_Array[0].Flag = 0;
                Res_Array[0].RPS = RPS
                Res_Array[0].NPV = NPV
                Res_Array[0].Economy = Economy
                Res_Array[0].LCOE = LCOE
                Res_Array[0].OpEx = OpEx;
                Res_Array[0].Condition = (Math.abs(target_value.RPS - RPS) > 0.33*target_value.RPS);
            } else {Res_Array[0].Flag ++;}
        } else if (OptTarget.target == OPTIMISATION_TARGETS[1]) {
            if ((CapEx < OptTarget.value) & (RPS > target_value.RPS)) {
                TargetValue.capex = CapEx;
                TargetValue.RPS = RPS;

                Res_Array[0].CapEx = CapEx;
                Res_Array[0].Vars = (Varsn)[iter];
                Res_Array[0].d_Opt = Math.abs(OptVal_prev - target_value.RPS);
                Res_Array[0].targ_d_Opt = target_value.RPS*0.01;
                Res_Array[0].Flag = 0;
                Res_Array[0].RPS = RPS
                Res_Array[0].NPV = NPV
                Res_Array[0].Economy = Economy
                Res_Array[0].LCOE = LCOE
                Res_Array[0].OpEx = OpEx;
                Res_Array[0].Condition = (Math.abs(OptTarget.value - CapEx) > 0.1*target_value.capex);
            } else {Res_Array[0].Flag ++;}
        } else if (OptTarget.target == OPTIMISATION_TARGETS[2]) {
            if ((CapEx < target_value.capex) & (NPV > target_value.NPV)) {
                TargetValue.NPV = NPV;

                Res_Array[0].CapEx = CapEx;
                Res_Array[0].Vars = (Varsn)[iter];
                Res_Array[0].d_Opt = Math.abs(OptVal_prev - target_value.NPV);
                Res_Array[0].targ_d_Opt = Math.abs(target_value.NPV*0.01);
                Res_Array[0].Flag = 0;
                Res_Array[0].RPS = RPS
                Res_Array[0].NPV = NPV
                Res_Array[0].Economy = Economy
                Res_Array[0].LCOE = LCOE
                Res_Array[0].OpEx = OpEx;
                Res_Array[0].Condition = false;
                // Res_Array[0].Condition = (Math.abs(target.value.capex - CapEx) > 0.33*target.value.capex);
                //for (let i = 0; i < 8760; i++) kkk[i] = (await Energy[i]).toString()
            } else {Res_Array[0].Flag ++;}
        } else if (OptTarget.target == OPTIMISATION_TARGETS[3]) {
            if ((LCOE < target_value.LCOE) & (RPS > target_value.RPS)) {
                TargetValue.LCOE = LCOE;

                Res_Array[0].CapEx = CapEx;
                Res_Array[0].Vars = (Varsn)[iter];
                Res_Array[0].d_Opt = Math.abs(OptVal_prev - target_value.LCOE);
                Res_Array[0].targ_d_Opt = target_value.LCOE*0.01;
                Res_Array[0].Flag = 0;
                Res_Array[0].RPS = RPS
                Res_Array[0].NPV = NPV
                Res_Array[0].Economy = Economy
                Res_Array[0].LCOE = LCOE
                Res_Array[0].OpEx = OpEx;
                Res_Array[0].Condition = (Math.abs(target_value.RPS - RPS) > 0.33*target_value.RPS);
                Res_Array[0].DGS_En = DGS[0];
                Res_Array[0].Wh = DGS[1];
                Res_Array[0].MotoH = DGS[2];
                Res_Array[0].AGEAB = AGE;
                Res_Array[0].SoC = Energy_AB;
                Res_Array[0].Sola = Sol;
                Res_Array[0].Wind = Wind;
            } else {Res_Array[0].Flag ++;}
        }

        if (Res_Array[0].Flag == 1) {
            Res_Array = Res_Array_0;
            Res_Array[0].Flag ++;
            return Res_Array;
        }
        return Res_Array;
    }

}

module.exports = new optim()