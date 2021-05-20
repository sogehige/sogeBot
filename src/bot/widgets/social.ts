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
     *      - in: header
     *        name: cursor
     *        schema:
     *         type: string
     *        description: Pagination cursor
     *     responses:
     *       '200':
     *         description: OK
     *       '401':
     *         description: Not authenticated
    */
    app?.get('/api/v1/social', authorize, async (req, res) => {
      const b64cookie = req.headers.cursor as string | undefined;

      let take =  25;
      let page = 0;
      let count = 0;

      if (b64cookie) {
        const cookie = JSON.parse(Buffer.from(b64cookie, 'base64').toString('utf-8'));
        take = cookie.take;
        page = cookie.page;
        count = cookie.count;
      }

      if (count === 0) {
        count = await getRepository(WidgetSocial).count();
      }

      const items = await getRepository(WidgetSocial).find({
        take,
        order: { timestamp: 'DESC' },
        skip:  page * take,
      });

      let cursor = null;
      if (count > take + (page * take)) {
        // we have some left, we need to generate new cursor
        cursor = Buffer.from(JSON.stringify({
          take: 25,
          page: page + 1,
          count,
        })).toString('base64');
      }
      res.send({
        data: items,
        count,
        cursor,
      });
    });
  }
}

export default new Social();
