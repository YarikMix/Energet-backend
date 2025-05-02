import { setSeederFactory } from 'typeorm-extension';
import { Draft } from '@entities/draft/models/draft.entity';

export const DraftFactory = setSeederFactory(Draft, () => {
  const draft = new Draft();
  draft.coords = [55.75, 37.57];
  draft.consumption_type = 1;
  draft.consumption_value = [100];
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

  return draft;
});
