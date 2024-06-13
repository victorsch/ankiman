import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { getChatGptResponse } from './chatgpt.js';
import expressLayouts from 'express-ejs-layouts';
import sequelize from './db.js';
import User from './models/User.js';
import Query from './models/Query.js'
import { promisify } from 'util';
import fs from 'fs';

const unlinkAsync = promisify(fs.unlink);

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

// Sync database
sequelize.sync({ force: true }).then(() => {
    console.log('Database synced');
});

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
        const response = await getChatGptResponse(text, name, language, level);
        console.log('GPT-4 response:', response.gptResponse);

        // Store the result in the global variable
        resultData = {
            name,
            language,
            level,
            input: text,
            gptResponse: response.gptResponse,
            addCardsResponse: response.addCardsResponse,
            outputPath: response.addCardsResponse.outputPath
        };

        // Assuming user ID is 1 for this example, replace with actual user logic
        // const user = await User.findByPk(1);
        // const query = await Query.create({
        //     text: text,
        //     response: gptResponse,
        //     UserId: user.id,
        // });

        // // Assume gptResponse contains words in an array for simplicity
        // const words = [
        //     { text: 'слово1', definition: 'definition1', example: 'example1' },
        //     { text: 'слово2', definition: 'definition2', example: 'example2' },
        // ];

        // for (const word of words) {
        //     await Word.create({
        //         ...word,
        //         UserId: user.id,
        //         QueryId: query.id,
        //     });
        // }

        res.redirect('/results',);
    } catch (error) {
        res.status(500).send('Error processing your request');
    }
});

app.get('/api/result', (req, res) => {
    res.json(resultData);
});

app.get('/download/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'tmp', filename);

    res.download(filePath, filename, async (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(500).send('Error downloading file');
        } else {
            // Clean up the file after download
            try {
                await unlinkAsync(filePath);
                console.log(`File ${filename} deleted`);
            } catch (error) {
                console.error('Error deleting file:', error);
            }
        }
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
