import { getRepository } from 'typeorm';

import { WidgetSocial } from '../database/entity/widget';
import { onStartup } from '../decorators/on';
import { app, authorize } from '../helpers/panel';
import Widget from './_interface';

class Social extends Widget {
  @onStartup()
  enableAPI() {
    /**
     * @swagger
     * /api/v1/social:
     *   get:
     *     tags:
     *      - Widgets
     *     security:
     *      - bearerAuth: []
     *     summary: Retrieve a list of social interactions on twitter
     *     parameters:
     *      - in: query
     *        name: _page
     *        schema:
     *          type: number
     *        required: false
     *      - in: query
     *        name: _limit
     *        schema:
     *          type: number
     *        required: false
     *     responses:
     *       '200':
     *         description: OK
     *       '401':
     *         description: Not authenticated
    */
    app?.get('/api/v1/social', authorize, async (req, res) => {
      const page = req.query._page ? Number(req.query._page) : 0;
      const limit = req.query._limit ? Number(req.query._limit) : 0;

      const count = await getRepository(WidgetSocial).count();
      const items = await getRepository(WidgetSocial).find({
        take:  limit,
        order: { timestamp: 'DESC' },
        skip:  page * limit,
      });
      res.send({
        data:   items,
        paging: {
          count, _limit: limit, _page: page,
        },
      });
    });
  }
}

export default new Social();
