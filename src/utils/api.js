import { currentDate } from "./helper";

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

    console.log(responses)
    setReport(JSON.stringify(responses, null, 2));
  } catch (error) {
    setReport('Error fetching crypto data.');
  } finally {
    setLoading(false);
  }
};
