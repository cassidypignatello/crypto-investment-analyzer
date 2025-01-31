import { useState } from 'react';
import './App.css';
import ActionPanel from './components/ActionPanel';

const App = () => {
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <>
      <header>
        <p>Cassidy's Totally Safe Crypto Predictions</p>
      </header>
      <main>
        {!loading && !report && (
          <ActionPanel
            tickers={tickers}
            setTickers={setTickers}
            // fetchCryptoData={fetchCryptoData}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
          />
        )}
      </main>
      <footer>&copy; Not financial advice, please always do your own research!</footer>
    </>
  );
}

export default App;
