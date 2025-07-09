const { extractStrings, extractStringsFromDirectory } = require('./lib/extractor');
const { generateLocaleJSON } = require('./lib/localeGenerator');
const { translateString } = require('./lib/translator');

module.exports = {
    extractStrings,
    extractStringsFromDirectory,
    generateLocaleJSON,
    translateString
};
