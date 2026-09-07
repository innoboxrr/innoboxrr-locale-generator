#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

const { resolveConfig, DEFAULTS } = require('../lib/config');
const { extractStrings, extractStringsFromDirectory } = require('../lib/extractor');
const { generateLocaleJSON } = require('../lib/localeGenerator');

require('dotenv').config();

const args = minimist(process.argv.slice(2), { boolean: ['t', 'h', 'help', 'v', 'verbose'] });

if (args.h || args.help) {
    console.log(`
locale-gen - Generador de archivos de traduccion

Uso:
  npx locale-gen [idiomas] [opciones]

Ejemplo:
  npx locale-gen es en -t -f ./src -m t

Opciones:
  -t            Traduce con Google Translate (necesita GOOGLE_TRANSLATE_KEY)
  -f [ruta]     Archivo o directorio a analizar. Por defecto ${DEFAULTS.sourcePath}
  -o [ruta]     Donde escribir los .json. Por defecto ${DEFAULTS.outputPath}
  -m [metodo]   Metodo a buscar. Por defecto ${DEFAULTS.method}
  -v            Lista las cadenas encontradas en cada archivo
  -h, --help    Esta ayuda

Tambien se puede configurar en locale.config.js:

  module.exports = {
      languages: ['es', 'en'],
      method: 't',
      sourcePath: './src',
      outputPath: './src/locales',
      translate: false,
  }
`);

    process.exit(0);
}

const config = resolveConfig(args);

if (! config.languages?.length) {
    console.error('[ERROR] Debes especificar al menos un idioma.');
    process.exit(1);
}

const source = path.resolve(config.sourcePath);

if (! fs.existsSync(source)) {
    console.error(`[ERROR] No existe la ruta ${source}.`);
    process.exit(1);
}

const verbose = Boolean(args.v || args.verbose);

const onFile = verbose
    ? (file, found) => console.log(`[INFO] ${file}: ${found.length} cadenas`)
    : undefined;

const strings = [...new Set(
    fs.statSync(source).isDirectory()
        ? extractStringsFromDirectory(source, config.method, { onFile })
        : extractStrings(source, config.method)
)];

if (! strings.length) {
    console.log(`[AVISO] No se encontraron cadenas con el metodo '${config.method}' en ${source}.`);
    process.exit(0);
}

console.log(`[INFO] ${strings.length} cadenas con el metodo '${config.method}'.`);

(async () => {
    try {
        for (const lang of config.languages) {
            await generateLocaleJSON(strings, lang, config.translate, path.resolve(config.outputPath));
        }
    } catch (error) {
        // Sin esto, un fallo de la API de traduccion salia como un rechazo no
        // capturado y el proceso terminaba con codigo 0.
        console.error(`[ERROR] ${error.message}`);
        process.exit(1);
    }
})();
