const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 🔍 Cargar .env desde el proyecto donde se está usando el paquete
const projectRoot = process.cwd(); // <--- esto apunta al proyecto real
const envPath = path.join(projectRoot, '.env');

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config(); // fallback por si acaso
}

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
