
import rateLimit, { Options } from 'express-rate-limit';
import { RequestHandler } from 'express';

const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // every 15 minutes

export function requestLimiter(options?: Options): RequestHandler {
  const { max = 10, windowMs = DEFAULT_WINDOW_MS } = options || {};
  return rateLimit({ max, windowMs, ...options });
}
