---
to: "<%= `${h.getResourcePath(resource, path)}/controller.ts` %>"
---
import { Request, Response } from 'express';
import autobind from 'auto-bind';
import <%= Resource = h.changeCase.pascalCase(resource) %> from './model';
import I<%= Resource = h.changeCase.pascalCase(resource) %>Repository from './interfaces/repository';

class <%= Resource %>Controller {
  #repository: I<%= Resource %>Repository;

  constructor(<%= resource = h.changeCase.camelCase(resource) %>Repository: I<%= Resource %>Repository) {
    this.#repository = <%= resource %>Repository;
    autobind(this);
  }

  async list(_: Request, res: Response): Promise<Response> {
    const data = await this.#repository.findAll();
    return res.json({ data });
  }

  async get({ <%= resource %> }: Request, res: Response): Promise<Response> {
    return res.json({ data: <%= resource %> });
  }

  async create({ body }: Request, res: Response): Promise<Response> {
    const data = new <%= Resource %>();
    await this.#repository.persistAndFlush(data);
    return res.json({ data });
  }

    async update({ <%= resource %>, body }: Request, res: Response): Promise<Response> {
    this.#repository.assign(<%= resource %>, body);
    await this.#repository.flush();
    return res.json({ data: <%= resource %> });
  }
}

export default <%= Resource %>Controller;
