import Registry from './_interface';
import { isMainThread } from 'worker_threads';
import { generateUsername } from '../helpers/generateUsername';
import { getLocalizedName } from '../commons';

class Alerts extends Registry {
  constructor() {
    super();
    this.addMenu({ category: 'registry', name: 'alerts', id: '/registry/alerts/list' });
  }

  sockets () {
    if (this.socket === null) {
      return setTimeout(() => this.sockets(), 100);
    }

    this.socket.on('connection', (socket) => {
      socket.on('test', async (event: keyof Registry.Alerts.List) => {
        this.test({ event, isResub: Math.random() < 0.5 });
      });
    });
  }

  test(opts: { event: keyof Registry.Alerts.List; isResub: boolean }) {
    if (!isMainThread) {
      global.workers.sendToMaster({ type: 'call', ns: 'registries.alerts', fnc: 'test', args: [opts] });
      return;
    }

    const amount = Math.floor(Math.random() * 1000);
    const messages = [
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Etiam dictum tincidunt diam. Aliquam erat volutpat. Mauris tincidunt sem sed arcu. Etiam sapien elit, consequat eget, tristique non, venenatis quis, ante. Praesent id justo in neque elementum ultrices. Integer pellentesque quam vel velit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Etiam commodo dui eget wisi. Cras pede libero, dapibus nec, pretium sit amet, tempor quis. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
      'Lorem ipsum dolor sit amet',
      '',
    ]
    const data: Registry.Alerts.EmitData = {
      name: generateUsername(),
      amount,
      currency: global.currency.mainCurrency,
      monthsName: getLocalizedName(amount, 'core.months'),
      event: opts.event,
      isResub: opts.isResub,
      message: messages[Math.floor(Math.random() * messages.length)]
    };

    global.panel.io.of('/registries/alerts').emit('alert', data);
  }
}

export default Alerts;
export { Alerts };
