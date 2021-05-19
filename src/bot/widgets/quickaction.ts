import { getRepository } from 'typeorm';

import { QuickAction as qa } from '../database/entity/dashboard';
import { error } from '../helpers/log';
import { adminEndpoint } from '../helpers/socket';
import Widget from './_interface';

class QuickAction extends Widget {
  public sockets() {
    adminEndpoint(this.nsp, 'quickactions::getAll', async (userId, cb) => {
      try {
        const actions = await getRepository(qa).find({ where: { userId } });
        cb(null, actions);
      } catch (e) {
        cb(e, []);
      }
    });
    adminEndpoint(this.nsp, 'quickaction::save', async (item, cb) => {
      try {
        if (item.order === -1) {
          item.order = await getRepository(qa).count({ userId: item.userId });
        }
        await getRepository(qa).save(item);
        cb ? cb(null) : null;
      } catch (e) {
        cb ? cb(e) : null;
      }
    });
    adminEndpoint(this.nsp, 'quickaction::remove', async (id, cb) => {
      try {
        const item = await getRepository(qa).findOneOrFail(id);

        await getRepository(qa).remove(item);

        // reorder
        const items = await getRepository(qa).find({ where: { userId: item.userId }, order: { order: 'ASC' } });
        for (let i = 0; i < items.length; i++) {
          await getRepository(qa).save({ ...items[i], order: i });
        }
      } catch (e) {
        error(e);
      }
    });

  }
}

export default new QuickAction();
