import { Item } from '@entities/items/models/item.entity';

/*
  Возвращает оптимальный набор оборудования, максимизированный по мощности (не больше целевой) и минимизированный по цене
  Задаче решается при помощи динамического программирования (восходящего подхода)
  items - массив оборудования
  totalPower - целевая мощность
 */
export const findOptimalCombination = (items: Item[], totalPower: number) => {
  console.log('findOptimalCombination');
  console.log('totalPower', totalPower);
  console.log('items', items);

  // dp - массив минимальных цен для каждой возможной мощности (от 0 до totalPower), инициализируется значением Infinity, кроме dp[0] = 0.
  const dp = new Array(totalPower + 1).fill(Infinity);
  dp[0] = 0;

  // choice - массив для отслеживания последнего добавленного товара при достижении каждой мощности
  const choice = new Array(totalPower + 1).fill(-1);

  // Заполнение массивов
  /*
      Для каждого товара и для каждой возможной мощности (начиная с мощности товара до целевой мощности):
      * Рассчитывается новая цена при добавлении товара
      * Если новая цена меньше текущего значения в dp, обновляется dp и записывается ID товара в choice
   */
  for (const product of items) {
    for (let power = product.power; power <= totalPower; power++) {
      const newPrice = dp[power - product.power] + product.price;
      if (newPrice < dp[power]) {
        dp[power] = newPrice;
        choice[power] = product.id;
      }
    }
  }

  console.log('dp', dp);

  // Поиск оптимальной мощности
  // Ищем максимальную достижимую мощность (начиная с totalPower и уменьшая до первой достижимой мощности).
  let bestPower = totalPower;
  while (bestPower > 0 && dp[bestPower] === Infinity) {
    bestPower--;
  }

  console.log('bestPower', bestPower);
  console.log('choice', choice);

  // Восстановление комбинации
  /*
      Используя массив choice, разворачиваем оптимальную комбинацию:
      * Начиная с найденной мощности, определяется какой товар был добавлен последним
      * Уменьшает текущую мощность на мощность этого товара
      * Повторяем процесс, пока не достигнет нулевой мощности
   */
  const countMap = new Map();
  let currentPower = bestPower;
  while (currentPower > 0 && choice[currentPower] !== -1) {
    const productId = choice[currentPower];
    const product = items.find((p) => p.id === productId);

    countMap.set(productId, (countMap.get(productId) || 0) + 1);
    currentPower -= product.power;
  }

  console.log(countMap);
  console.log(items);
  console.log(Array.from(countMap.entries()));

  // Формируем результат с количеством и объектами
  return Array.from(countMap.entries()).map(([id, count]) => {
    const item = items.find((i) => i.id === id);
    return {
      ...item,
      count: count,
    };
  });
};
