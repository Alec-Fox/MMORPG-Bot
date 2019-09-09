var fs = require('fs');
logger = require('./logger.js');

/**
 * Spawns a Boss
 *
 * @param {object} content - content that will be added to file
 * @param {string} fileName - file to save content to
 */

exports.exportJson = (content, fileName) => {
    fs.writeFileSync(`../Data/${fileName}.json`, JSON.stringify(content));
}

