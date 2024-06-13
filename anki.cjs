const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { default: AnkiExport } = require('anki-apkg-export');
//const { default: AnkiExport } = require('../../dist');


// Function to save file in Node.js
function saveAs(blob, fileName) {
    const filePath = path.join(process.cwd(), fileName);
    fs.writeFileSync(filePath, Buffer.from(blob));
    console.log(`File saved as ${filePath}`);
}

async function addCards(cardData, name) {
    try {

        const apkg = new AnkiExport(name);

        console.log(cardData);
        console.log(typeof(cardData))
        cardData.words.forEach((card) => {
            apkg.addCard(card.word, card.definition + "\n\n\n<br /><br />" + card.context, { tags: ['article_word'] });
        })

        const filename = `${name}-${uuidv4()}.apkg`;
        const outputPath = path.join(__dirname, 'tmp', filename);

        if (!fs.existsSync(path.join(__dirname, 'tmp'))) {
            fs.mkdirSync(path.join(__dirname, 'tmp'));
        }

        let file = null;
        apkg
            .save()
            .then(zip => {
                file = zip
                fs.writeFileSync(outputPath, zip, 'binary');
                console.log(`Package has been generated: ${outputPath}`);
            })
            .catch(err => console.log(err.stack || err));

        return {file: file, outputPath: outputPath};
    } catch (error) {
        console.error('Error adding cards to deck for export:', error);
        throw error;
    }
}

module.exports = { addCards };
