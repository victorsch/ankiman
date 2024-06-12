import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { getChatGptResponse } from './chatgpt.js';

dotenv.config();

const app = express();

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse URL-encoded bodies and JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

let resultData = {};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/submit', async (req, res) => {
  const name = req.body.name;
  const text = req.body.text;
  console.log('Text received:', text);

  try {
    const gptResponse = await getChatGptResponse(text, name);
    console.log('GPT-4 response:', gptResponse);

    // Store the result in the global variable
    resultData = {
      input: text,
      gptResponse: gptResponse,
    };

    res.redirect('/results.html');
  } catch (error) {
    res.status(500).send('Error processing your request');
  }
});

app.get('/api/result', (req, res) => {
  res.json(resultData);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
