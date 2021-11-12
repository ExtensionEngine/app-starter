import { IErrorMiddleware, IMiddleware } from '../types/middleware';
import { Provider } from '../framework/provider';

type ServiceConstructor<T> = { new(...args: any[]): T };

export type MiddlewareConstructor = ServiceConstructor<IMiddleware | IErrorMiddleware>;

interface IModule {
  load(provider: Provider): void;
}

export default IModule;
