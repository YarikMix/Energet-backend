const Solar = require("./Energy sources/Solar");
const Wind = require("./Energy sources/Wind");
const TEG = require("./Energy sources/TEG");
const Dispatchable = require("./Energy sources/Dispatchable");
const Battery = require("./Energy storages/Battery");
const Optim = require("./functions");
const {
  Common_Sources,
  Common_DSources,
  Common_Storages,
  OPTIMISATION_TARGETS,
  OPTIMISATION_LOAD,
  CONSUMPTION_GET,
  SOLPROD_GET,
  VARSSS,
} = require("../utils/consts");

class calculation {
  async calc(data) {
    // почасовки от энергосбыт компании

    const params = await data;

    let get_Hor = fetch(
      "https://re.jrc.ec.europa.eu/api/v5_2/printhorizon?lat=" +
        params.coords[0] +
        "&lon=" +
        params.coords[1] +
        "&outputformat=json",
    );
    let get_TMY = fetch(
      "https://re.jrc.ec.europa.eu/api/v5_2/tmy?lat=" +
        params.coords[0] +
        "&lon=" +
        params.coords[1] +
        "&outputformat=json",
    );

    let PVGIS_Hor = (await get_Hor).json();
    PVGIS_Hor = (await PVGIS_Hor).outputs.horizon_profile;
    let horison = [];
    for (let i = 0; i < PVGIS_Hor.length; i++) {
      horison[i] = [
        (Math.PI / 180) * PVGIS_Hor[i].A,
        (Math.PI / 180) * PVGIS_Hor[i].H_hor,
      ];
      // horison[i] = [(Math.PI/180)*PVGIS_Hor[i].A, 0];
    }

    let PVGIS_TMY = (await get_TMY).json();
    PVGIS_TMY = (await PVGIS_TMY).outputs.tmy_hourly;
    let GHI = [],
      temperature = [],
      pressure = [],
      Wind_Speed = [];
    for (let i = 0; i < PVGIS_TMY.length; i++) {
      GHI[i] = PVGIS_TMY[i]["G(h)"];
      temperature[i] = PVGIS_TMY[i].T2m;
      pressure[i] = PVGIS_TMY[i].SP;
      Wind_Speed[i] = PVGIS_TMY[i].WS10m;
    }

    const ans = await this.optimisation(
      await params,
      horison,
      GHI,
      temperature,
      pressure,
      Wind_Speed,
    );

    return await ans;

    // вернуть результаты расчета (массив с мощностями и т.п.)
  }

  optimisation(params, horison, GHI, temperature, pressure, Wind_Speed) {
    // let Var_Asim = [-Math.PI/2, -Math.PI/4, 0, Math.PI/4, Math.PI/2];
    // let Var_Betta = [0, Math.PI/4, Math.PI/2];

    // let Var_Asim = [-Math.PI, -3*Math.PI/4, -Math.PI/2, -Math.PI/4, 0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI];
    // let Var_Betta = [0, Math.PI/12, Math.PI/6, Math.PI/4, Math.PI/3, Math.PI/2.4, Math.PI/2];

    let Var_Asim = [(0 * Math.PI) / 180];
    let Var_Betta = [(45 * Math.PI) / 180];

    // let Var_Asim = params.Additions.gamma;   70*Math.PI/180
    // let Var_Betta = params.Additions.betta;

    let orientation = Optim.orientation(
      Var_Asim,
      Var_Betta,
      params.Additions.pitch,
      1,
    );
    // let orientation = [0, Math.PI/3, 20, 1];

    // let Wind_Speed = Array.from({ length: 8760 }, (_, i) => Math.random()*25);
    // let temperature_gr = Array.from({ length: 8760 }, (_, i) => -Math.random()*20);
    // let temperature_gr = Array.from({ length: 8760 }, (_, i) => temperature[i]*(temperature[i]>5)+5*(temperature[i]<=5));
    let temperature_gr = Array.from({ length: 8760 }, (_, i) => 5);

    let consumption = Optim.consumption(
      params.load.name,
      params.load.value,
      params.coords,
      OPTIMISATION_LOAD,
    );
    consumption = consumption
      .splice(Math.round(params.coords[1] / 15))
      .concat(consumption);

    let N_steps = params.Options.N_steps,
      step = params.Options.step;

    let Max_Cons = Math.max.apply(null, consumption);

    let mid_load = Optim.mid_load(
      params.OptTarget,
      Max_Cons,
      OPTIMISATION_TARGETS,
    );

    let refining = 0;
    let Vars = Optim.vars(
      Common_Sources,
      params.EnSource,
      Common_DSources,
      params.EnDSource,
      Common_Storages,
      params.EnStorage,
      N_steps,
      step,
      mid_load,
      refining,
    );

    let RPS_min = 1,
      OptVal_prev,
      Opt_Vars = [];
    let Flag = 0;
    let Varsn = Optim.makeVarsn(Vars, orientation);

    let target = Optim.initTarget(
      params.OptTarget,
      OPTIMISATION_TARGETS,
      Max_Cons,
    );

    let d_Opt = target.delta + 1;
    let Condition = true;
    let NPV_global;
    let ggg = 0,
      hhh = 0,
      nnn = 0,
      jjj = 0,
      kkk = [],
      aaa,
      bbb,
      gl_opt,
      xxx,
      ccc;
    let Res_Array = [];

    for (let i = 0; i < 5; i++) {
      Res_Array[i] = Optim.setResArr0(target.delta, d_Opt, Condition);
    }

    while (
      (Res_Array[0].d_Opt > Res_Array[0].targ_d_Opt) &
      (Res_Array[0].Flag < 6 * Varsn.length)
    ) {
      OptVal_prev = Optim.setOptVal_prev(
        params.OptTarget.target,
        Res_Array[0],
        OPTIMISATION_TARGETS,
      );

      // console.log(Varsn)
      for (let i = 0; i < Varsn.length; i++) {
        let SolarProd = Solar.production(
          params.coords,
          horison,
          params.Additions.shading,
          GHI,
          temperature,
          Varsn[i][0][0],
          Varsn[i][1],
        );
        // let NNN = Varsn[i][0][0]/390;
        // let SolarProd = Array.from({ length: 8760 }, (_, j) => SOLPROD_GET[j]*NNN*1000);
        // надо будет вернуть расчет солнца
        let WindProd = Wind.production(
          Wind_Speed,
          pressure,
          temperature,
          params.Additions.WTheight,
          Varsn[i][0][1],
        );

        let TEGprod = TEG.production(
          temperature,
          temperature_gr,
          Varsn[i][0][2],
        );

        let Energy_Summ = Array.from(
          { length: 8760 },
          (_, j) => SolarProd[j] + WindProd[j] + TEGprod[j] - consumption[j],
        );

        let Energy = Battery.energy_out(
          Energy_Summ,
          Varsn[i][0][5],
          "LiFePO4",
          temperature_gr,
        );

        let Energy_AfterDGS = Dispatchable.resEnergy(
          Energy[0],
          Varsn[i][0][3],
          "DGS",
          refining,
        );
        if (refining != 1) Varsn[i][0][3] = Energy_AfterDGS[1][0];
        //let Energy_AfterFC = Dispatchable.resEnergy(await (await Energy)[0], Varsn[i][0][4], "FC");

        let RPS = Optim.RPS(Energy_AfterDGS[0], consumption);
        let CapEx = Optim.CapEx(Varsn[i][0]);
        let OpEx = Optim.OpEx(Varsn[i][0], Energy[1], Energy_AfterDGS[1], 30);
        let NPV = Optim.NPV(
          Energy_AfterDGS[0],
          CapEx,
          OpEx,
          params.ElCost,
          consumption,
          30,
          0.1,
        );
        NPV_global = NPV;

        let LCOE = Optim.LCOE(
          Energy_AfterDGS[0],
          CapEx,
          OpEx,
          consumption,
          30,
          0.1,
        );

        // console.log(Varsn[i][0])
        // console.log(RPS)
        // console.log(LCOE)
        // console.log(Energy_AfterDGS[1])
        // console.log(Energy[1])
        // console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")

        let Economy = Optim.Economy(
          Energy_AfterDGS[0],
          params.ElCost,
          consumption,
          30,
          0.1,
        );

        Res_Array = Optim.getResArr(
          i,
          Res_Array,
          params.OptTarget,
          OPTIMISATION_TARGETS,
          Varsn,
          CapEx,
          OpEx,
          RPS,
          NPV,
          Economy,
          LCOE,
          target.value,
          OptVal_prev,
          Energy_AfterDGS[1],
          Energy[2],
          Energy[1],
          SolarProd,
          WindProd,
        );
        // return Res_Array
        //                         if (params.OptTarget.target == OPTIMISATION_TARGETS[0]) {
        //                                 if (( CapEx <  target.value.capex) & ( RPS >  target.value.RPS)) {
        // // console.log(CapEx, target.value.capex )
        //                                         target.value.capex =  CapEx;
        //                                         Opt_Vars = ( Varsn)[i];
        //                                         d_Opt = Math.abs( OptVal_prev -  target.value.capex);
        //                                         target.delta =  target.value.capex*0.01;
        //                                         Flag = 0;
        //                                         target.value.output =  CapEx;
        //                                         ggg =  RPS
        //                                         jjj =  NPV
        //                                         kkk =  Economy
        //                                         aaa =  LCOE
        //                                         bbb =  OpEx;
        //                                         Condition = (Math.abs( target.value.RPS -  RPS) > 0.33* target.value.RPS)

        //                                         for (let i = 4; i > 0; i--) {
        //                                                 Res_Array[i] = Res_Array[i-1];
        //                                         }
        //                                         Res_Array[0] = [Opt_Vars, target.value.output, ggg, jjj, kkk, params.OptTarget.target, aaa, bbb];

        //                                 } else {Flag ++;}
        //                         } else if (params.OptTarget.target == OPTIMISATION_TARGETS[1]) {
        //                                 if (( CapEx <  params.OptTarget.value) & ( RPS >  target.value.RPS)) {
        //                                         target.value.RPS =  RPS;
        //                                         Opt_Vars = ( Varsn)[i];
        //                                         d_Opt = Math.abs(OptVal_prev -  target.value.RPS);
        //                                         target.delta =  target.value.RPS*0.01;
        //                                         Flag = 0;
        //                                         target.value.output =  RPS;
        //                                         ggg =  CapEx
        //                                         jjj =  NPV
        //                                         kkk =  Economy
        //                                         aaa =  LCOE
        //                                         bbb =  OpEx;
        //                                         Condition = (Math.abs( target.value.capex -  CapEx) > 0.33* target.value.capex)
        //                                 } else {Flag ++;}
        //                         } else if (params.OptTarget.target == OPTIMISATION_TARGETS[2]) {
        //                                 if (( CapEx <  target.value.capex) & ( NPV >  target.value.NPV)) {
        //                                         target.value.NPV =  NPV;
        //                                         Opt_Vars = ( Varsn)[i];
        //                                         d_Opt = Math.abs(OptVal_prev -  target.value.NPV);
        //                                         target.delta = Math.abs( target.value.NPV*0.01);
        //                                         Flag = 0;
        //                                         target.value.output =  NPV;
        //                                         ggg =  CapEx
        //                                         jjj =  RPS
        //                                         kkk =  Economy
        //                                         aaa =  LCOE
        //                                         bbb =  OpEx;
        //                                         Condition = false;
        //                                         //Condition = (Math.abs(await target.value.capex - CapEx) > 0.33*await target.value.capex)
        // //for (let i = 0; i < 8760; i++) kkk[i] = (await Energy[i]).toString()
        //                                 } else {Flag ++;}
        //                         } else if (params.OptTarget.target == OPTIMISATION_TARGETS[3]) {
        //                                 if (( LCOE <  target.value.LCOE) & ( RPS >  target.value.RPS)) {
        // // console.log(CapEx, target.value.capex )
        //                                         target.value.LCOE =  LCOE;
        //                                         Opt_Vars = ( Varsn)[i];
        //                                         d_Opt = Math.abs( OptVal_prev -  target.value.LCOE);
        //                                         target.delta =  target.value.LCOE*0.01;
        //                                         Flag = 0;
        //                                         target.value.output =  LCOE;
        //                                         ggg =  RPS
        //                                         jjj =  NPV
        //                                         kkk =  Economy
        //                                         aaa =  CapEx;
        //                                         bbb =  OpEx;
        //                                         xxx = Energy[1];
        //                                         ccc = Energy_AfterDGS[1];
        //                                         Condition = (Math.abs( target.value.RPS -  RPS) > 0.33* target.value.RPS)

        //                                         for (let i = 4; i > 0; i--) {
        //                                                 Res_Array[i] = Res_Array[i-1];
        //                                         }
        //                                         Res_Array[0] = [Opt_Vars, target.value.output, ggg, jjj, kkk, params.OptTarget.target, aaa, bbb, Energy[1], Energy_AfterDGS[1]];

        //                                 } else {Flag ++;}
        //                         }
      }

      // console.log(Opt_Vars)
      // console.log("target.value.RPS " + target.value.RPS)
      // console.log("RPS " + ggg)
      // console.log(Varsn)

      if (Res_Array[0].Opt_Vars == "" || Res_Array[0].Condition) {
        // console.log("derefining")
        if (params.OptTarget.target == OPTIMISATION_TARGETS[0]) {
          target.value.capex = Optim.CapEx(Varsn[2][0]) * 100000;
        } else if (params.OptTarget.target == OPTIMISATION_TARGETS[1]) {
          target.value.capex = Optim.CapEx(Varsn[2][0]) * 100000;
        } else if (params.OptTarget.target == OPTIMISATION_TARGETS[2]) {
          target.value.NPV = NPV_global * 10;
        } else if (params.OptTarget.target == OPTIMISATION_TARGETS[3]) {
          target.value.LCOE = 10000;
        }
        step = step * 2;
        refining = 0;
        Vars = Optim.vars(
          Common_Sources,
          params.EnSource,
          Common_DSources,
          params.EnDSource,
          Common_Storages,
          params.EnStorage,
          N_steps,
          step,
          mid_load,
          refining,
        );
        for (let i = 0; i < Vars.length; i++) {
          for (let j = 0; j < orientation.length; j++) {
            Varsn[i * orientation.length + j] = [];
            Varsn[i * orientation.length + j][0] = [
              Vars[i][0],
              Vars[i][1],
              Vars[i][2],
              Vars[i][3],
              Vars[i][4],
              Vars[i][5],
              Vars[i][6],
            ];
            Varsn[i * orientation.length + j][1] = [
              orientation[j][0],
              orientation[j][1],
              orientation[j][2],
              orientation[j][3],
            ];
          }
        }
        hhh++;
      } else {
        // console.log("refining")
        Res_Array[0].Flag = 0;
        step = step * 0.5;
        refining = 1;
        Vars = Optim.vars(
          Common_Sources,
          params.EnSource,
          Common_DSources,
          params.EnDSource,
          Common_Storages,
          params.EnStorage,
          N_steps,
          step,
          1,
          refining,
        );
        Varsn = [];
        for (let i = 0; i < Vars.length; i++) {
          // for (let j = 0; j < orientationn.length; j++) {
          //         Varsn[i*orientationn.length + j] = [];
          //         Varsn[i*orientationn.length + j][0] = [];
          //         for (let k = 0; k < Vars[i].length; k++) {
          //                 Varsn[i*orientationn.length + j][0][k] = Vars[i][k] * Opt_Vars[0][k];
          //         }
          //         Varsn[i*orientationn.length + j][1] = [orientationn[j][0], orientationn[j][1], orientationn[j][2], orientationn[j][3]];
          // }
          Varsn[i] = [];
          Varsn[i][1] = [
            Res_Array[0].Vars[1][0],
            Res_Array[0].Vars[1][1],
            Res_Array[0].Vars[1][2],
            Res_Array[0].Vars[1][3],
          ];
          Varsn[i][0] = [];
          for (let j = 0; j < Vars[i].length; j++) {
            // if ((j == 3)||(j == 4))
            //         Varsn[i][0][j] = Vars[i][j];
            // else
            Varsn[i][0][j] = Vars[i][j] * Res_Array[0].Vars[0][j];
          }
        }
        nnn++;
      }

      // console.log(Res_Array);
      // console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
      // console.log(target.value);
      // console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");

      // console.log([d_Opt, target.delta, Flag, 6*(Varsn).length], step)
    }

    //         for (let i = 4; i > 0; i--) {
    //                 Res_Array[i] = Res_Array[i-1];
    //         }
    // // console.log(Res_Array);
    // // console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
    //         Res_Array[0] = [Opt_Vars, target.value.output, ggg, jjj, kkk, params.OptTarget.target, aaa, bbb, xxx, ccc];

    // return  [Opt_Vars, target.value.output, ggg, jjj, kkk, params.OptTarget.target, aaa, bbb]
    return Res_Array[0];
  }
}

module.exports = new calculation();
