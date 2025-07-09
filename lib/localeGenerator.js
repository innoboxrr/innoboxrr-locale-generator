const fs = require('fs');
const path = require('path');
const { translateString } = require('./translator');

async function generateLocaleJSON(strings, lang, translate, outputDir) {
    const filePath = path.join(outputDir, `${lang}.json`);
    let existing = {};

    if (fs.existsSync(filePath)) {
        existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    for (const string of strings) {
        if (!(string in existing)) {
            existing[string] = translate
                ? await translateString(string, lang)
                : '';
        }
    }

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 4), 'utf8');

    console.log(`[✅] Archivo generado: ${filePath}`);
}

module.exports = { generateLocaleJSON };
