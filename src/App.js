import { useState } from 'react';
import './App.css';
import { fetchCryptoData } from './utils/api';
import ActionPanel from './components/ActionPanel/ActionPanel';
import LoadingPanel from './components/LoadingPanel/LoadingPanel';
import OutputPanel from './components/OutputPanel/OutputPanel';

const App = () => {
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [cryptoList, setCryptoList] = useState([]);

  return (
    <>
      <header>
        <p>Cassidy's Totally Safu Crypto Predictions</p>
      </header>
      <main>
        {!loading && !report && (
          <ActionPanel
            tickers={tickers}
            setTickers={setTickers}
            fetchCryptoData={() => fetchCryptoData(tickers, cryptoList, setCryptoList, setReport, setLoading)}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
          />
        )}
        {loading && <LoadingPanel />}
        {report && <OutputPanel report={report} />}
      </main>
      <footer>&copy; Not financial advice, please always do your own research!</footer>
    </>
  );
}

export default App;
