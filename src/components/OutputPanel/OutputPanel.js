import './styles.css'

const OutputPanel = ({ report }) => (
  <section className="output-panel">
    <h2>Your Crypto Report</h2>
    <pre>{report}</pre>
  </section>
);

export default OutputPanel;
