const LoadingPanel = () => {
  return (
    <section className="loading-panel">
      <img src="/images/loader.svg" alt="Loading" />
      <p>Querying CoinGecko API...</p>
    </section>
  );
}

export default LoadingPanel;
