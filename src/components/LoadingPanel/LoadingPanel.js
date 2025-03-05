import loader from '../../images/loader.svg';

const LoadingPanel = () => {
  return (
    <section className="loading-panel">
      <img src={loader} alt="Loading" />
      <p>Querying the oracle...</p>
    </section>
  );
}

export default LoadingPanel;
