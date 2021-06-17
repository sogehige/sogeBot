import {
  Controller,
  Delete,
  Get,
  Path,
  Route,
  Security,
  Tags,
} from 'tsoa';
import { getRepository } from 'typeorm';

import { Permissions as PermissionsEntity, PermissionsInterface } from '../../database/entity/permissions';
import { cleanViewersCache } from '../../helpers/permissions';

@Route('/api/v1/settings/permissions')
@Tags('Settings / Permissions')
export class SettingsPermissionsController extends Controller {
  @Security('bearerAuth', [])
  @Get('/')
  public async getAll(): Promise<{ data: PermissionsInterface[], paging: null}> {
    cleanViewersCache();
    return {
      data: await getRepository(PermissionsEntity).find({
        relations: ['filters'],
        order:     { order: 'ASC' },
      }),
      paging: null,
    };
  }

  @Security('bearerAuth', [])
  @Get('/{id}')
  public async getOne(@Path() id: string): Promise<PermissionsInterface | void> {
    cleanViewersCache();
    return await getRepository(PermissionsEntity).findOne({
      where:     { id },
      relations: ['filters'],
      order:     { order: 'ASC' },
    });
  }

  @Security('bearerAuth', [])
  @Delete('/{id}')
  public async deleteOne(@Path() id: string): Promise<PermissionsInterface | void> {
    cleanViewersCache();
    await getRepository(PermissionsEntity).delete({ id: String(id) });
    return;
  }
}