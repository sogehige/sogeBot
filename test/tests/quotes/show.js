/* global describe it before */


require('../../general.js');

const db = require('../../general.js').db;
const message = require('../../general.js').message;

const { getRepository } = require('typeorm');
const { User } = require('../../../dest/entity/user');

// users
const owner = { username: 'soge__', userId: '1' };

const tests = [
  { sender: owner, parameters: '', shouldFail: true, error: 'systems.quotes.show.error.no-parameters' },
  { sender: owner, parameters: '-id', shouldFail: true, error: 'systems.quotes.show.error.no-parameters' },
  { sender: owner, parameters: '-tag', shouldFail: true, error: 'systems.quotes.show.error.no-parameters' },
  { sender: owner, parameters: '-tag      -id     ', shouldFail: true, error: 'systems.quotes.show.error.no-parameters' },
  { sender: owner, parameters: '-tag -id', shouldFail: true, error: 'systems.quotes.show.error.no-parameters' },
  { sender: owner, parameters: '-id -tag', shouldFail: true, error: 'systems.quotes.show.error.no-parameters' },


  { sender: owner, parameters: '-id $id', id: 1, tag: 'general', shouldFail: false, exist: true },
  { sender: owner, parameters: '-id $id -tag', id: 1, tag: 'general', shouldFail: false, exist: true },
  { sender: owner, parameters: '-id 732ff1bd-711f-457a-bef9-8a83eb8fc4b0', id: '732ff1bd-711f-457a-bef9-8a83eb8fc4b0', tag: 'general', shouldFail: false, exist: false },
  { sender: owner, parameters: '-id 732ff1bd-711f-457a-bef9-8a83eb8fc4b0 -tag', id: '732ff1bd-711f-457a-bef9-8a83eb8fc4b0', tag: 'general', shouldFail: false, exist: false },

  { sender: owner, parameters: '-tag lorem ipsum', id: 1, tag: 'lorem ipsum', shouldFail: false, exist: true },
  { sender: owner, parameters: '-tag general', id: 1, tag: 'general', shouldFail: false, exist: false },
];

describe('Quotes - main()', () => {
  for (const test of tests) {
    describe(test.parameters, async () => {
      before(async () => {
        await db.cleanup();
        await message.prepare();
        await getRepository(User).save({ username: user.username, userId: user.userId });
        const quote = await global.systems.quotes.add({ sender: test.sender, parameters: '-tags lorem ipsum -quote Lorem Ipsum', command: '!quote add' });
        id = quote.id;
        if (test.id === 1) {
          test.id = id;
        }
        test.parameters = test.parameters.replace('$id', id);
      });

      it('Run !quote', async () => {
        global.systems.quotes.main({ sender: test.sender, parameters: test.parameters, command: '!quote' });
      });
      if (test.shouldFail) {
        it('Should throw error', async () => {
          await message.isSent(test.error, owner, { command: '!quote' });
        });
      } else {
        if (test.exist) {
          it('Should show quote', async () => {
            await message.isSent('systems.quotes.show.ok', owner, { id, quotedBy: 'soge__', quote: 'Lorem Ipsum' });
          });
        } else {
          it('Should sent not-found message', async () => {
            await message.isSent(['systems.quotes.show.error.not-found-by-id', 'systems.quotes.show.error.not-found-by-tag'], owner, { id: test.id, tag: test.tag });
          });
        }
      }
    });
  }
});
