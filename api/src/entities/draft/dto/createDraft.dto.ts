import { Column } from 'typeorm';

export class CreateDraftDto {
  @Column({ name: 'coords', type: 'float', array: true })
  coords: number;

  @Column({ name: 'consumption_type', type: 'int' })
  consumption_type: number;

  @Column({ name: 'consumption_value', type: 'int', array: true })
  consumption_value: number;

  @Column({
    name: 'energy_sources',
    type: 'int',
    array: true,
  })
  energy_sources: number[];

  @Column({
    name: 'energy_storages',
    type: 'int',
    array: true,
  })
  energy_storages: number[];

  @Column({
    name: 'optimization_target',
    type: 'int',
  })
  optimization_target: number;
}
