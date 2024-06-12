import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { getChatGptResponse } from './chatgpt.js';
import expressLayouts from 'express-ejs-layouts';

dotenv.config();

const app = express();

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(expressLayouts)
app.set('layout', 'layout')
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse URL-encoded bodies and JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

let resultData = {};

app.get('/', (req, res) => {
    res.render('index', { title: 'Home', layout: 'layout.ejs' });
});

app.get('/results', (req, res) => {
    res.render('results', { title: 'Results', layout: 'layout.ejs', resultData });
});

app.post('/submit', async (req, res) => {
    const { name, language, level, text } = req.body;
    console.log('Text received:', text);

    try {
        const gptResponse = await getChatGptResponse(text, name, language, level);
        console.log('GPT-4 response:', gptResponse);

        // Store the result in the global variable
        resultData = {
            name,
            language,
            level,
            input: text,
            gptResponse: gptResponse,
          };

        res.redirect('/results', );
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
