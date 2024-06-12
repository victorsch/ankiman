const fs = require('fs');

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
        // apkg.addCard('card #1 front', 'card #1 back');
        // apkg.addCard('card #2 front', 'card #2 back');
        // apkg.addCard('card #3 with image <img src="anki.png" />', 'card #3 back');

        apkg
            .save()
            .then(zip => {
                fs.writeFileSync('./output.apkg', zip, 'binary');
                console.log(`Package has been generated: output.apkg`);
            })
            .catch(err => console.log(err.stack || err));

        return {};
    } catch (error) {
        console.error('Error adding cards to deck for export:', error);
        throw error;
    }
}

module.exports = { addCards };
