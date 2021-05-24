import {
  Get,
  Request,
  Response,
  Route,
  Security,
  Tags,
} from 'tsoa';
import { getRepository } from 'typeorm';

import { QuickAction, QuickActions } from '../database/entity/dashboard';

@Route('/api/v1/quickaction')
@Tags('Quick Actions')
@Security('bearerAuth', [])
export class QuickActionController {
  /**
  * Retrieves the quick actions of an authenticated user.
  */
  @Response<string>(401, 'Unauthorized')
  @Get()
  public async get(@Request() req: any): Promise<{ data: QuickActions.Item[], paging: null}> {
    const userId = req.user.userId as string;
    const actions = await getRepository(QuickAction).find({ where: { userId } });
    return {
      data:   actions,
      paging: null,
    };
  }
}