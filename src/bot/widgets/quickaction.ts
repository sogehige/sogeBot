import { getRepository } from 'typeorm';

import { adminEndpoint } from '../helpers/socket';
import Widget from './_interface';

class QuickAction extends Widget {
  public sockets() {
    adminEndpoint(this.nsp, 'quickactions::getAll', async (userId, cb) => {
      try {
        const actions = await getRepository(QuickAction).find({ where: { userId } });
        cb(null, actions);
      } catch (e) {
        cb(e, []);
      }
    });
  }
}

export default new QuickAction();
