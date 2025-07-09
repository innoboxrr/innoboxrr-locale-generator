#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const { extractStrings, extractStringsFromDirectory } = require('../lib/extractor');
const { generateLocaleJSON } = require('../lib/localeGenerator');

// Cargar .env si existe
require('dotenv').config();

const args = minimist(process.argv.slice(2));

// Mostrar ayuda
if (args.h || args.help) {
    console.log(`
🧰 locale-gen - Generador de traducciones

Uso:
  npx locale-gen [idiomas] [opciones]

Ejemplo:
  npx locale-gen es fr -t -f ./src -m __affiliate

Opciones:
  -t            Traducción automática con Google Translate
  -f [path]     Ruta del archivo/directorio (por defecto ./src)
  -m [método]   Método a buscar, por defecto __affiliate
  -h, --help    Mostrar esta ayuda

También puedes usar locale.config.js
`);
    process.exit(0);
}

// Leer archivo de configuración si existe
let config = {
    langs: args._,
    translate: !!args.t,
    file: args.f || './src',
    method: args.m || '__affiliate'
};

if (fs.existsSync('locale.config.js')) {
    const userConfig = require(path.resolve('locale.config.js'));
    config = {
        langs: userConfig.languages || config.langs,
        translate: userConfig.translate ?? config.translate,
        file: userConfig.sourcePath || config.file,
        method: userConfig.method || config.method
    };
}

if (!config.langs || config.langs.length === 0) {
    console.error('[ERROR] Debes especificar al menos un idioma.');
    process.exit(1);
}

// Extraer cadenas
const absPath = path.resolve(config.file);
let strings = [];

if (fs.statSync(absPath).isDirectory()) {
    strings = extractStringsFromDirectory(absPath, config.method);
} else {
    strings = extractStrings(absPath, config.method);
}

strings = [...new Set(strings)];

if (!strings.length) {
    console.log('[WARNING] No se encontraron cadenas.');
    process.exit(0);
}

const localesDir = path.join('src', 'locales');

// Generar traducciones
(async () => {
    for (const lang of config.langs) {
        await generateLocaleJSON(strings, lang, config.translate, localesDir);
    }
})();
