import { getRepository } from 'typeorm';

import { parserReply } from '../commons';
import { QuickAction as qa, QuickActions } from '../database/entity/dashboard';
import { onStartup } from '../decorators/on';
import { getUserSender } from '../helpers/commons';
import { error, info } from '../helpers/log';
import { app, authorize } from '../helpers/panel';
import Widget from './_interface';

class QuickAction extends Widget {
  @onStartup()
  enableAPI() {
    /**
     * @swagger
     * /api/v1/quickaction:
     *   get:
     *     tags:
     *      - Quick Actions
     *     security:
     *      - bearerAuth: []
     *     summary: Retrieve a list of quick actions
     *     description: Retrieve a list of quick actions for current authenticated user
     *     responses:
     *       '200':
     *         description: OK
     *       '401':
     *         description: Not authenticated
     *   post:
     *     tags:
     *      - Quick Actions
     *     security:
     *      - bearerAuth: []
     *     consumes:
     *      - application/json
     *     summary: Add new quick action item
     *     description: Add new quick action item for current authenticated user
     *     responses:
     *       '200':
     *         description: OK
     *       '401':
     *         description: Not authenticated
     *       '400':
     *         description: Bad request
    */
    app?.get('/api/v1/quickaction', authorize, async (req, res) => {
      const userId = req.headers.userid as string;
      const actions = await getRepository(qa).find({ where: { userId } });
      res.send({
        data:   actions,
        paging: null,
      });
    });
    app?.post('/api/v1/quickaction/', authorize, async (req, res) => {
      const userId = req.headers.userid as string;
      const item = req.body as QuickActions.Item;
      try {
        if (item.order === -1) {
          item.order = await getRepository(qa).count({ userId });
        }
        await getRepository(qa).save({ ...item, userId });
      } catch (e) {
        res.status(400).send(e);
      }
      res.status(200).send(item);
    });

    /**
     * @swagger
     * /api/v1/quickaction/{id}/trigger:
     *   post:
     *     tags:
     *      - Quick Actions
     *     security:
     *      - bearerAuth: []
     *     summary: Trigger quick action
     *     description: Triggers quick action for authenticated user
     *     parameters:
     *      - in: path
     *        name: id
     *        schema:
     *         type: string
     *        required: true
     *        description: The quick action id
     *     responses:
     *       '200':
     *         description: OK
     *       '401':
     *         description: Not authenticated
     *       '404':
     *         description: Not Found
    */
    app?.post('/api/v1/quickaction/:id/trigger', authorize, async (req, res) => {
      const userId = req.headers.userid as string;
      const username = req.headers.username as string;
      try {
        const item = await getRepository(qa).findOneOrFail({ where: { id: req.params.id, userId } });
        this.trigger(item, { userId, username });
        res.status(200).send();
      } catch (e) {
        res.status(404).send('Not Found');
      }
    });

    /**
     * @swagger
     * /api/v1/quickaction/{id}:
     *   delete:
     *     tags:
     *      - Quick Actions
     *     security:
     *      - bearerAuth: []
     *     summary: Removes quick action
     *     description: Removes quick action for authenticated user
     *     parameters:
     *      - in: path
     *        name: id
     *        schema:
     *         type: string
     *        required: true
     *        description: The quick action id
     *     responses:
     *       '400':
     *         description: Bad request
     *       '401':
     *         description: Not authenticated
     *       '404':
     *         description: Not Found
    */
    app?.delete('/api/v1/quickaction/:id', authorize, async (req, res) => {
      const userId = req.headers.userid as string;
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
        res.status(400).send();
      }
    });
  }

  async trigger(item: QuickActions.Item, user: { userId: string, username: string }) {
    info(`Quick Action ${item.id} triggered by ${user.username}#${user.userId}`);
    switch (item.type) {
      case 'command': {
        const parser = new (require('../parser').default)();
        const responses = await parser.command(getUserSender(user.userId, user.username), item.options.command, true);
        for (let i = 0; i < responses.length; i++) {
          setTimeout(async () => {
            parserReply(await responses[i].response, { sender: responses[i].sender, attr: responses[i].attr });
          }, 500 * i);
        }

        break;
      }
    }
  }
}

export default new QuickAction();
