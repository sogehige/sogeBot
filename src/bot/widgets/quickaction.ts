import { getRepository } from 'typeorm';

import { QuickAction as qa, QuickActions } from '../database/entity/dashboard';
import { onStartup } from '../decorators/on';
import { error } from '../helpers/log';
import { app, authorize } from '../helpers/panel';
import Widget from './_interface';

class QuickAction extends Widget {
  @onStartup()
  enableAPI() {
    app?.get('/api/v1/quickaction', authorize, async (req, res) => {
      const userId = req.headers.userid;
      if (!userId) {
        res.status(400).send('Missing userId header');
      }
      const [actions, count] = await getRepository(qa).findAndCount({ where: { userId } });
      res.send({
        data: actions,
        count,
      });
    });
    app?.post('/api/v1/quickaction/', authorize, async (req, res) => {
      const userId = req.headers.userid;
      if (!userId) {
        res.status(400).send('Missing userId header');
      }
      const item = req.body as QuickActions.Item<QuickActions.Types>;
      try {
        if (item.order === -1) {
          item.order = await getRepository(qa).count({ userId: item.userId });
        }
        await getRepository(qa).save(item);
      } catch (e) {
        res.status(500).send(e);
      }
      res.status(200).send(item);
    });
    app?.delete('/api/v1/quickaction/:id', authorize, async (req, res) => {
      const userId = req.headers.userid;
      if (!userId) {
        res.status(400).send('Missing userId header');
      }

      try {
        const item = await getRepository(qa).findOneOrFail({ id: req.params.id, userId: String(userId) });

        await getRepository(qa).remove(item);

        // reorder
        const items = await getRepository(qa).find({ where: { userId }, order: { order: 'ASC' } });
        for (let i = 0; i < items.length; i++) {
          await getRepository(qa).save({ ...items[i], order: i });
        }
        res.status(404).send('Not Found');
      } catch (e) {
        error(e);
        res.status(500).send();
      }
    });
  }
}

export default new QuickAction();
