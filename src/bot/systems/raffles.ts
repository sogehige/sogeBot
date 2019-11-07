'use strict';

import * as _ from 'lodash';
import { isMainThread } from '../cluster';

import { getOwner, prepare, sendMessage } from '../commons';
import { command, default_permission, parser, settings } from '../decorators';
import { permission } from '../permissions';
import System from './_interface';
import { adminEndpoint } from '../helpers/socket';

import { getRepository } from 'typeorm';
import { User } from '../entity/user';

const TYPE_NORMAL = 0;
const TYPE_TICKETS = 1;

/*
 * !raffle                               - gets an info about raffle
 * !raffle open ![raffle-keyword] [-min #?] [-max #?] [-for followers,subscribers?]
 *                                       - open a new raffle with selected keyword,
 *                                       - -min # - minimal of tickets to join, -max # - max of tickets to join -> ticket raffle
 *                                       - -for followers,subscribers - who can join raffle, if empty -> everyone
 * !raffle remove                        - remove raffle without winner
 * !raffle pick                          - pick or repick a winner of raffle
 * ![raffle-keyword]                     - join a raffle
 */

class Raffles extends System {
  lastAnnounce: number = _.now();

  @settings('luck')
  subscribersPercent = 150;
  @settings('luck')
  followersPercent = 120;

  @settings()
  raffleAnnounceInterval = 10;

  constructor () {
    super();
    this.addWidget('raffles', 'widget-title-raffles', 'fas fa-gift');

    if (isMainThread) {
      this.announce();
    }
  }

  sockets () {
    adminEndpoint(this.nsp, 'pick', async (cb) => {
      this.pick();
    });
    adminEndpoint(this.nsp, 'open', async (message) => {
      this.open({ username: getOwner(), parameters: message });
    });
    adminEndpoint(this.nsp, 'close', async () => {
      global.db.engine.remove(this.collection.data, {});
      global.db.engine.remove(this.collection.participants, {});
    });
  }

  @parser({ fireAndForget: true })
  async messages (opts) {
    if (opts.skip) {
      return true;
    }

    const raffles = await global.db.engine.find(this.collection.data);
    if (_.isEmpty(raffles)) {
      return true;
    }

    const raffle = _.orderBy(raffles, 'timestamp', 'desc')[0];

    const isWinner = !_.isNil(raffle.winner) && raffle.winner === opts.sender.username;
    const isInFiveMinutesTreshold = _.now() - raffle.timestamp <= 1000 * 60 * 5;

    if (isWinner && isInFiveMinutesTreshold) {
      const winner = await global.db.engine.findOne(this.collection.participants, { username: opts.sender.username, raffle_id: raffle._id.toString() });
      winner.messages.push({
        timestamp: _.now(),
        text: opts.message,
      });
      await global.db.engine.update(this.collection.participants, { username: opts.sender.username, raffle_id: raffle._id.toString() }, { messages: winner.messages });
    }
    return true;
  }

  async announce () {
    clearTimeout(this.timeouts.raffleAnnounce);
    const raffle = await global.db.engine.findOne(this.collection.data, { winner: null });
    if (!(global.api.isStreamOnline) || _.isEmpty(raffle) || new Date().getTime() - new Date(this.lastAnnounce).getTime() < (this.raffleAnnounceInterval * 60 * 1000)) {
      this.timeouts.raffleAnnounce = global.setTimeout(() => this.announce(), 60000);
      return;
    }

    this.lastAnnounce = _.now();

    let locale = 'raffles.announce-raffle';
    if (raffle.type === TYPE_TICKETS) {
      locale = 'raffles.announce-ticket-raffle';
    }

    const eligibility: string[] = [];
    if (raffle.followers === true) {
      eligibility.push(await prepare('raffles.eligibility-followers-item'));
    }
    if (raffle.subscribers === true) {
      eligibility.push(await prepare('raffles.eligibility-subscribers-item'));
    }
    if (_.isEmpty(eligibility)) {
      eligibility.push(await prepare('raffles.eligibility-everyone-item'));
    }

    const message = await prepare(locale, {
      keyword: raffle.keyword,
      min: raffle.min,
      max: raffle.max,
      eligibility: eligibility.join(', '),
    });
    sendMessage(message, {
      username: global.oauth.botUsername,
      displayName: global.oauth.botUsername,
      userId: global.oauth.botId,
      emotes: [],
      badges: {},
      'message-type': 'chat',
    });

    this.timeouts.raffleAnnounce = global.setTimeout(() => this.announce(), 60000);
  }

  @command('!raffle remove')
  @default_permission(permission.CASTERS)
  async remove (self) {
    const raffle = await global.db.engine.findOne(this.collection.data, { winner: null });
    if (_.isEmpty(raffle)) {
      return;
    }

    await Promise.all([
      global.db.engine.remove(this.collection.data, { _id: raffle._id.toString() }),
      global.db.engine.remove(this.collection.participants, { raffle_id: raffle._id.toString() }),
    ]);

    self.refresh();
  }

  @command('!raffle open')
  @default_permission(permission.CASTERS)
  async open (opts) {
    const [followers, subscribers] = [opts.parameters.indexOf('followers') >= 0, opts.parameters.indexOf('subscribers') >= 0];
    let type = (opts.parameters.indexOf('-min') >= 0 || opts.parameters.indexOf('-max') >= 0) ? TYPE_TICKETS : TYPE_NORMAL;
    if (!global.systems.points.enabled) {
      type = TYPE_NORMAL;
    } // force normal type if points are disabled

    let minTickets = 0;
    let maxTickets = 100;

    if (type === TYPE_TICKETS) {
      let match;
      match = opts.parameters.match(/-min (\d+)/);
      if (!_.isNil(match)) {
        minTickets = match[1];
      }

      match = opts.parameters.match(/-max (\d+)/);
      if (!_.isNil(match)) {
        maxTickets = match[1];
      }
    }

    let keyword = opts.parameters.match(/(![\S]+)/);
    if (_.isNil(keyword)) {
      const message = await prepare('raffles.cannot-create-raffle-without-keyword');
      sendMessage(message, opts.sender, opts.attr);
      return;
    }
    keyword = keyword[1];

    // check if raffle running
    const raffle = await global.db.engine.findOne(this.collection.data, { winner: null });
    if (!_.isEmpty(raffle)) {
      const message = await prepare('raffles.raffle-is-already-running', { keyword: raffle.keyword });
      sendMessage(message, opts.sender, opts.attr);
      return;
    }

    await Promise.all([
      global.db.engine.insert(this.collection.data, {
        keyword: keyword,
        followers: followers,
        subscribers: subscribers,
        min: minTickets,
        max: maxTickets,
        type: type,
        winner: null,
        timestamp: _.now(),
      }),
      global.db.engine.remove(this.collection.participants, {}),
    ]);

    const eligibility: string[] = [];
    if (followers) {
      eligibility.push(await prepare('raffles.eligibility-followers-item'));
    }
    if (subscribers) {
      eligibility.push(await prepare('raffles.eligibility-subscribers-item'));
    }
    if (_.isEmpty(eligibility)) {
      eligibility.push(await prepare('raffles.eligibility-everyone-item'));
    }

    const message = await prepare(type === TYPE_NORMAL ? 'raffles.announce-raffle' : 'raffles.announce-ticket-raffle', {
      keyword: keyword,
      eligibility: eligibility.join(', '),
      min: minTickets,
      max: maxTickets,
    });
    sendMessage(message, {
      username: global.oauth.botUsername,
      displayName: global.oauth.botUsername,
      userId: global.oauth.botId,
      emotes: [],
      badges: {},
      'message-type': 'chat',
    });

    this.lastAnnounce = _.now();
  }

  @command('!raffle')
  async main (opts) {
    const raffle = await global.db.engine.findOne(this.collection.data, { winner: null });

    if (_.isEmpty(raffle)) {
      const message = await prepare('raffles.no-raffle-is-currently-running');
      sendMessage(message, opts.sender, opts.attr);
      return;
    }

    let locale = 'raffles.announce-raffle';
    if (raffle.type === TYPE_TICKETS) {
      locale = 'raffles.announce-ticket-raffle';
    }

    const eligibility: string[] = [];
    if (raffle.followers === true) {
      eligibility.push(await prepare('raffles.eligibility-followers-item'));
    }
    if (raffle.subscribers === true) {
      eligibility.push(await prepare('raffles.eligibility-subscribers-item'));
    }
    if (_.isEmpty(eligibility)) {
      eligibility.push(await prepare('raffles.eligibility-everyone-item'));
    }

    const message = await prepare(locale, {
      keyword: raffle.keyword,
      min: raffle.min,
      max: raffle.max,
      eligibility: eligibility.join(', '),
    });
    sendMessage(message, {
      username: global.oauth.botUsername,
      displayName: global.oauth.botUsername,
      userId: global.oauth.botId,
      emotes: [],
      badges: {},
      'message-type': 'chat',
    });
  }

  @parser()
  async participate (opts) {
    if (_.isNil(opts.sender) || _.isNil(opts.sender.username)) {
      return true;
    }

    const raffle = await global.db.engine.findOne(this.collection.data, { winner: null });
    let user = await getRepository(User).findOne({ userId: opts.sender.userId });
    if (!user) {
      user = new User();
      user.userId = opts.sender.userId;
      user.username = opts.sender.username;
      await getRepository(User).save(user);
    }

    if (_.isEmpty(raffle)) {
      return true;
    }

    const isStartingWithRaffleKeyword = opts.message.toLowerCase().startsWith(raffle.keyword.toLowerCase());
    if (!isStartingWithRaffleKeyword || _.isEmpty(raffle)) {
      return true;
    }

    opts.message = opts.message.toString().replace(raffle.keyword, '');
    let tickets = opts.message.trim() === 'all' && !_.isNil(await global.systems.points.getPointsOf(opts.sender.userId)) ? await global.systems.points.getPointsOf(opts.sender.userId) : parseInt(opts.message.trim(), 10);

    if (_.isEmpty(raffle)) { // shouldn't happen, but just to be sure (user can join when closing raffle)
      const message = await prepare('no-raffle-is-currently-running');
      sendMessage(message, opts.sender, opts.attr);
      return false;
    }

    if ((!_.isFinite(tickets) || tickets <= 0 || tickets > parseInt(raffle.max, 10) || tickets < parseInt(raffle.min, 10)) && raffle.type === TYPE_TICKETS) {
      return false;
    }
    if (!_.isFinite(tickets)) {
      tickets = 0;
    }

    const participant = await global.db.engine.findOne(this.collection.participants, { raffle_id: raffle._id.toString(), username: opts.sender.username });
    let curTickets = 0;
    if (!_.isEmpty(participant)) {
      curTickets = parseInt(participant.tickets, 10);
    }
    let newTickets = curTickets + tickets;

    if (newTickets > raffle.max) {
      newTickets = raffle.max;
    }
    tickets = newTickets - curTickets;

    const participantUser = {
      eligible: !_.isEmpty(participant) ? participant.eligible : true, // get latest eligible to not bypass winner/manual set false
      tickets: raffle.type === TYPE_NORMAL ? 1 : newTickets,
      username: opts.sender.username,
      messages: [],
      is: {
        follower: user.isFollower,
        subscriber: user.isSubscriber,
      },
      raffle_id: raffle._id.toString(),
    };
    if (raffle.type === TYPE_TICKETS && await global.systems.points.getPointsOf(opts.sender.userId) < tickets) {
      return false;;
    } // user doesn't have enough points

    if (raffle.followers && raffle.subscribers) {
      participantUser.eligible = user.isFollower || user.isSubscriber;
    } else if (raffle.followers) {
      participantUser.eligible = user.isFollower;
    } else if (raffle.subscribers) {
      participantUser.eligible = user.isSubscriber;
    }

    if (participantUser.eligible) {
      if (raffle.type === TYPE_TICKETS) {
        await getRepository(User).decrement({ userId: opts.sender.userId }, 'points', tickets);
      }
      await global.db.engine.update(this.collection.participants, { raffle_id: raffle._id.toString(), username: opts.sender.username }, participantUser);
    }
    return true;
  }

  @command('!raffle pick')
  @default_permission(permission.CASTERS)
  async pick () {
    const raffles = await global.db.engine.find(this.collection.data);
    if (_.size(raffles) === 0) {
      return true;
    } // no raffle ever

    // get only latest raffle
    const raffle = _.orderBy(raffles, 'timestamp', 'desc')[0];

    const participants = await global.db.engine.find(this.collection.participants, { raffle_id: raffle._id.toString(), eligible: true });
    if (participants.length === 0) {
      const message = await prepare('raffles.no-participants-to-pick-winner');
      sendMessage(message, {
        username: global.oauth.botUsername,
        displayName: global.oauth.botUsername,
        userId: global.oauth.botId,
        emotes: [],
        badges: {},
        'message-type': 'chat',
      });
      return true;
    }

    let _total = 0;
    const [fLuck, sLuck] = await Promise.all([this.followersPercent, this.subscribersPercent]);
    for (const participant of _.filter(participants, (o) => o.eligible)) {
      if (!_.isNil(participant.is) && (participant.is.follower || participant.is.subscriber)) {
        if (participant.is.subscriber) {
          _total = _total + ((participant.tickets / 100) * sLuck);
        } else if (participant.is.follower) {
          _total = _total + ((participant.tickets / 100) * fLuck);
        }
      } else {
        _total = _total + participant.tickets;
      }
    }

    let winNumber = _.random(0, _total - 1, false);
    let winner;
    for (const participant of _.filter(participants, (o) => o.eligible)) {
      let tickets = participant.tickets;

      if (!_.isNil(participant.is) || (participant.is.follower && participant.is.subscriber)) {
        if (participant.is.subscriber) {
          tickets = ((participant.tickets / 100) * sLuck);
        } else if (participant.is.follower) {
          tickets = ((participant.tickets / 100) * fLuck);
        }
      }

      winNumber = winNumber - tickets;
      winner = participant;
      if (winNumber <= 0) {
        break;
      }
    }

    let tickets = winner.tickets;
    if (!_.isNil(winner.is) || (winner.is.follower && winner.is.subscriber)) {
      if (winner.is.subscriber) {
        tickets = ((winner.tickets / 100) * sLuck);
      } else if (winner.is.follower) {
        tickets = ((winner.tickets / 100) * fLuck);
      }
    }

    const probability = (tickets / _total * 100);

    // uneligible winner (don't want to pick second time same user if repick)
    await Promise.all([
      global.db.engine.update(this.collection.participants, { raffle_id: raffle._id.toString(), username: winner.username }, { eligible: false }),
      global.db.engine.update(this.collection.data, { _id: raffle._id.toString() }, { winner: winner.username, timestamp: new Date().getTime() }),
    ]);

    const message = await prepare('raffles.raffle-winner-is', {
      username: winner.username,
      keyword: raffle.keyword,
      probability: _.round(probability, 2),
    });
    sendMessage(message, {
      username: global.oauth.botUsername,
      displayName: global.oauth.botUsername,
      userId: global.oauth.botId,
      emotes: [],
      badges: {},
      'message-type': 'chat',
    });
  }
}

export default Raffles;
export { Raffles };
