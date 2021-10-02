---
to: "<%= `${h.getResourcePath(resource, path)}/controller.ts` %>"
---
import { Request, Response } from 'express';
import autobind from 'auto-bind';
import <%= Resource = h.capitalize(resource) %> from './model';
import I<%= Resource = h.capitalize(resource) %>Repository from './interfaces/repository';
import { IContainer } from 'bottlejs';

class <%= Resource %>Controller {
  #repository: I<%= Resource %>Repository;

  constructor({ <%= resource %>Repository }: IContainer) {
    this.#repository = <%= resource %>Repository;
    autobind(this);
  }

  async getAll(_: Request, res: Response): Promise<Response> {
    const data = await this.#repository.findAll();
    return res.json({ data });
  }

  async get({ params }: Request, res: Response): Promise<Response> {
    const id = Number(params.<%= h.inflection.camelize(resource, true) %>Id);
    const data = await this.#repository.findOne(id);
    return res.json({ data });
  }

  async post({ body }: Request, res: Response): Promise<Response> {
    const data = new <%= Resource %>();
    await this.#repository.persistAndFlush(data);
    return res.json({ data });
  }

  async patch({ params, body }: Request, res: Response): Promise<Response> {
    const id = Number(params.<%= h.inflection.camelize(resource, true) %>Id);
    const data = await this.#repository.findOne(id);
    this.#repository.assign(data, body);
    await this.#repository.flush();
    return res.json({ data });
  }
}

export default <%= Resource %>Controller;
