import { currentDate } from "./helper";
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

  try {
    let cryptoDataList = cryptoList;

    if (cryptoList.length === 0) {
      cryptoDataList = await fetchCryptoList();
      setCryptoList(cryptoDataList);
    }

    const responses = await Promise.all(
      tickers.map(async (ticker) => {
        const coin = cryptoDataList.find((coin) => coin.symbol.toUpperCase() === ticker);
        if (!coin) {
          throw new Error(`No matching ID found for ${ticker}`);
        }
        const url = `https://api.coingecko.com/api/v3/coins/${coin.id}/history?date=${currentDate}`;
        const options = {
          method: 'GET',
          headers: { accept: 'application/json', 'x-cg-demo-api-key': process.env.REACT_APP_COINGECKO_API_KEY },
        };
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`Error fetching ${ticker}`);
        }
        return await response.json();
      })
    );

    const report = fetchReport(responses)
    // setReport(report);
  } catch (error) {
    setReport('Error fetching crypto data.');
  } finally {
    setLoading(false);
  }
};

export const fetchReport = async (data) => {
  const messages = [
    { role: 'developer', content: 'You are a financial advisor who specializes in cryptocurrency investment. Write a report of no more than 150 words describing the cryptocurrency\'s performance and advising whether to buy, hold, or sell based on the data passed to you. Do not mention October 2023, and only the coin symbol like ETH or ADA, not Bifrost Bridged ETH.' },
    {
      role: 'user',
      content: data.map(coin => `${coin.name} (${coin.symbol.toUpperCase()}): $${coin.market_data.current_price.usd}`).join("\n"),
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
      store: true,
    });

    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('Error: ', error);
  }
}
