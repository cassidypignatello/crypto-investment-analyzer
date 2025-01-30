import './styles.css';

const ActionPanel = ({ tickers, setTickers, fetchCryptoData, errorMessage, setErrorMessage }) => {
  const addTicker = (e) => {
    e.preventDefault();
    const input = e.target.elements.ticker.value.trim().toUpperCase();

    if (input.length > 2) {
      setTickers([...tickers, input]);
      e.target.elements.ticker.value = '';
      setErrorMessage('');
    } else {
      setErrorMessage('You must add at least one ticker (min 3 letters).');
    }
  };

  return (
    <section className="action-panel">
      <form onSubmit={addTicker}>
        <label>
          Add up to 3 crypto tickers in your portfolio below to get a predictions report 👇
        </label>
        <div className="form-input-control">
          <input type="text" name="ticker" placeholder="BTC" />
          <button type="submit" className="add-ticker-btn">+</button>
        </div>
      </form>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <p className="ticker-choice-display">{tickers.length > 0 ? tickers.join(', ') : "Your tickers will appear here..."}</p>
      <button
        className="generate-report-btn"
        onClick={fetchCryptoData}
        disabled={tickers.length === 0}
      >
        Generate Report
      </button>
      <p className="tag-line">60% of the time, it works every time.</p>
    </section>
  );
};

export default ActionPanel;
