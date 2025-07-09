const axios = require('axios');

const API_KEY = process.env.GOOGLE_TRANSLATE_KEY;
const API_URL = 'https://translation.googleapis.com/language/translate/v2';

async function translateString(text, targetLang) {
    if (!API_KEY) throw new Error('Falta GOOGLE_TRANSLATE_KEY en .env');

    if (!text.trim()) return text;

    const response = await axios.post(
        API_URL,
        { q: text, target: targetLang },
        { params: { key: API_KEY } }
    );

    if (response.status === 200) {
        return response.data.data.translations[0].translatedText;
    } else {
        throw new Error(`Error en API: ${response.statusText}`);
    }
}

module.exports = { translateString };
