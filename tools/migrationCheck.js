const exec = require('child_process').exec;
const fs = require('fs');

const getMigrationType = require('../dest/helpers/getMigrationType').getMigrationType;
require('dotenv').config();

async function test() {
  await new Promise((resolve) => {
    exec('typeorm migration:run', {
      env: {
        'TYPEORM_ENTITIES': 'dest/database/entity/*.js',
        'TYPEORM_MIGRATIONS': `dest/database/migration/${getMigrationType(process.env.TYPEORM_CONNECTION)}/**/*.js`,
      },
    }, (error, stdout, stderr) => {
      if (stdout) {
        process.stdout.write(stdout);
      }
      resolve();
    });
  });

  let output = '';
  const expectedOutput = 'No changes in database schema were found - cannot generate a migration. To create a new empty migration use "typeorm migration:create" command\n';
  await new Promise(async (resolve) => {
    exec('typeorm migration:generate -n test', {
      env: {
        'TYPEORM_ENTITIES': 'dest/database/entity/*.js',
        'TYPEORM_MIGRATIONS': `dest/database/migration/${getMigrationType(process.env.TYPEORM_CONNECTION)}/**/*.js`,
      },
    }, (error, stdout, stderr) => {
      output += stdout;
      resolve();
    });
  });
  if (output !== expectedOutput) {
    await new Promise((resolve2) => {
      const cat = exec('cat ./*test*', {
        shell: true,
      });
      console.log('\n =================================== generated migration file  =================================== \n');
      cat.stdout.on('data', (data) => {
        process.stdout.write(data.toString());
      });
      cat.on('close', () => {
        resolve2();
      });
    });
  }
  process.exit(output === expectedOutput ? 0 : 1);
}

test();