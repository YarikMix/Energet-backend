import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@entities/user/models/user.entity';

@Entity('drafts')
export class Draft {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user)
  owner: User;

  @Column({
    type: 'float',
    array: true,
    nullable: true,
  })
  coords: number[];

  @Column({
    type: 'int',
    nullable: true,
  })
  consumption_type: number;

  @Column({
    type: 'int',
    array: true,
    nullable: true,
  })
  consumption_value: number[];

  @Column({
    type: 'json',
    nullable: true,
  })
  energy_sources: {
    solar: boolean;
    wind: boolean;
    TEG: boolean;
    DGS: boolean;
    FC: boolean;
  };

  @Column({
    type: 'json',
    nullable: true,
  })
  energy_storages: {
    AB: boolean;
    SC: boolean;
  };

  @Column({
    type: 'int',
    nullable: true,
  })
  optimization_target: number;
}
