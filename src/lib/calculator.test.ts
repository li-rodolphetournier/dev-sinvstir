import { calculateDCA } from './calculator';
import { SimulationInput } from './types';

describe('Calculator Logic', () => {
  const mockHistoricalPrices: [number, number][] = [
    [new Date('2023-01-01').getTime(), 10],
    [new Date('2023-01-08').getTime(), 20],
    [new Date('2023-01-15').getTime(), 15],
    [new Date('2023-01-22').getTime(), 25],
    [new Date('2023-01-29').getTime(), 20], // Last known price
  ];

  it('should calculate "once" frequency correctly', () => {
    const input: SimulationInput = {
      assetId: 'test-coin',
      amount: 100,
      frequency: 'once',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-29'),
    };

    const result = calculateDCA(mockHistoricalPrices, input);

    expect(result.totalInvested).toBe(100);
    // At 2023-01-01, price is 10. Amount: 100. Acquired = 100/10 = 10 units.
    expect(result.totalAcquired).toBe(10);
    expect(result.averagePrice).toBe(10);
    // Final price is 20 (on 2023-01-29). Final capital = 10 units * 20 = 200.
    expect(result.finalCapital).toBe(200);
    // Performance = (200 - 100) / 100 * 100 = 100%
    expect(result.performance).toBe(100);
    expect(result.periodCount).toBe(1);
    expect(result.history.length).toBeGreaterThan(0);
  });

  it('should calculate "weekly" frequency correctly', () => {
    const input: SimulationInput = {
      assetId: 'test-coin',
      amount: 100,
      frequency: 'weekly',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-22'), // 4 weeks total
    };

    const result = calculateDCA(mockHistoricalPrices, input);

    expect(result.totalInvested).toBe(400); // 4 weeks * 100
    // Week 1: 100 / 10 = 10 units
    // Week 2: 100 / 20 = 5 units
    // Week 3: 100 / 15 = 6.666 units
    // Week 4: 100 / 25 = 4 units
    // Total Acquired = 10 + 5 + 6.666 + 4 = 25.666
    expect(result.totalAcquired).toBeCloseTo(25.666, 2);
    // Average price = 400 / 25.666 = ~15.58
    expect(result.averagePrice).toBeCloseTo(15.58, 1);

    // Final price at 2023-01-29 is 20
    const finalCapital = 25.666 * 20;
    expect(result.finalCapital).toBeCloseTo(finalCapital, 0);
  });

  it('should return empty result if no prices found', () => {
    const input: SimulationInput = {
      assetId: 'test-coin',
      amount: 100,
      frequency: 'monthly',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-12-31'),
    };

    const result = calculateDCA([], input);

    expect(result.totalInvested).toBe(0);
    expect(result.totalAcquired).toBe(0);
    expect(result.performance).toBe(0);
  });
});
