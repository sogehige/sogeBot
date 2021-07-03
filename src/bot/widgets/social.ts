import { getRepository } from 'typeorm';

import { WidgetSocial } from '../database/entity/widget';
import { publicEndpoint } from '../helpers/socket';
import Widget from './_interface';

class Social extends Widget {
  sockets() {
    publicEndpoint(this.nsp, 'generic::getAll', async (opts: { limit?: number }, cb) => {
      if (cb) {
        cb(
          null,
          await getRepository(WidgetSocial).find({
            take:  opts.limit,
            order: { timestamp: 'DESC' },
          }),
        );
      }
    });
  }
}

export default new Social();
