/* global describe it before */
const assert = require('assert');

const commons = require('../../../dest/commons');
const { getBot } = require('../../../dest/helpers/commons/getBot');
const { getLocalizedName } = require('../../../dest/helpers/getLocalized');
const scrim = (require('../../../dest/systems/scrim')).default;
const { translate } = require('../../../dest/translate');
require('../../general.js');
const db = require('../../general.js').db;
const message = require('../../general.js').message;

// users
const owner = { username: '__broadcaster__' };

describe('Scrim - full workflow', () => {
  describe('cooldown only', () => {
    before(async () => {
      await db.cleanup();
      await message.prepare();

      scrim.waitForMatchIdsInSeconds = 10;
    });

    it('Create cooldown only scrim for 1 minute', async () => {
      scrim.main({ sender: owner, parameters: '-c duo 1' });
    });

    it('Expecting 1 minute message cooldown', async () => {
      await message.isSent('systems.scrim.countdown', getBot(), {
        time: 1,
        type: 'duo',
        unit: getLocalizedName(1, translate('core.minutes')),
      });
    });

    it('Expecting 45 seconds message cooldown', async () => {
      await message.isSentRaw([
        'Snipe match (duo) starting in 40 seconds',
        'Snipe match (duo) starting in 45 seconds',
        'Snipe match (duo) starting in 50 seconds',
      ], getBot(), 20000);
    });

    it('Expecting 30 seconds message cooldown', async () => {
      await message.isSentRaw([
        'Snipe match (duo) starting in 25 seconds',
        'Snipe match (duo) starting in 30 seconds',
        'Snipe match (duo) starting in 35 seconds',
      ], getBot(), 20000);
    });

    it('Expecting 15 seconds message cooldown', async () => {
      await message.isSentRaw([
        'Snipe match (duo) starting in 10 seconds',
        'Snipe match (duo) starting in 15 seconds',
        'Snipe match (duo) starting in 20 seconds',
      ], getBot(), 20000);
    });

    it('Expecting 3 seconds message cooldown', async () => {
      await message.isSent('systems.scrim.countdown', getBot(), {
        time: '3.',
        type: 'duo',
        unit: '',
      }, 19000); // still need high wait time, because its after 15s
    });

    it('Expecting 2 seconds message cooldown', async () => {
      await message.isSent('systems.scrim.countdown', getBot(), {
        time: '2.',
        type: 'duo',
        unit: '',
      }, 3000);
    });

    it('Expecting 1 seconds message cooldown', async () => {
      await message.isSent('systems.scrim.countdown', getBot(), {
        time: '1.',
        type: 'duo',
        unit: '',
      }, 3000);
    });

    it('Expecting go! message', async () => {
      await message.isSent('systems.scrim.go', getBot(), {}, 3000);
    });

    it('NOT expecting put match id in chat message', async () => {
      await message.isNotSent('systems.scrim.putMatchIdInChat', getBot(), { command: '!snipe match' }, 19000);
    });

    it('NOT expecting empty message list', async () => {
      await message.isNotSent('systems.scrim.currentMatches', getBot(), { matches: '<' + translate('core.empty') + '>' }, 19000);
    });

    it('Check match list by command', async () => {
      const r = await scrim.match({ sender: { username: 'test' }, parameters: '' });
      assert.strictEqual(r[0].response, 'Current Matches: <empty>');
    });
  });

  describe('without matches', () => {
    before(async () => {
      await db.cleanup();
      await message.prepare();

      scrim.waitForMatchIdsInSeconds = 10;
    });

    it('Create scrim for 1 minute', async () => {
      scrim.main({ sender: owner, parameters: 'duo 1' });
    });

    it('Expecting 1 minute message cooldown', async () => {
      await message.isSent('systems.scrim.countdown', getBot(), {
        time: 1,
        type: 'duo',
        unit: getLocalizedName(1, translate('core.minutes')),
      });
    });

    it('Expecting 45 seconds message cooldown', async () => {
      await message.isSent('systems.scrim.countdown', getBot(), {
        time: 45,
        type: 'duo',
        unit: getLocalizedName(45, translate('core.seconds')),
      }, 19000);
    });

    it('Expecting 30 seconds message cooldown', async () => {
      await message.isSent('systems.scrim.countdown', getBot(), {
        time: 30,
        type: 'duo',
        unit: getLocalizedName(30, translate('core.seconds')),
      }, 19000);
    });

    it('Expecting 15 seconds message cooldown', async () => {
      await message.isSent('systems.scrim.countdown', getBot(), {
        time: 15,
        type: 'duo',
        unit: getLocalizedName(15, translate('core.seconds')),
      }, 19000);
    });

    it('Expecting 3 seconds message cooldown', async () => {
      await message.isSent('systems.scrim.countdown', getBot(), {
        time: '3.',
        type: 'duo',
        unit: '',
      }, 19000); // still need high wait time, because its after 15s
    });

    it('Expecting 2 seconds message cooldown', async () => {
      await message.isSent('systems.scrim.countdown', getBot(), {
        time: '2.',
        type: 'duo',
        unit: '',
      }, 3000);
    });

    it('Expecting 1 seconds message cooldown', async () => {
      await message.isSent('systems.scrim.countdown', getBot(), {
        time: '1.',
        type: 'duo',
        unit: '',
      }, 3000);
    });

    it('Expecting go! message', async () => {
      await message.isSent('systems.scrim.go', getBot(), {}, 3000);
    });

    it('Expecting put match id in chat message', async () => {
      await message.isSent('systems.scrim.putMatchIdInChat', getBot(), { command: '!snipe match' }, 19000);
    });

    it('Expecting empty message list', async () => {
      await message.isSent('systems.scrim.currentMatches', getBot(), { matches: '<' + translate('core.empty') + '>' }, 19000);
    });

    it('Check match list by command', async () => {
      const r = await scrim.match({ sender: { username: 'test' }, parameters: '' });
      assert.strictEqual(r[0].response, 'Current Matches: <empty>');
    });
  });

  describe('with matches', () => {
    before(async () => {
      await db.cleanup();
      await message.prepare();

      scrim.waitForMatchIdsInSeconds = 10;
    });

    it('Create scrim for 1 minute', async () => {
      scrim.main({ sender: owner, parameters: 'duo 1' });
    });

    it('Expecting 1 minute message cooldown', async () => {
      await message.isSent('systems.scrim.countdown', getBot(), {
        time: 1,
        type: 'duo',
        unit: getLocalizedName(1, translate('core.minutes')),
      });
    });

    it('Expecting 45 seconds message cooldown', async () => {
      await message.isSent('systems.scrim.countdown', getBot(), {
        time: 45,
        type: 'duo',
        unit: getLocalizedName(45, translate('core.seconds')),
      }, 19000);
    });

    it('Expecting 30 seconds message cooldown', async () => {
      await message.isSent('systems.scrim.countdown', getBot(), {
        time: 30,
        type: 'duo',
        unit: getLocalizedName(30, translate('core.seconds')),
      }, 19000);
    });

    it('Expecting 15 seconds message cooldown', async () => {
      await message.isSent('systems.scrim.countdown', getBot(), {
        time: 15,
        type: 'duo',
        unit: getLocalizedName(15, translate('core.seconds')),
      }, 19000);
    });

    it('Expecting 3 seconds message cooldown', async () => {
      await message.isSent('systems.scrim.countdown', getBot(), {
        time: '3.',
        type: 'duo',
        unit: '',
      }, 19000); // still need high wait time, because its after 15s
    });

    it('Expecting 2 seconds message cooldown', async () => {
      await message.isSent('systems.scrim.countdown', getBot(), {
        time: '2.',
        type: 'duo',
        unit: '',
      }, 3000);
    });

    it('Expecting 1 seconds message cooldown', async () => {
      await message.isSent('systems.scrim.countdown', getBot(), {
        time: '1.',
        type: 'duo',
        unit: '',
      }, 3000);
    });

    it('Expecting go! message', async () => {
      await message.isSent('systems.scrim.go', getBot(), {}, 3000);
    });

    it('Expecting put match id in chat message', async () => {
      await message.isSent('systems.scrim.putMatchIdInChat', getBot(), { command: '!snipe match' }, 19000);
    });

    for (const user of ['user1', 'user2', 'user3']) {
      const matchId = 'ABC';
      it('Add ' + user + ' to match with id ' + matchId, async () => {
        scrim.match({
          parameters: matchId,
          sender:     { username: user, userId: Math.floor(Math.random() * 100000) },
        });
      });
    }

    it('Add user4 to match with id ABD', async () => {
      scrim.match({
        parameters: 'ABD',
        sender:     { username: 'user4' },
      });
    });

    it('Expecting populated message list', async () => {
      await message.isSent('systems.scrim.currentMatches', getBot(),
        { matches: 'ABC - @user1, @user2, @user3 | ABD - @user4' }, 19000);
    });

    it('Check match list by command', async () => {
      const r = await scrim.match({ sender: { username: 'test' }, parameters: '' });
      assert.strictEqual(r[0].response, 'Current Matches: ABC - @user1, @user2, @user3 | ABD - @user4');
    });
  });
});
