const fs = require('fs');
const path = require('path');

/**
 * El método por defecto.
 *
 * Había tres respuestas distintas a la misma pregunta dentro del paquete: la
 * ayuda del CLI decía `__affiliate`, el código del CLI usaba `__lang` y
 * `locale.config.js` traía `__t`. Aquí hay una.
 *
 * `t` es el que exporta innoboxrr-i18n y el que emite el generador.
 */
const DEFAULT_METHOD = 't';

const DEFAULTS = {
    languages: ['es', 'en'],
    method: DEFAULT_METHOD,
    sourcePath: './src',
    outputPath: './src/locales',
    translate: false,
};

/**
 * Resuelve la configuración: los valores por defecto, lo que diga
 * `locale.config.js` y lo que llegue por la línea de comandos, en ese orden.
 *
 * @param {object} args  lo que devuelve minimist
 * @param {string} [cwd]
 * @returns {{languages: string[], method: string, sourcePath: string, outputPath: string, translate: boolean}}
 */
const resolveConfig = (args = {}, cwd = process.cwd()) => {
    const configPath = path.join(cwd, 'locale.config.js');

    const fromFile = fs.existsSync(configPath) ? require(configPath) : {};

    const fromArgs = {
        languages: args._?.length ? args._ : undefined,
        method: args.m,
        sourcePath: args.f,
        outputPath: args.o,
        translate: args.t ? true : undefined,
    };

    const merged = { ...DEFAULTS, ...clean(fromFile), ...clean(fromArgs) };

    return merged;
};

const clean = (object) => Object.fromEntries(
    Object.entries(object ?? {}).filter(([, value]) => value !== undefined)
);

module.exports = { DEFAULTS, DEFAULT_METHOD, resolveConfig };
