/* global describe it before */
const commons = require('../../../dest/commons');


require('../../general.js');

const db = require('../../general.js').db;
const message = require('../../general.js').message;

const top = (require('../../../dest/systems/top')).default;
const tmi = (require('../../../dest/tmi')).default;

const { getRepository } = require('typeorm');
const { User } = require('../../../dest/database/entity/user');

// users
const owner = { username: 'soge__' };

describe('Top - !top submonths', () => {
  before(async () => {
    await db.cleanup();
    await message.prepare();
  });

  it ('Add 10 users into db and last user will don\'t have any submonths', async () => {
    for (let i = 0; i < 10; i++) {
      await getRepository(User).save({
        userId: Math.floor(Math.random() * 100000),
        username: 'user' + i,
        subscribeCumulativeMonths: i * 100,
      });
    }
  });

  it('run !top submonths and expect correct output', async () => {
    top.submonths({ sender: { username: commons.getOwner() } });
    await message.isSentRaw('Top 10 (submonths): 1. @user9 - 900 months, 2. @user8 - 800 months, 3. @user7 - 700 months, 4. @user6 - 600 months, 5. @user5 - 500 months, 6. @user4 - 400 months, 7. @user3 - 300 months, 8. @user2 - 200 months, 9. @user1 - 100 months, 10. @user0 - 0 months', owner);
  });

  it('add user1 to ignore list', async () => {
    tmi.ignoreAdd({ sender: owner, parameters: 'user0' });
    await message.isSent('ignore.user.is.added', owner, { username: 'user0' });
  });

  it('run !top submonths and expect correct output', async () => {
    top.submonths({ sender: { username: commons.getOwner() } });
    await message.isSentRaw('Top 10 (submonths): 1. @user9 - 900 months, 2. @user8 - 800 months, 3. @user7 - 700 months, 4. @user6 - 600 months, 5. @user5 - 500 months, 6. @user4 - 400 months, 7. @user3 - 300 months, 8. @user2 - 200 months, 9. @user1 - 100 months', owner);
  });
});
