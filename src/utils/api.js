import { getPastDates } from "./helper";
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

export const fetchCryptoData = async (tickers, cryptoList, setCryptoList, setReport, setLoading) => {
  setLoading(true);
  const dates = getPastDates(3);

  try {
    let cryptoDataList = cryptoList;

    if (cryptoList.length === 0) {
      cryptoDataList = await fetchCryptoList();
      setCryptoList(cryptoDataList);
    }

    const historicalData = await Promise.all(
      tickers.map(async (ticker) => {
        const coin = cryptoDataList.find((coin) => {
          if (ticker === 'ETH') return coin.id === 'ethereum';
          if (ticker === 'BTC') return coin.id === 'bitcoin';
          return coin.symbol.toLowerCase() === ticker.toLowerCase();
        });

        if (!coin) {
          throw new Error(`No matching ID found for ${ticker}`);
        }

        const priceData = await Promise.all(
          dates.map(async (date) => {
            const url = `https://api.coingecko.com/api/v3/coins/${coin.id}/history?date=${date}`;
            const options = {
              method: 'GET',
              headers: { accept: 'application/json', 'x-cg-demo-api-key': process.env.REACT_APP_COINGECKO_API_KEY },
            };
            const response = await fetch(url, options);
            if (!response.ok) {
              throw new Error(`Error fetching ${ticker} for date ${date}`);
            }
            const data = await response.json();
            return {
              date,
              price: data.market_data.current_price.usd
            };
          })
        );

        return {
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          prices: priceData
        };
      })
    );

    const report = await fetchReport(historicalData);
    setReport(report);
  } catch (error) {
    setReport(`Error fetching crypto data: ${error.message}`);
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
      content: 'You are a financial advisor who specializes in cryptocurrency investment. Analyze the 3-day price trends and write a report of no more than 150 words describing the cryptocurrencies\' performance and advising whether to buy, hold, or sell based on the data. Include relevant percentage changes in your analysis.'
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
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error: ', error);
    return 'Error generating report, please refresh and try again.';
  }
}
