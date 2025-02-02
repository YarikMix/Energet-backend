import { setSeederFactory } from 'typeorm-extension';
import { Favourite } from '@entities/favourite/models/favourite.entity';

export const FavouriteFactory = setSeederFactory(Favourite, () => {
  return new Favourite();
});
