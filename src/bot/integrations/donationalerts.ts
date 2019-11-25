import _ from 'lodash';
import chalk from 'chalk';
import * as constants from '../constants.js';
import { isMainThread } from '../cluster';

import Integration from './_interface';
import { onChange, onStartup } from '../decorators/on.js';
import { settings } from '../decorators';
import { ui } from '../decorators.js';
import { info, tip } from '../helpers/log.js';
import { triggerInterfaceOnTip } from '../helpers/interface/triggers.js';

import { getRepository } from 'typeorm';
import { User, UserTip } from '../database/entity/user';
import api from '../api.js';
import events from '../events.js';
import users from '../users.js';
import eventlist from '../overlays/eventlist.js';
import currency from '../currency';
import alerts from '../registries/alerts.js';

class Donationalerts extends Integration {
  socketToDonationAlerts: SocketIOClient.Socket | null = null;

  @settings()
  @ui({ type: 'text-input', secret: true })
  secretToken = '';

  constructor () {
    super();

    if (isMainThread) {
      setInterval(() => this.connect(), constants.HOUR); // restart socket each hour
    }
  }

  @onStartup()
  @onChange('enabled')
  onStateChange (key: string, val: boolean) {
    if (val) {
      this.connect();
    } else {
      this.disconnect();
    }
  }

  async disconnect () {
    if (this.socketToDonationAlerts !== null) {
      this.socketToDonationAlerts.removeAllListeners();
      this.socketToDonationAlerts.disconnect();
    }
  }

  @onChange('secretToken')
  async connect () {
    this.disconnect();

    if (this.secretToken.trim() === '' || !this.enabled) {
      return;
    }

    this.socketToDonationAlerts = require('socket.io-client').connect('wss://socket.donationalerts.ru:443',
      {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      });

    if (this.socketToDonationAlerts !== null) {
      this.socketToDonationAlerts.on('connect', () => {
        if (this.socketToDonationAlerts !== null) {
          this.socketToDonationAlerts.emit('add-user', { token: this.secretToken, type: 'minor' });
        }
        info(chalk.yellow('DONATIONALERTS.RU:') + ' Successfully connected socket to service');
      });
      this.socketToDonationAlerts.on('reconnect_attempt', () => {
        info(chalk.yellow('DONATIONALERTS.RU:') + ' Trying to reconnect to service');
      });
      this.socketToDonationAlerts.on('disconnect', () => {
        info(chalk.yellow('DONATIONALERTS.RU:') + ' Socket disconnected from service');
        this.disconnect();
        this.socketToDonationAlerts = null;
      });

      this.socketToDonationAlerts.off('donation').on('donation', async (data) => {
        data = JSON.parse(data);
        if (parseInt(data.alert_type, 10) !== 1) {
          return;
        }
        const additionalData = JSON.parse(data.additional_data);
        eventlist.add({
          event: 'tip',
          amount: data.amount,
          currency: data.currency,
          username: data.username.toLowerCase(),
          message: data.message,
          song_title: _.get(additionalData, 'media_data.title', undefined),
          song_url: _.get(additionalData, 'media_data.url', undefined),
          timestamp: Date.now(),
        });

        events.fire('tip', {
          username: data.username.toLowerCase(),
          amount: parseFloat(data.amount).toFixed(2),
          currency: data.currency,
          amountInBotCurrency: Number(currency.exchange(data.amount, data.currency, currency.mainCurrency)).toFixed(2),
          currencyInBot: currency.mainCurrency,
          message: data.message,
        });
        alerts.trigger({
          event: 'tips',
          name: data.username.toLowerCase(),
          amount: Number(parseFloat(data.amount).toFixed(2)),
          currency: data.currency,
          monthsName: '',
          message: data.message,
          autohost: false,
        });

        if (!data._is_test_alert) {
          let user = await getRepository(User).findOne({ where: { username: data.username.toLowerCase() }});
          let id;
          if (!user) {
            id = await users.getIdByName(data.username.toLowerCase());
            user = await getRepository(User).findOne({ where: { userId: id }});
            if (!user && id) {
              // if we still doesn't have user, we create new
              user = new User();
              user.userId = Number(id);
              user.username = data.username.toLowerCase();
              user = await getRepository(User).save(user);
            }
          } else {
            id = user.userId;
          }

          const newTip = new UserTip();
          newTip.amount = Number(data.amount);
          newTip.currency = data.currency;
          newTip.sortAmount = currency.exchange(Number(data.amount), data.currency, 'EUR');
          newTip.message = data.message;
          newTip.tippedAt = Date.now();

          if (user) {
            user.tips.push(newTip);
            await getRepository(User).save(user);
          }

          tip(`${data.username.toLowerCase()}${id ? '#' + id : ''}, amount: ${Number(data.amount).toFixed(2)}${data.currency}, message: ${data.message}`);

          if (api.isStreamOnline) {
            api.stats.currentTips += Number(currency.exchange(data.amount, data.currency, currency.mainCurrency));
          }
        }

        triggerInterfaceOnTip({
          username: data.username.toLowerCase(),
          amount: data.amount,
          message: data.message,
          currency: data.currency,
          timestamp: _.now(),
        });
      });
    }
  }
}

export default new Donationalerts();
