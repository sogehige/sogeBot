/* global describe it beforeEach */


const assert = require('chai').assert;
const _ = require('lodash');
require('../../general.js');

const db = require('../../general.js').db;
const message = require('../../general.js').message;

const { getRepository } = require('typeorm');
const { User } = require('../../../dest/entity/user');

// users
const owner = { userId: Math.random(), username: 'soge__' };
const user = { userId: Math.random(), username: 'testuser' };

const tests = [
  {
    user: owner.username,
    userId: owner.userId,
    points: 10,
    command: '!me',
    price: 15,
    priceOn: '!me',
    expected: true,
  },
  {
    user: user.username,
    userId: user.userId,
    points: 15,
    command: '!me',
    price: 15,
    priceOn: '!me',
    expected: true,
  },
  {
    user: user.username,
    userId: user.userId,
    points: 10,
    command: '!me',
    price: 15,
    priceOn: '!me',
    expected: false,
  },
  {
    user: user.username,
    userId: user.userId,
    points: 20,
    command: '!me',
    price: 15,
    priceOn: '!me',
    expected: true,
  },
];

describe('Price - check()', () => {
  beforeEach(async () => {
    await db.cleanup();
    await message.prepare();

    await getRepository(User).save({ username: user.username, userId: user.userId });
  });

  for (const test of tests) {
    it(`${test.user} with ${test.points} points calls ${test.command}, price on ${test.priceOn} set to ${test.price} and should ${test.expected ? 'pass' : 'fail'}`, async () => {
      await getRepository(User).update({ userId: user.userId }, { points: test.points });
      await global.db.engine.update(global.systems.price.collection.data, { command: test.priceOn }, { command: test.command, price: test.price, enabled: true });
      const haveEnoughPoints = await global.systems.price.check({ sender: { username: test.user, userId: test.userId }, message: test.command });
      assert.isTrue(haveEnoughPoints === test.expected);
    });
  }
});
