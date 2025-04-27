export const findOptimalCombinationUnbounded = (equipments, maxPowerLimit) => {
  // Инициализация массива динамического программирования
  const dp = Array.from({ length: maxPowerLimit + 1 }, () => ({
    price: Infinity,
    items: [],
  }));
  dp[0] = { price: 0, items: [] };

  // Заполнение массива dp с возможностью повторного использования
  for (let power = 0; power <= maxPowerLimit; power++) {
    for (const [index, eq] of equipments.entries()) {
      const newPower = power + eq.power;
      if (newPower > maxPowerLimit) continue;

      if (dp[power].price + eq.price < dp[newPower].price) {
        dp[newPower] = {
          price: dp[power].price + eq.price,
          items: [...dp[power].items, index],
        };
      }
    }
  }

  // Поиск наилучшей комбинации (максимальная мощность с минимальной стоимостью)
  let bestPower = 0;
  let bestprice = Infinity;
  let bestIndices = [];

  for (let power = maxPowerLimit; power >= 0; power--) {
    if (dp[power].price < Infinity) {
      if (
        power > bestPower ||
        (power === bestPower && dp[power].price < bestprice)
      ) {
        bestPower = power;
        bestprice = dp[power].price;
        bestIndices = dp[power].items;
      }
    }
  }

  // Группируем индексы для подсчета количества
  const countMap = new Map();
  for (const idx of bestIndices) {
    countMap.set(idx, (countMap.get(idx) || 0) + 1);
  }

  // Формируем результат с количеством и объектами
  return Array.from(countMap.entries()).map(([idx, count]) => ({
    ...equipments[idx],
    count: count,
  }));
};
