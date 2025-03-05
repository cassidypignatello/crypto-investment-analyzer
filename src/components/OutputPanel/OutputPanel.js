import './styles.css'
import Markdown from 'react-markdown';

const OutputPanel = ({ report }) => (
  <section className="output-panel">
    <h2>Your Crypto Report</h2>
    <Markdown>{report}</Markdown>
  </section>
);

export default OutputPanel;
