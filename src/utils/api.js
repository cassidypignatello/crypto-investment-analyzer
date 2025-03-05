import { getPastDates } from "./helper";

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? ''
  : 'http://localhost:3001';

const fetchCryptoList = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coins/list`);
    if (!response.ok) {
      throw new Error('Failed to fetch crypto list');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const matchCoinId = (ticker, cryptoList) => {
  const coin = cryptoList.find((coin) => {
    if (ticker === 'ETH') return coin.id === 'ethereum';
    if (ticker === 'BTC') return coin.id === 'bitcoin';
    return coin.symbol.toLowerCase() === ticker.toLowerCase();
  });

  if (!coin) {
    throw new Error(`No matching ID found for ${ticker}`);
  }
  return coin;
};

const fetchHistoricalPrice = async (coinId, date, ticker) => {
  const url = `${API_BASE_URL}/api/coins/${coinId}/history?date=${date}`;
  const response = await fetch(url);

  if (response.status === 429) {
    throw new Error('Rate limit reached. Please wait a moment and try again.');
  }

  if (!response.ok) {
    throw new Error(`Error fetching ${ticker} for date ${date}`);
  }

  const data = await response.json();
  return {
    date,
    price: data.market_data.current_price.usd
  };
};

const fetchCoinHistory = async (coin, dates) => {
  const priceData = [];

  for (const date of dates) {
    try {
      const priceInfo = await fetchHistoricalPrice(coin.id, date, coin.symbol);
      priceData.push(priceInfo);
    } catch (error) {
      if (error.message.includes('Rate limit')) {
        throw error;
      }
      console.error(`Error fetching ${coin.symbol} for ${date}:`, error);
    }
  }

  return {
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    prices: priceData
  };
};

export const fetchCryptoData = async (tickers, cryptoList, setCryptoList, setReport, setLoading) => {
  setLoading(true);

  try {
    let cryptoDataList = cryptoList;
    if (cryptoList.length === 0) {
      cryptoDataList = await fetchCryptoList();
      setCryptoList(cryptoDataList);
    }

    const dates = getPastDates(3);
    const historicalData = [];

    for (const ticker of tickers) {
      const coin = matchCoinId(ticker, cryptoDataList);
      const coinData = await fetchCoinHistory(coin, dates);
      historicalData.push(coinData);
    }

    const report = await fetchReport(historicalData);
    setReport(report);
  } catch (error) {
    setReport(`Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

export const fetchReport = async (data) => {
  const formattedData = data.map(coin => {
    const priceChanges = coin.prices.map((p, i, arr) => {
      if (i === arr.length - 1) return '';
      const changePercent = ((arr[i].price - arr[i + 1].price) / arr[i + 1].price * 100).toFixed(2);
      return `${arr[i].date}: $${p.price} (${changePercent}% change)`;
    }).join('\n');

    return `${coin.name} (${coin.symbol}):\n${priceChanges}`;
  }).join('\n\n');

  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: formattedData }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    const result = await response.json();
    return result.report;
  } catch (error) {
    console.error('Error:', error);
    return 'Error generating report, please refresh and try again.';
  }
};
