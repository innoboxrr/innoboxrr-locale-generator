const fs = require('fs');
const path = require('path');

const extractStrings = (filePath, methodName) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = new RegExp(`${methodName}\\(['"](.+?)['"]\\)`, 'g');
    const matches = [...content.matchAll(regex)].map(m => m[1]);
    if (matches.length > 0) {
        console.log(`[INFO] Cadenas encontradas en ${filePath}:`, matches);
    }
    return matches;
};

const extractStringsFromDirectory = (directory, methodName) => {
    const EXCLUDED = ['node_modules', 'dist', 'docs'];
    let strings = [];

    const walk = (dir) => {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
            const fullPath = path.join(dir, entry);
            if (fs.statSync(fullPath).isDirectory()) {
                if (!EXCLUDED.includes(entry)) walk(fullPath);
            } else if (/\.(vue|js|ts|html|py|php)$/.test(entry)) {
                strings.push(...extractStrings(fullPath, methodName));
            }
        }
    };

    console.log(`[INFO] Analizando directorio: ${directory}`);
    walk(directory);
    return strings;
};

module.exports = {
    extractStrings,
    extractStringsFromDirectory
};
