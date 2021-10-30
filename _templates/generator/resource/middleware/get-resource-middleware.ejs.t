---
to: "<%=
  `${h.getResourcePath(resource, path)}/middleware/get-${h.changeCase.paramCase(resource)}.ts`
%>"
---
import { NextFunction, Request, Response } from 'express';
import autobind from 'auto-bind';
import I<%= Resource = h.changeCase.pascalCase(resource) %>Repository from '../interfaces/repository';
import { IMiddleware } from '../../types/middleware';
import { NotFound } from 'http-errors';

class Get<%= Resource %>Middleware implements IMiddleware {
  #repository: I<%= Resource %>Repository;

  constructor(<%= resource = h.changeCase.camelCase(resource) %>Repository: I<%= Resource %>Repository) {
    this.#repository = <%= resource %>Repository;
    autobind(this);
  }

  async handle(
    req: Request,
    _: Response,
    next: NextFunction,
    id: string
  ): Promise<void> {
    const <%= resource %> = await this.#repository.findOne(Number(id));
    if (!<%= resource %>) throw new NotFound('<%= Resource %> not found');
    req.<%= resource %> = <%= resource %>;
    next();
  }
}

export default Get<%= Resource %>Middleware;