import { SimulationInput, SimulationResult, HistoryPoint } from './types';
import {
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  addDays,
  addWeeks,
  addMonths,
  isBefore,
  isEqual,
  format,
} from 'date-fns';

export function calculateDCA(
  historicalPrices: [number, number][], // [timestamp, price] array from CoinGecko
  input: SimulationInput
): SimulationResult {
  const { amount, frequency, startDate, endDate } = input;

  let totalInvested = 0;
  let totalAcquired = 0;
  const history: HistoryPoint[] = [];

  // Edge case: no prices
  if (historicalPrices.length === 0) {
    return createEmptyResult();
  }

  // Define date increment function based on frequency
  let incrementDate: (date: Date, amount: number) => Date;
  let periodLabel = 'périodes';
  let totalPeriods = 0;

  switch (frequency) {
    case 'daily':
      incrementDate = addDays;
      periodLabel = 'jours';
      totalPeriods = differenceInDays(endDate, startDate) + 1;
      break;
    case 'weekly':
      incrementDate = addWeeks;
      periodLabel = 'semaines';
      totalPeriods = Math.floor(differenceInWeeks(endDate, startDate)) + 1;
      break;
    case 'monthly':
      incrementDate = addMonths;
      periodLabel = 'mois';
      totalPeriods = Math.floor(differenceInMonths(endDate, startDate)) + 1;
      break;
    case 'once':
    default:
      incrementDate = (d) => addDays(d, 36500); // effectively stops after one iteration
      periodLabel = 'fois';
      totalPeriods = 1;
      break;
  }

  let currentDate = startDate;
  let priceIndex = 0;

  while (isBefore(currentDate, endDate) || isEqual(currentDate, endDate)) {
    // Find the closest price for currentDate
    const currentTimestamp = currentDate.getTime();

    // Advance priceIndex to the closest date
    while (
      priceIndex < historicalPrices.length - 1 &&
      Math.abs(historicalPrices[priceIndex + 1][0] - currentTimestamp) <
        Math.abs(historicalPrices[priceIndex][0] - currentTimestamp)
    ) {
      priceIndex++;
    }

    const currentPrice = historicalPrices[priceIndex][1];

    // Process investment
    const acquired = amount / currentPrice;
    totalInvested += amount;
    totalAcquired += acquired;

    history.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      acquired: totalAcquired,
      capitalValue: totalAcquired * currentPrice,
      invested: totalInvested,
      price: currentPrice,
    });

    // Advance to next period
    currentDate = incrementDate(currentDate, 1);

    if (frequency === 'once') break;
  }

  // If we couldn't make any investments, return empty
  if (totalInvested === 0) {
    return createEmptyResult();
  }

  // Fill in the rest of the history until endDate to show the capital evolution even without new investments
  const lastPrice = historicalPrices[historicalPrices.length - 1][1];
  const finalCapital = totalAcquired * lastPrice;
  const performance = ((finalCapital - totalInvested) / totalInvested) * 100;

  return {
    totalInvested,
    totalAcquired,
    averagePrice: totalInvested / totalAcquired,
    finalCapital,
    performance,
    periodCount: totalPeriods,
    periodLabel,
    history,
  };
}

function createEmptyResult(): SimulationResult {
  return {
    totalInvested: 0,
    totalAcquired: 0,
    averagePrice: 0,
    finalCapital: 0,
    performance: 0,
    periodCount: 0,
    periodLabel: '',
    history: [],
  };
}
