const YAML = require('yaml');
const fs = require('node:fs');
// const source = require('rfr');

// const logger = source('src/logger');
const { readFileSync } = require('fs');
const parse = require('parse-duration');

function loadConfig(configFile) {
  const file = fs.readFileSync(configFile, { encoding: 'utf8', flag: 'r' });
  const config = YAML.parse(file);

  const keyFile = config.connection.privateKeyFile || process.env.KEY_FILE;
  if (keyFile !== undefined) {
    config.connection.privateKey = readFileSync(keyFile);
  }
  config.reload_time = parse(config.reload_time || '0m');

  return config;
}

module.exports = {
  loadConfig,
};
