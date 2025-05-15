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


    consumption(name, value, OPTIMISATION_LOAD) {
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
            const M = (N+1)/2;
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

        return cons;
    }

    RegularMesh(Common_Sources, EnSource, Common_DSources, EnDSource, Common_Storages, EnStorage, N_steps, Max) {

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
        let Steps = Array.from({ length: N_steps }, (_, i) => (i+1)*Max/N_steps);
        Steps = Steps.concat(0);
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
        }
        let F_Mesh = [],c = 0;
        if (EnDSource.DGS == 1) {
            for (let i = 0; i < All_var.length; i++) {
                if (All_var[i][3] == Max/N_steps) {
                    F_Mesh[c] = [];
                    F_Mesh[c] = All_var[i];
                    c++;
                }
            }
        } else {
            F_Mesh = All_var;
        }

        return F_Mesh
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

    Albedo(Snow) {
        
        let ans = [];
        for (let i = 0; i < Snow.length; i++) {
            if (Snow[i] == true) ans[i] = 0.8;
            else ans[i] = 0.2;
        }

        return ans;
    }

}

module.exports = new optim()