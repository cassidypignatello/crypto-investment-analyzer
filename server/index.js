const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'domain.com'
    : `http://localhost:${process.env.REACT_APP_PORT || 3000}`
}));

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

app.get('/api/coins/list', async (req, res) => {
  try {
    const response = await axios.get(`${COINGECKO_BASE_URL}/coins/list`, {
      headers: {
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching coin list:', error);
    res.status(500).json({ error: 'Failed to fetch coin list' });
  }
});

app.get('/api/coins/:id/history', async (req, res) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1200));
    const { id } = req.params;
    const { date } = req.query;

    const response = await axios.get(
      `${COINGECKO_BASE_URL}/coins/${id}/history?date=${date}`,
      {
        headers: {
          'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching coin history:', error);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch coin history',
      details: error.response?.data
    });
  }
});

app.post('/api/generate-report', async (req, res) => {
  try {
    const { data } = req.body;

    const messages = [
      {
        role: 'developer',
        content: `You are a crypto degenerate. Analyze the 3-day price trends and provide your unfiltered and humorous opinions in a report of no more than 150 words describing the cryptocurrencies' performance and advising whether to buy, hold, or sell based on the data. Include relevant percentage changes in your analysis. Your responses should be bold and brash, with a focus on entertaining and informing in equal measure. Your responses should not be taken seriously and should not be considered financial advice.`,
      },
      {
        role: 'user',
        content: data,
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 1.1,
    });

    res.json({ report: response.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error generating report' });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'API server running. Please use http://localhost:3000 for development' });
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
