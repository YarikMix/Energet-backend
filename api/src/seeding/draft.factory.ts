import { setSeederFactory } from 'typeorm-extension';
import { Draft } from '@entities/draft/models/draft.entity';
import { generateRandomFloat, generateRandomInt } from '../utils/helpers';

export const DraftFactory = setSeederFactory(Draft, () => {
  const draft = new Draft();
  draft.coords = [generateRandomFloat(55, 56), generateRandomFloat(37, 38)];
  draft.consumption_type = generateRandomInt(1, 2);
  if (draft.consumption_type == 1) {
    draft.consumption_value = [generateRandomInt(10, 200)];
  } else {
    draft.consumption_value = [
      generateRandomInt(10, 200),
      generateRandomInt(10, 200),
      generateRandomInt(10, 200),
      generateRandomInt(10, 200),
    ];
  }
  draft.energy_sources = {
    solar: true,
    wind: true,
    TEG: true,
    DGS: true,
    FC: true,
  };
  draft.energy_storages = {
    AB: true,
    SC: true,
  };
  draft.optimization_target = generateRandomInt(1, 2);

  return draft;
});
