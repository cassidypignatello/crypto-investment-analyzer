import { getPastDates, delay } from "./helper";
import OpenAI from 'openai';

const fetchCryptoList = async () => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/list');
    if (!response.ok) {
      throw new Error('Failed to fetch crypto list');
    }

    return await response.json();
  } catch (error) {
    console.error(error);
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
  await delay(1200);
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/history?date=${date}`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'x-cg-demo-api-key': process.env.REACT_APP_COINGECKO_API_KEY
    },
  };

  const response = await fetch(url, options);

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

  const messages = [
    {
      role: 'developer',
      content: `You are a crypto degenerate. Analyze the 3-day price trends and provide your unfiltered and humorous opinions in a report of no more than 150 words describing the cryptocurrencies' performance and advising whether to buy, hold, or sell based on the data. Include relevant percentage changes in your analysis. Your responses should be bold and brash, with a focus on entertaining and informing in equal measure. Your responses should not be taken seriously and should not be considered financial advice.`,
    },
    {
      role: 'user',
      content: formattedData,
    },
  ];

  try {
    const openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 1.1,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error: ', error);
    return 'Error generating report, please refresh and try again.';
  }
}
