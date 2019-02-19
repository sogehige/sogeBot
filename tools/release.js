const chalk = require('chalk');
const { spawnSync } = require('child_process');

const version = process.env.version;
const currentBranch = getCurrentBranch();
const isMajorRelease = version.toLowerCase().includes('snapshot');
const releaseVersion = isMajorRelease ? version.split('-')[0] : minorVersion();

doRelease();

function minorVersion() {
  // bump up minor version
  const [x, y, z] = version.split('.');
  return `${x}.${y}.${Number(z) + 1}`;
}

function getCurrentBranch() {
  const branches = spawnSync('git', ['branch']);
  const branch = branches.stdout.toString().split('\n').filter((o) => {
    return o.trim().startsWith('*');
  })[0].slice(2);
  return branch;
}

function doRelease() {
  console.log(chalk.inverse('RELEASE TOOL'));
  console.log('\t' + chalk.yellow('Release type:    ') + (isMajorRelease ? 'major' : 'minor'));
  console.log('\t' + chalk.yellow('Release version: ') + releaseVersion);
  console.log('\t' + chalk.yellow('Current branch:  ') + currentBranch);

  console.log('\n' + chalk.inverse('Creating release branch'));
  spawnSync('git', ['branch', '-D', 'release-' + releaseVersion]);
  spawnSync('git', ['checkout', '-b', 'release-' + releaseVersion]);

  if (isMajorRelease) {
    console.log('\n' + chalk.inverse('DOCS RELEASE'));
    console.log(chalk.yellow('1.') + ' Backup of current docs');
  }

  console.log('Push changes to release branch')

  console.log('\n' + chalk.inverse('Back to ' + currentBranch + ' branch'));
  spawnSync('git', ['checkout', currentBranch]);
}