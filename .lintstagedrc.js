const config = require('aberlaas/configs/lintstaged.js');

// Stop linting all the json files
const jsonLintCommand = config['*.json'];
delete config['*.json'];

module.exports = {
  ...config,
  './*.json': jsonLintCommand,
};
