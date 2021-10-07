import {
  FilterQuery,
  RequestContext,
  UniqueConstraintViolationException,
} from '@mikro-orm/core';
import find from 'lodash/find';
import P from 'bluebird';
import transform from 'lodash/transform';
import autobind from 'auto-bind';
import Db, { DatabaseProvider } from './database';

const pTuple = fn => P.try(fn).then(result => [null, result], err => [err]);

function processSearchKey(key, item) {
  if (!Array.isArray(key)) return { [key]: item[key] };
  return transform(key, (acc, searchKey) => (acc[searchKey] = item[searchKey]), {});
}

const getOrderedAttributeValues = (ModelName, dbProvider, item) => {
  const params = dbProvider.getMetadata().get(ModelName).constructorParams;
  return Object.values(transform(params, (acc, key) => acc[key] = item[key], {}));
}

type Options = {
  concurrency: number,
  modelSearchKey: string,
}

class RestoreService {
  #dbProvider: DatabaseProvider;

  constructor(db: Db) {
    this.#dbProvider = db.provider;
    autobind(this);
  }

  async restoreOrCreateAll(
    ModelName: string,
    Model,
    items: any[],
    where:  FilterQuery<any>,
    options: Options
  ): Promise<any[] | any> {
    const data = { tuples: [], users: [] };
    await RequestContext.createAsync(this.#dbProvider.em, async (): Promise<any[] | any> => {
      const { concurrency = 16, modelSearchKey = 'id' } = options || {};
      const repository = this.#dbProvider.em.getRepository(Model);
      const found = await repository.find(where);
      data.tuples = await P.map(items, item => pTuple(async () => {
        const searchKey = processSearchKey(modelSearchKey, item);
        const foundModel: typeof Model = find(found, searchKey);
        if (foundModel && !foundModel.deletedAt) {
          const err = new Error(`${ModelName} already exists`);
          throw new UniqueConstraintViolationException(err);
        }
        const attributeValues = getOrderedAttributeValues(ModelName, this.#dbProvider, item);
        const model = !foundModel && new Model(...attributeValues)
        if (foundModel) repository.assign(foundModel, { deletedAt: null });
        const resolvedModel = model || foundModel;
        data.users.push(resolvedModel);
        return resolvedModel;
      }), { concurrency });
      await repository.persistAndFlush(data.users);
    });
    return Array.isArray(items) ? data.tuples : data.tuples[0];
  }

  async restoreOrCreate(ModelName, Model, item, options) {
    const [result] = await this.restoreOrCreateAll(ModelName, Model, [item], item, options);
    return result;
  }
};

export default RestoreService;

