import type Koa from 'koa';
import { Entity } from '../../../shared/types';

import {
  validateReleaseAction,
  validateReleaseActionUpdateSchema,
} from './validation/release-action';
import type {
  CreateReleaseAction,
  GetReleaseActions,
  ReleaseAction,
  UpdateReleaseAction,
  DeleteReleaseAction,
} from '../../../shared/contracts/release-actions';
import { getService } from '../utils';
import { RELEASE_ACTION_MODEL_UID } from '../constants';

interface Locale extends Entity {
  name: string;
  code: string;
}

type LocaleDictionary = {
  [key: Locale['code']]: Pick<Locale, 'name' | 'code'>;
};

const releaseActionController = {
  async create(ctx: Koa.Context) {
    const releaseId: CreateReleaseAction.Request['params']['releaseId'] = ctx.params.releaseId;
    const releaseActionArgs: CreateReleaseAction.Request['body'] = ctx.request.body;

    await validateReleaseAction(releaseActionArgs);

    const releaseService = getService('release', { strapi });
    const releaseAction = await releaseService.createAction(releaseId, releaseActionArgs);

    ctx.body = {
      data: releaseAction,
    };
  },
  async findMany(ctx: Koa.Context) {
    const releaseId: GetReleaseActions.Request['params']['releaseId'] = ctx.params.releaseId;
    const permissionsManager = strapi.admin.services.permission.createPermissionsManager({
      ability: ctx.state.userAbility,
      model: RELEASE_ACTION_MODEL_UID,
    });

    const releaseService = getService('release', { strapi });
    const query = await permissionsManager.sanitizeQuery(ctx.query);
    const { results, pagination } = await releaseService.findActions(releaseId, query);

    // Create a dictionary of all contentTypes in order to look up meta data (mainField, displayName)
    const allReleaseContentTypesDictionary = await releaseService.getAllContentTypesMetaData(releaseId);
    // Create a dictionary of all locales in order to look up meta data (locale name)
    const allLocales: Locale[] = await strapi.plugin('i18n').service('locales').find();
    const localeDictionary = allLocales.reduce<LocaleDictionary>((acc, locale): any => {
      acc[locale.code] = { name: locale.name, code: locale.code };

      return acc;
    }, {});

    const data = results.map((action: ReleaseAction) => {
      return {
        ...action,
        entry: {
          id: action.entry.id,
          meta: {
            contentType: allReleaseContentTypesDictionary[action.contentType],
            locale: localeDictionary[action.entry.locale],
          },
        },
      };
    });

    ctx.body = {
      data,
      meta: {
        pagination,
      },
    };
  },

  async update(ctx: Koa.Context) {
    const actionId: UpdateReleaseAction.Request['params']['actionId'] = ctx.params.actionId;
    const releaseId: UpdateReleaseAction.Request['params']['releaseId'] = ctx.params.releaseId;
    const releaseActionUpdateArgs: UpdateReleaseAction.Request['body'] = ctx.request.body;

    await validateReleaseActionUpdateSchema(releaseActionUpdateArgs);

    const releaseService = getService('release', { strapi });
    const updatedAction = await releaseService.updateAction(
      actionId,
      releaseId,
      releaseActionUpdateArgs
    );

    ctx.body = {
      data: updatedAction,
    };
  },
  async delete(ctx: Koa.Context) {
    const actionId: DeleteReleaseAction.Request['params']['actionId'] = ctx.params.actionId;
    const releaseId: DeleteReleaseAction.Request['params']['releaseId'] = ctx.params.releaseId;

    const deletedReleaseAction = await getService('release', { strapi }).deleteAction(
      actionId,
      releaseId
    );

    ctx.body = {
      data: deletedReleaseAction,
    };
  },
};

export default releaseActionController;
