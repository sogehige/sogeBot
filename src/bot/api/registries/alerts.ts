import {
  Body,
  Controller,
  Delete,
  Get,
  Hidden,
  Path,
  Post,
  Query,
  Request,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { getRepository } from 'typeorm';

import {
  Alert, AlertInterface, AlertMedia,
} from '../../database/entity/alert';

@Route('/api/v1/registry/alerts')
@Tags('Registries / Alerts')
export class RegistryAlertsController extends Controller {
  @Get('/settings')
  public async getSettings(
    @Query() name: 'areAlertsMuted' | 'isSoundMuted' | 'isTTSMuted',
  ): Promise<boolean> {
    const alerts = (await import('../../registries/alerts')).default;
    switch(name) {
      case 'areAlertsMuted':
        return alerts.areAlertsMuted;
      case 'isSoundMuted':
        return alerts.isSoundMuted;
      case 'isTTSMuted':
        return alerts.isTTSMuted;
    }
  }

  @Post('/settings')
  @Security('bearerAuth', [])
  public async postSettings(
    @Query() name: 'areAlertsMuted' | 'isSoundMuted' | 'isTTSMuted',
      @Body() body: { value: boolean },
  ): Promise<void> {
    const alerts = (await import('../../registries/alerts')).default;
    switch(name) {
      case 'areAlertsMuted':
        alerts.areAlertsMuted = body.value;
        break;
      case 'isSoundMuted':
        alerts.isSoundMuted = body.value;
        break;
      case 'isTTSMuted':
        alerts.isTTSMuted = body.value;
        break;
    }
    this.setStatus(201);
    return;
  }

  @Hidden()
  @Get('/image/{id}')
  public async getImage(@Request() request: any, @Path() id: string) {
    try {
      const res = (<any>request).res;
      const media = await getRepository(AlertMedia).find({ id });
      const b64data = media.sort((a,b) => a.chunkNo - b.chunkNo).map(o => o.b64data).join('');
      if (b64data.trim().length === 0) {
        throw new Error();
      } else {
        const match = (b64data.match(/^data:\w+\/\w+;base64,/) || [ 'data:image/gif;base64,' ])[0];
        const data = Buffer.from(b64data.replace(/^data:\w+\/\w+;base64,/, ''), 'base64');
        res.writeHead(200, {
          'Content-Type':   match.replace('data:', '').replace(';base64,', ''),
          'Content-Length': data.length,
        });
        res.end(data);
      }
    } catch (e) {
      this.setStatus(404);
    }
    return;
  }

  @Get('/')
  public async getAll(): Promise<{ data: AlertInterface[], paging: null}> {
    return {
      data:   await getRepository(Alert).find({ relations: ['rewardredeems', 'cmdredeems', 'cheers', 'follows', 'hosts', 'raids', 'resubs', 'subcommunitygifts', 'subgifts', 'subs', 'tips'] }),
      paging: null,
    };
  }

  @Response('404', 'Not Found')
  @Get('/{id}')
  public async getOne(@Path() id: string): Promise<AlertInterface | void> {
    try {
      const item = await getRepository(Alert).findOneOrFail({ where: { id }, relations: ['rewardredeems', 'cmdredeems', 'cheers', 'follows', 'hosts', 'raids', 'resubs', 'subcommunitygifts', 'subgifts', 'subs', 'tips'] });
      return item;
    } catch (e) {
      this.setStatus(404);
    }
    return;
  }

  @SuccessResponse('201', 'Created')
  @Response('401', 'Unauthorized')
  @Security('bearerAuth', [])
  @Post()
  public async post(@Body() requestBody: AlertInterface): Promise<void> {
    try {
      await getRepository(Alert).save(requestBody);
      this.setStatus(201);

    } catch (e) {
      this.setStatus(400);
    }
    return;
  }

  @SuccessResponse('201', 'Created')
  @Response('401', 'Unauthorized')
  @Security('bearerAuth', [])
  @Post('/media/?_action=clone')
  public async cloneMedia(@Body() toClone: { '0': string, '1': string }): Promise<void> {
    try {
      const { primaryId, ...item } = await getRepository(AlertMedia).findOneOrFail({ id: toClone['0'] });
      await getRepository(AlertMedia).save({
        ...item,
        id: toClone['1'],
      });
      this.setStatus(201);

    } catch (e) {
      this.setStatus(400);
    }
    return;
  }

  @Security('bearerAuth', [])
  @Delete('/media/{id}')
  public async deleteMedia(@Path() id: string): Promise<void> {
    try {
      await getRepository(AlertMedia).delete({ id: String(id) }),
      this.setStatus(201);

    } catch (e) {
      this.setStatus(400);
    }
    return;
  }
}