import loader from '../images/loader.svg';

const LoadingPanel = () => {
  return (
    <section className="loading-panel">
      <img src={loader} alt="Loading" />
      <p>Querying CoinGecko API...</p>
    </section>
  );
}

export default LoadingPanel;
