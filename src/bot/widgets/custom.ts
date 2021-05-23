import { getRepository } from 'typeorm';

import { WidgetCustom, WidgetCustomInterface } from '../database/entity/widget';
import { onStartup } from '../decorators/on';
import { error } from '../helpers/log';
import { app, authorize } from '../helpers/panel';
import Widget from './_interface';

class Custom extends Widget {
  @onStartup()
  enableAPI() {
    /**
     * @swagger
     * /api/v1/custom:
     *   get:
     *     tags:
     *      - Widgets
     *     security:
     *      - bearerAuth: []
     *     summary: Retrieve a list of custom urls for widget for authenticated user
     *     responses:
     *       '200':
     *         description: OK
     *       '401':
     *         description: Not authenticated
     *   post:
     *     tags:
     *      - Widgets
     *     security:
     *      - bearerAuth: []
     *     consumes:
     *      - application/json
     *     summary: Add new custom url item
     *     description: Add new custom url item for current authenticated user
     *     responses:
     *       '200':
     *         description: OK
     *       '401':
     *         description: Not authenticated
     *       '400':
     *         description: Bad request
    */
    app?.get('/api/v1/custom', authorize, async (req, res) => {
      const userId = req.headers.userid as string;

      const [items, count] = await getRepository(WidgetCustom).findAndCount({
        where: { userId },
        order: { name: 'DESC' },
      });

      res.send({
        data: items,
        count,
      });
    });
    app?.post('/api/v1/custom/', authorize, async (req, res) => {
      const userId = req.headers.userid as string;
      const item = req.body as WidgetCustomInterface;
      try {
        await getRepository(WidgetCustom).save({ ...item, userId });
      } catch (e) {
        res.status(400).send(e);
      }
      res.status(200).send(item);
    });

    /**
     * @swagger
     * /api/v1/custom/{id}:
     *   delete:
     *     tags:
     *      - Widgets
     *     security:
     *      - bearerAuth: []
     *     summary: Removes custom url from widget
     *     description: Removes custom url from widget for authenticated user
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
    app?.delete('/api/v1/custom/:id', authorize, async (req, res) => {
      const userId = req.headers.userid as string;
      try {
        const item = await getRepository(WidgetCustom).findOneOrFail({ id: req.params.id, userId: String(userId) });

        await getRepository(WidgetCustom).remove(item);
        res.status(404).send('Not Found');
      } catch (e) {
        error(e);
        res.status(400).send();
      }
    });
  }
}

export default new Custom();
