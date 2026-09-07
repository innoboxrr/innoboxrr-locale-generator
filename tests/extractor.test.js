import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import extractor from '../lib/extractor.js'
import config from '../lib/config.js'

const { extractStrings, extractStringsFromDirectory } = extractor
const { resolveConfig, DEFAULTS } = config

let workspace;

const project = (files) => {
    workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'locale-'));

    Object.entries(files).forEach(([relative, content]) => {
        const full = path.join(workspace, relative);

        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, content);
    });

    return workspace;
};

afterEach(() => {
    if (workspace) {
        fs.rmSync(workspace, { recursive: true, force: true });
        workspace = undefined;
    }
});

describe('extractStrings', () => {
    it('encuentra las cadenas del metodo', () => {
        const dir = project({ 'a.js': `t('Crear') + t("Editar")` });

        expect(extractStrings(path.join(dir, 'a.js'), 't')).toEqual(['Crear', 'Editar']);
    });

    /**
     * El nombre se interpolaba sin escapar, asi que `$t` —el de vue-i18n—
     * acababa siendo un ancla de fin de linea seguida de una `t`, que no
     * coincide nunca: la extraccion devolvia cero cadenas en silencio.
     */
    it('un metodo con caracteres de regex funciona', () => {
        const dir = project({ 'a.vue': `<p>{{ $t('Hola') }}</p>` });

        expect(extractStrings(path.join(dir, 'a.vue'), '$t')).toEqual(['Hola']);
    });

    /**
     * Con `t` como nombre, `split('a')` tambien terminaba en `t('a')` y se
     * extraia como si fuera una cadena traducible.
     */
    it('no se come llamadas ajenas que acaban en el mismo nombre', () => {
        const dir = project({ 'a.js': `'x'.split('coma') + parseInt('10') + t('Real')` });

        expect(extractStrings(path.join(dir, 'a.js'), 't')).toEqual(['Real']);
    });

    it('admite comillas simples, dobles y plantilla', () => {
        const dir = project({ 'a.js': "t('a') + t(\"b\") + t(`c`)" });

        expect(extractStrings(path.join(dir, 'a.js'), 't')).toEqual(['a', 'b', 'c']);
    });

    it('admite espacios tras el parentesis', () => {
        const dir = project({ 'a.js': `t( 'Con espacio' )` });

        expect(extractStrings(path.join(dir, 'a.js'), 't')).toEqual(['Con espacio']);
    });

    it('respeta una comilla escapada dentro de la cadena', () => {
        const dir = project({ 'a.js': `t('No se\\'ha podido')` });

        expect(extractStrings(path.join(dir, 'a.js'), 't')).toEqual(["No se\\'ha podido"]);
    });

    it('descarta la cadena vacia', () => {
        const dir = project({ 'a.js': `t('') + t('Buena')` });

        expect(extractStrings(path.join(dir, 'a.js'), 't')).toEqual(['Buena']);
    });
});

describe('extractStringsFromDirectory', () => {
    it('recorre el arbol', () => {
        const dir = project({
            'a.js': `t('Uno')`,
            'sub/b.vue': `t('Dos')`,
            'sub/otro/c.jsx': `t('Tres')`,
        });

        expect(extractStringsFromDirectory(dir, 't').sort()).toEqual(['Dos', 'Tres', 'Uno']);
    });

    it('no entra en node_modules ni en dist', () => {
        const dir = project({
            'a.js': `t('Mia')`,
            'node_modules/x/b.js': `t('Ajena')`,
            'dist/c.js': `t('Compilada')`,
        });

        expect(extractStringsFromDirectory(dir, 't')).toEqual(['Mia']);
    });

    it('ignora las extensiones que no son de codigo', () => {
        const dir = project({ 'a.md': `t('En un markdown')`, 'b.js': `t('En codigo')` });

        expect(extractStringsFromDirectory(dir, 't')).toEqual(['En codigo']);
    });

    it('avisa por archivo cuando se le pide', () => {
        const dir = project({ 'a.js': `t('Uno')` });
        const seen = [];

        extractStringsFromDirectory(dir, 't', { onFile: (file, found) => seen.push([file, found]) });

        expect(seen).toHaveLength(1);
        expect(seen[0][1]).toEqual(['Uno']);
    });
});

describe('resolveConfig', () => {
    /**
     * Habia tres respuestas distintas a la misma pregunta dentro del paquete:
     * la ayuda del CLI decia __affiliate, el codigo usaba __lang y
     * locale.config.js traia __t.
     */
    it('hay un solo metodo por defecto', () => {
        expect(resolveConfig({}, project({})).method).toBe(DEFAULTS.method);
    });

    it('locale.config.js manda sobre los valores por defecto', () => {
        const dir = project({
            'locale.config.js': `module.exports = { method: '__mio', languages: ['fr'] }`,
        });

        const config = resolveConfig({}, dir);

        expect(config.method).toBe('__mio');
        expect(config.languages).toEqual(['fr']);
    });

    it('la linea de comandos manda sobre el archivo', () => {
        const dir = project({ 'locale.config.js': `module.exports = { method: '__mio' }` });

        expect(resolveConfig({ m: '__cli' }, dir).method).toBe('__cli');
    });

    it('los idiomas sueltos son los posicionales', () => {
        expect(resolveConfig({ _: ['es', 'fr'] }, project({})).languages).toEqual(['es', 'fr']);
    });

    it('-t enciende la traduccion', () => {
        expect(resolveConfig({ t: true }, project({})).translate).toBe(true);
        expect(resolveConfig({}, project({})).translate).toBe(false);
    });
});
