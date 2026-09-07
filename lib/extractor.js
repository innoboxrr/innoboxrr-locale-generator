const fs = require('fs');
const path = require('path');

const EXCLUDED = ['node_modules', 'dist', 'docs', '.git', 'vendor', 'coverage'];

const EXTENSIONS = /\.(vue|jsx?|tsx?|mjs|html|php)$/;

/**
 * Escapa el nombre del método para meterlo en una expresión regular.
 *
 * Se interpolaba tal cual, así que un método como `$t` —el de vue-i18n, y de
 * los más habituales— acababa siendo un ancla de fin de línea seguida de una
 * `t`, que no coincide nunca: la extracción devolvía cero cadenas en silencio.
 *
 * @param {string} value
 * @returns {string}
 */
const escapeForRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * La expresión que encuentra las llamadas al método de traducción.
 *
 * El `(?<![\w$])` de delante es lo que impide que un método corto se coma
 * llamadas ajenas: con `t` como nombre, `split('a')` también terminaba en
 * `t('a')` y se extraía como si fuera una cadena traducible.
 *
 * @param {string} methodName
 * @returns {RegExp}
 */
const callPattern = (methodName) => new RegExp(
    `(?<![\\w$])${escapeForRegExp(methodName)}\\(\\s*(['"\`])((?:\\\\.|(?!\\1).)*)\\1`,
    'g'
);

/**
 * Las cadenas traducibles de un archivo.
 *
 * @param {string} filePath
 * @param {string} methodName
 * @returns {string[]}
 */
const extractStrings = (filePath, methodName) => {
    const content = fs.readFileSync(filePath, 'utf8');

    return [...content.matchAll(callPattern(methodName))]
        // El grupo 2 es el contenido; el 1 es la comilla que lo abre.
        .map((match) => match[2])
        .filter((value) => value.trim() !== '');
};

/**
 * @param {string} directory
 * @param {string} methodName
 * @param {{onFile?: (file: string, strings: string[]) => void}} [options]
 * @returns {string[]}
 */
const extractStringsFromDirectory = (directory, methodName, options = {}) => {
    const strings = [];

    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir)) {
            const fullPath = path.join(dir, entry);

            if (fs.statSync(fullPath).isDirectory()) {
                if (! EXCLUDED.includes(entry)) {
                    walk(fullPath);
                }

                continue;
            }

            if (! EXTENSIONS.test(entry)) {
                continue;
            }

            const found = extractStrings(fullPath, methodName);

            if (found.length) {
                options.onFile?.(fullPath, found);
                strings.push(...found);
            }
        }
    };

    walk(directory);

    return strings;
};

module.exports = {
    extractStrings,
    extractStringsFromDirectory,
    callPattern,
    escapeForRegExp,
};
