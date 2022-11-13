const SSH2Promise = require('ssh2-promise');
const source = require('rfr');

const logger = source('src/logger');

async function remoteCommand(sshConfig, command) {
  const ssh = new SSH2Promise(sshConfig);

  let result = '';
  try {
    await ssh.connect();
    logger.info(`Connection established to: ${sshConfig.host}`);
    logger.info(`Running command: '${command}'`);
    result = await ssh.exec(command);
    logger.info(`result: '${result}'`);
  } catch (error) {
    logger.warn('Error running command on remote host', error);
    result = String(error);
  } finally {
    await ssh.close();
  }
  return result;
}

module.exports = { remoteCommand };
