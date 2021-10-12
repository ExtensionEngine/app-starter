import { NextFunction, Request, Response } from 'express';
import autobind from 'auto-bind';
import { ErrorMiddleware } from '../types/middleware';
import { HttpError } from 'http-errors';
import Logger from 'bunyan';
import { ValidationError } from 'joi';

class ErrorHandler implements ErrorMiddleware {
  #logger: Logger;

  constructor(logger: Logger) {
    this.#logger = logger;
    autobind(this);
  }

  handle(error: HttpError, req: Request, res: Response, _: NextFunction): Response {
    const log = this.#logger.child({ route: req.originalUrl, query: req.query });
    log.error(error);
    const { statusCode } = error;
    const isValidationError = error instanceof ValidationError;
    const isHttpError = error instanceof HttpError;
    if (isValidationError) return res.status(400).json({ error });
    if (!isHttpError || statusCode === 500) return res.status(500).send();
    return res.status(statusCode).json({ error, statusCode });
  }
}

export default ErrorHandler;
