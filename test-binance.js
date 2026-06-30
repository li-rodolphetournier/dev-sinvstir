const BINANCE = 'https://api.binance.com/api/v3';
async function fetchBinanceKlines(symbol, startMs, endMs) {
  const DAY_MS = 86_400_000;
  const MAX_LIMIT = 1000;
  const results = [];
  let cursor = startMs;
  while (cursor < endMs) {
    const batchEnd = Math.min(cursor + MAX_LIMIT * DAY_MS, endMs);
    const url = `${BINANCE}/klines?symbol=${symbol}&interval=1d&startTime=${cursor}&endTime=${batchEnd}&limit=${MAX_LIMIT}`;
    console.log('Fetching', url);
    const res = await fetch(url);
    const klines = await res.json();
    console.log('Got', klines.length);
    for (const k of klines) results.push([k[0], parseFloat(k[4])]);
    if (klines.length > 0 && klines.length < MAX_LIMIT) break;
    cursor = batchEnd + 1;
  }
  return results;
}
fetchBinanceKlines('BTCEUR', 1656512492000, 1782915692000)
  .then((r) => console.log('Total:', r.length))
  .catch(console.error);
