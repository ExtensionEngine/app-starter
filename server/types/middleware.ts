import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';

export interface ErrorMiddleware {
  handle(
    err: HttpError | Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> | Response;
}

export interface Middleware {
  handle(
    req: Request,
    res: Response,
    next: NextFunction,
    id?: string
  ): Promise<void> | void;
}
